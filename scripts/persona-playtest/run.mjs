#!/usr/bin/env node
import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildSyntheticUserId,
  generatePersona,
  generatePlayerTurn,
  generateRunAnalysis,
  loadBuildVersion,
  loadPlaytestEnv,
  normalizeCapturedGameText,
  parsePlaytestArgs,
  slugify,
  writePlaytestReport,
} from "./core.mjs";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");

export async function runPersonaPlaytest(argv = process.argv.slice(2)) {
  await loadPlaytestEnv(repoRoot);
  const options = parsePlaytestArgs(argv);

  if (options.help) {
    console.log(createHelpText());
    return null;
  }

  const llmModel = getPlaytestModel();
  const build = await loadBuildVersion(repoRoot);
  const buildVersion = options.build || build.version;
  const persona = await generatePersona({
    model: llmModel,
    personaPrompt: options.persona,
    random: options.random,
    seed: options.seed,
  });
  const personaSlug = slugify(persona.name);
  const runId = [
    buildVersion,
    options.scenario,
    personaSlug,
    new Date().toISOString().replace(/[:.]/g, "-"),
  ].map(slugify).join("__");
  const syntheticUserId = buildSyntheticUserId({
    build: buildVersion,
    personaSlug,
    runSlug: runId.split("__").at(-1),
    scenario: options.scenario,
  });
  const browserRuntime = await createAgentBrowserRuntime({ runId });

  await ensureLocalApp(options.baseUrl);

  const browser = createBrowserClient({
    baseUrl: options.baseUrl,
    runtime: browserRuntime,
    syntheticUserId,
  });
  console.log(`Agent-browser session: ${browserRuntime.session}`);
  console.log(`Agent-browser profile: ${path.relative(repoRoot, browserRuntime.profileDir)}`);
  const startedAt = new Date().toISOString();
  const turns = [];

  await browser.open("/player/new");
  await assertSyntheticAuthReachedPlayerForm(browser, options.baseUrl);
  await browser.fill('input[name="character-name"]', persona.name);
  await browser.fill('input[name="character-age"]', String(persona.age));
  await browser.fill('input[name="character-location"]', persona.location);
  await browser.fill('input[name="character-occupation"]', persona.occupation);
  await browser.fill('textarea[name="character-bio"]', persona.bio);
  await browser.click(".hero-create-account");
  await waitForPostCreationEntry(browser);

  await acceptAgreementIfPresent(browser);

  const openingGameText = await browser.getBodyText();
  const openingTurn = await generatePlayerTurn({
    gameText: openingGameText,
    model: llmModel,
    persona,
    scenario: options.scenario,
    transcript: turns,
    turnKind: "opening_response",
  });
  turns.push({
    gameText: openingGameText,
    label: "Opening prompt",
    persona: openingTurn,
  });
  await browser.fill('textarea[name="opening-response"]', openingTurn.responseText);
  await browser.clickEnabledButton("Send");
  await browser.wait(3000);

  if (turns.length >= options.maxTurns) {
    return await finishRun({
      build,
      buildVersion,
      completedAt: new Date().toISOString(),
      model: llmModel,
      persona,
      runId,
      scenario: options.scenario,
      startedAt,
      syntheticUserId,
      turns,
    });
  }

  await answerOpeningContextIfPresent({ browser, model: llmModel, persona, scenario: options.scenario, turns });
  await waitForReveal(browser);

  const revealGameText = await browser.getBodyText();
  const choiceTurn = await generatePlayerTurn({
    gameText: revealGameText,
    model: llmModel,
    persona,
    scenario: options.scenario,
    transcript: turns,
    turnKind: "first_choice",
  });

  if (/\byes\b/i.test(options.scenario)) {
    choiceTurn.choice = "YES";
  } else if (/\bno\b/i.test(options.scenario)) {
    choiceTurn.choice = "NO";
  }

  turns.push({
    gameText: revealGameText,
    label: "First reveal",
    persona: choiceTurn,
  });

  if (turns.length >= options.maxTurns) {
    return await finishRun({
      build,
      buildVersion,
      completedAt: new Date().toISOString(),
      model: llmModel,
      persona,
      runId,
      scenario: options.scenario,
      startedAt,
      syntheticUserId,
      turns,
    });
  }

  if (choiceTurn.choice === "NO") {
    await browser.clickExactButton("NO");
  } else if (choiceTurn.choice === "DEFERRED") {
    await browser.fill("#first-reveal-text-response", choiceTurn.responseText);
    await browser.clickEnabledButton("Continue");
  } else {
    await browser.clickExactButton("YES");
  }
  await waitForChoiceResolution(browser);

  await continueThroughActionPrompts({
    browser,
    maxTurns: options.maxTurns,
    model: llmModel,
    persona,
    scenario: options.scenario,
    turns,
  });

  return await finishRun({
    build,
    buildVersion,
    completedAt: new Date().toISOString(),
    model: llmModel,
    persona,
    runId,
    scenario: options.scenario,
    startedAt,
    syntheticUserId,
    turns,
  });
}

async function continueThroughActionPrompts({
  browser,
  maxTurns,
  model,
  persona,
  scenario,
  turns,
}) {
  let currentText = await browser.getBodyText();
  let actionCount = 0;

  while (turns.length < maxTurns) {
    const canSubmitAction = await browser.hasEnabledActionPrompt();

    if (!canSubmitAction) {
      break;
    }

    actionCount += 1;
    const actionTurn = await generatePlayerTurn({
      gameText: currentText,
      model,
      persona,
      scenario,
      transcript: turns,
      turnKind: "post_choice_action",
    });

    turns.push({
      gameText: currentText,
      label:
        actionCount === 1
          ? "First branch outcome"
          : `Continuation prompt ${actionCount}`,
      persona: actionTurn,
    });

    await browser.fill("#first-post-choice-action", actionTurn.responseText);
    await browser.clickEnabledButton("Continue");
    currentText = await waitForActionResolution(browser, currentText, 45000);
  }

  if (currentText && turns.at(-1)?.gameText !== currentText) {
    turns.push({
      gameText: currentText,
      label: "Final observed state",
      persona: {
        choice: "DEFERRED",
        confusionLevel: turns.at(-1)?.persona.confusionLevel ?? 0.4,
        emotionalState: "observing where the current build stops",
        engagementLevel: turns.at(-1)?.persona.engagementLevel ?? 0.7,
        intent: "record the current end of the implemented flow",
        responseText:
          "(The runner stops here because the current build has no enabled next action, or the turn limit was reached.)",
        trustLevel: turns.at(-1)?.persona.trustLevel ?? 0.35,
      },
    });
  }
}

function getPlaytestModel() {
  return process.env.PLAYTEST_OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini";
}

async function finishRun({
  build,
  buildVersion,
  completedAt,
  model,
  persona,
  runId,
  scenario,
  startedAt,
  syntheticUserId,
  turns,
}) {
  const runWithoutAnalysis = {
    build: {
      ...build,
      version: buildVersion,
    },
    completedAt,
    id: runId,
    persona,
    scenario,
    startedAt,
    syntheticUserId,
    turns,
  };
  const analysis = await generateRunAnalysis({
    model,
    persona,
    run: runWithoutAnalysis,
  });
  const run = {
    ...runWithoutAnalysis,
    analysis,
  };
  const { reportRelativePath } = await writePlaytestReport({ repoRoot, run });

  console.log(`Persona playthrough complete: ${persona.name}`);
  console.log(`Report: ${reportRelativePath}`);
  console.log(`Status: ${analysis.status}`);
  if (analysis.topFindings[0]) {
    console.log(`Top finding: ${analysis.topFindings[0].title}`);
  }

  return run;
}

function createHelpText() {
  return [
    "Usage:",
    '  pnpm playtest:persona -- "a teacher in Australia"',
    "  pnpm playtest:persona -- --random",
    "  pnpm playtest:persona -- --random --scenario yes-connected-path --seed friday",
    "",
    "Options:",
    "  --persona <text>    Persona request to expand",
    "  --random            Invent a grounded random persona",
    "  --scenario <name>   Scenario label for the run, default yes-connected-path",
    "  --build <version>   Override build version label",
    "  --base-url <url>    Local app URL, default AREYOUIN_PORTLESS_URL or http://localhost:3000",
    "  --max-turns <n>     Stop after this many player response turns, default 10",
    "  --seed <text>       Random persona seed/inspiration",
  ].join("\n");
}

async function createAgentBrowserRuntime({ runId }) {
  const branch = await getCurrentBranch();
  const branchSlug = slugify(branch || "worktree").slice(0, 32);
  const runSlug = slugify(runId.split("__").at(-1) || Date.now().toString(36)).slice(0, 36);
  const session = `ayi-${branchSlug}-${runSlug}`;
  const runtimeDir = path.join(repoRoot, ".agent-browser-worktree");
  const profileDir = path.join(runtimeDir, "profiles", runId);
  const downloadDir = path.join(runtimeDir, "downloads", runId);
  const screenshotDir = path.join(runtimeDir, "screenshots", runId);
  const configPath = path.join(runtimeDir, "config.json");

  await Promise.all([
    mkdir(profileDir, { recursive: true }),
    mkdir(downloadDir, { recursive: true }),
    mkdir(screenshotDir, { recursive: true }),
  ]);

  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        downloadPath: downloadDir,
        profile: profileDir,
        session,
      },
      null,
      2,
    )}\n`,
  );

  return {
    configPath,
    downloadDir,
    profileDir,
    runtimeDir,
    screenshotDir,
    session,
  };
}

async function getCurrentBranch() {
  try {
    const { stdout } = await execFileAsync("git", ["branch", "--show-current"], {
      cwd: repoRoot,
      timeout: 5000,
    });

    return stdout.trim();
  } catch {
    return "worktree";
  }
}

function createBrowserClient({ baseUrl, runtime, syntheticUserId }) {
  const headers = JSON.stringify({
    "x-areyouin-playtest": "1",
    "x-areyouin-playtest-user": syntheticUserId,
  });

  async function run(command, args = [], options = {}) {
    const browserArgs = [
      "--session",
      runtime.session,
      "--config",
      runtime.configPath,
      "--profile",
      runtime.profileDir,
      "--headers",
      headers,
      command,
      ...args.map(String),
    ];
    const { stdout, stderr } = await execFileAsync("agent-browser", browserArgs, {
      cwd: repoRoot,
      env: {
        ...process.env,
        AGENT_BROWSER_CONFIG: runtime.configPath,
        AGENT_BROWSER_DOWNLOAD_PATH: runtime.downloadDir,
        AGENT_BROWSER_PROFILE: runtime.profileDir,
        AGENT_BROWSER_SESSION: runtime.session,
        AREYOUIN_PLAYTEST_AUTH: "1",
      },
      maxBuffer: 1024 * 1024 * 5,
    });

    if (options.allowFailure) {
      return stdout || stderr;
    }

    return stdout;
  }

  async function hasSelector(selector) {
    const result = await run("eval", [
      `(() => Boolean(document.querySelector(${JSON.stringify(selector)})))()`,
    ]);

    return result.trim() === "true";
  }

  return {
    click: (selector) => run("click", [selector]),
    clickExactButton: (label) =>
      run("eval", [
        `(() => {
          const label = ${JSON.stringify(label)};
          const normalize = (value) => value.replace(/\\s+/g, " ").trim().toLowerCase();
          const button = Array.from(document.querySelectorAll("button"))
            .find((candidate) => normalize(candidate.innerText) === normalize(label) && !candidate.disabled);
          if (!button) throw new Error("Button not found: " + label);
          button.click();
          return true;
        })()`,
      ]),
    clickEnabledButton: (label) =>
      run("eval", [
        `(() => {
          const label = ${JSON.stringify(label)};
          const normalize = (value) => value.replace(/\\s+/g, " ").trim().toLowerCase();
          const button = Array.from(document.querySelectorAll("button"))
            .find((candidate) => normalize(candidate.innerText) === normalize(label) && !candidate.disabled);
          if (!button) throw new Error("Enabled button not found: " + label);
          button.click();
          return true;
        })()`,
      ]),
    eval: (script) => run("eval", [script]),
    fill: (selector, value) => run("fill", [selector, value]),
    getBodyText: async () => {
      const text = await run("eval", [createMainTextEval()]);

      return normalizeCapturedGameText(text);
    },
    getUrl: () => run("get", ["url"]),
    hasCharacterForm: async () => {
      const result = await run("eval", [
        `Boolean(document.querySelector('input[name="character-name"]'))`,
      ]);

      return result.trim() === "true";
    },
    hasEnabledActionPrompt: async () => {
      const result = await run("eval", [
        `(() => {
          const input = document.querySelector("#first-post-choice-action");
          return Boolean(input && !input.disabled && input.offsetParent !== null);
        })()`,
      ]);

      return result.trim() === "true";
    },
    hasSelector,
    isActionPromptCleared: async () => {
      const result = await run("eval", [
        `(() => {
          const input = document.querySelector("#first-post-choice-action");
          return !input || input.value.trim() === "";
        })()`,
      ]);

      return result.trim() === "true";
    },
    open: (pathname) => run("open", [new URL(pathname, baseUrl).toString()]),
    wait: (ms) => run("wait", [String(ms)]),
    waitForSelector: async (selector, timeoutMs = 8000) => {
      const startedAt = Date.now();

      while (Date.now() - startedAt < timeoutMs) {
        if (await hasSelector(selector)) {
          return;
        }

        await run("wait", ["250"]);
      }

      throw new Error(`Timed out waiting for selector: ${selector}`);
    },
  };
}

async function assertSyntheticAuthReachedPlayerForm(browser, baseUrl) {
  if (await browser.hasCharacterForm()) {
    return;
  }

  const currentUrl = (await browser.getUrl()).trim();

  throw new Error(
    [
      "Synthetic playtest auth did not reach /player/new.",
      `Current URL: ${currentUrl || "unknown"}`,
      "Start the local app with AREYOUIN_PLAYTEST_AUTH=1 or stop the existing dev server so this runner can start one.",
      `Target base URL: ${baseUrl}`,
    ].join(" "),
  );
}

function createMainTextEval() {
  return `(() => {
    const root = document.querySelector("main") || document.body;
    const excluded = [
      "script",
      "style",
      "noscript",
      "[hidden]",
      "[aria-hidden='true']",
      "[aria-label='Open admin dashboard']",
      "[aria-label='Open reset options']",
      "[aria-label='Account and display settings']",
      "[data-playtest-secondary='true']",
      ".absolute.right-4.bottom-4",
      ".fixed"
    ].join(",");
    const selector = [
      "h1",
      "h2",
      "h3",
      "p",
      "blockquote",
      "summary",
      "label",
      "button",
      "textarea",
      "input",
      "dt",
      "dd",
      "time"
    ].join(",");
    const lines = [];

    for (const element of root.querySelectorAll(selector)) {
      if (element.closest(excluded)) continue;
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const text = "value" in element && element.value
        ? element.value
        : element.innerText || element.textContent || "";
      const normalized = text.replace(/\\s+/g, " ").trim();
      if (!normalized) continue;
      lines.push(
        element.tagName.toLowerCase() === "blockquote"
          ? "Prior player action: " + normalized
          : normalized
      );
    }

    return Array.from(new Set(lines)).join("\\n");
  })()`;
}

async function ensureLocalApp(baseUrl) {
  if (await canReach(baseUrl)) {
    return;
  }

  console.log(`Local app was not reachable at ${baseUrl}; starting pnpm dev.`);
  const child = spawn("pnpm", ["dev"], {
    cwd: repoRoot,
    detached: true,
    env: {
      ...process.env,
      AREYOUIN_PLAYTEST_AUTH: "1",
    },
    stdio: "ignore",
  });

  child.unref();

  for (let attempt = 0; attempt < 45; attempt += 1) {
    await wait(2000);

    if (await canReach(baseUrl)) {
      return;
    }
  }

  throw new Error(`Unable to start local app at ${baseUrl}.`);
}

async function canReach(baseUrl) {
  try {
    const response = await fetch(baseUrl, { redirect: "manual" });

    return response.status < 500;
  } catch {
    return false;
  }
}

async function acceptAgreementIfPresent(browser) {
  const text = await browser.getBodyText();

  if (!/Before we begin/i.test(text)) {
    return;
  }

  await browser.click('input[type="checkbox"]');
  await browser.wait(250);
  await browser.clickEnabledButton("Continue");
  await browser.waitForSelector('textarea[name="opening-response"]', 30000);
}

async function waitForPostCreationEntry(browser) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await browser.hasSelector('textarea[name="opening-response"]')) {
      return;
    }

    const text = await browser.getBodyText();

    if (/Before we begin/i.test(text)) {
      return;
    }

    await browser.wait(500);
  }

  throw new Error("Timed out waiting for post-creation game entry.");
}

async function waitForChoiceResolution(browser) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await browser.hasSelector("#first-post-choice-action")) {
      return;
    }

    await browser.wait(500);
  }

  throw new Error("Timed out waiting for YES/NO choice resolution.");
}

async function waitForActionResolution(browser, previousText, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    await browser.wait(750);

    const nextText = await browser.getBodyText();

    if (
      nextText &&
      nextText !== previousText &&
      (await browser.isActionPromptCleared())
    ) {
      return nextText;
    }
  }

  throw new Error("Timed out waiting for branch action resolution.");
}

async function answerOpeningContextIfPresent({
  browser,
  model,
  persona,
  scenario,
  turns,
}) {
  const text = await browser.getBodyText();

  if (!/needs one detail before the moment can continue/i.test(text)) {
    return;
  }

  const contextTurn = await generatePlayerTurn({
    gameText: text,
    model,
    persona,
    scenario,
    transcript: turns,
    turnKind: "opening_context_answer",
  });
  turns.push({
    gameText: text,
    label: "Opening context follow-up",
    persona: contextTurn,
  });
  await browser.fill('textarea[name="opening-scene-context-answer"]', contextTurn.responseText);
  await browser.clickEnabledButton("Send");
  await browser.wait(3000);
}

async function waitForReveal(browser) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const text = await browser.getBodyText();

    if (/Are you in\?/i.test(text)) {
      return;
    }

    await browser.wait(1500);
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPersonaPlaytest().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
