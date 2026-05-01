#!/usr/bin/env node
import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
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
  const options = parsePlaytestArgs(argv);

  if (options.help) {
    console.log(createHelpText());
    return null;
  }

  await loadPlaytestEnv(repoRoot);

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
  const session = `ayi-${Date.now().toString(36)}`;

  await ensureLocalApp(options.baseUrl);

  const browser = createBrowserClient({
    baseUrl: options.baseUrl,
    session,
    syntheticUserId,
  });
  const startedAt = new Date().toISOString();
  const turns = [];

  await browser.open("/player/new");
  await browser.fill('input[name="character-name"]', persona.name);
  await browser.fill('input[name="character-age"]', String(persona.age));
  await browser.fill('input[name="character-location"]', persona.location);
  await browser.fill('input[name="character-occupation"]', persona.occupation);
  await browser.fill('textarea[name="character-bio"]', persona.bio);
  await browser.click('button:has-text("Create Player")');
  await browser.wait(1500);

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
  await browser.click('button:has-text("Send")');
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
    await browser.click('button:has-text("NO")');
  } else if (choiceTurn.choice === "DEFERRED") {
    await browser.fill("#first-reveal-text-response", choiceTurn.responseText);
    await browser.click('button:has-text("Continue")');
  } else {
    await browser.click('button:has-text("YES")');
  }
  await browser.wait(4000);

  const outcomeText = await browser.getBodyText();
  turns.push({
    gameText: outcomeText,
    label: "First branch outcome",
    persona: {
      choice: "DEFERRED",
      confusionLevel: choiceTurn.confusionLevel,
      emotionalState: "absorbing the first consequence",
      engagementLevel: choiceTurn.engagementLevel,
      intent: "observe the game response",
      responseText: "(The persona reads the consequence before deciding what to do next.)",
      trustLevel: choiceTurn.trustLevel,
    },
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
    "  --scenario <name>   Scenario label for the run",
    "  --build <version>   Override build version label",
    "  --base-url <url>    Local app URL, default http://localhost:3000",
    "  --max-turns <n>     Stop after this many captured player turns",
    "  --seed <text>       Random persona seed/inspiration",
  ].join("\n");
}

function createBrowserClient({ baseUrl, session, syntheticUserId }) {
  const headers = JSON.stringify({
    "x-areyouin-playtest": "1",
    "x-areyouin-playtest-user": syntheticUserId,
  });

  async function run(command, args = [], options = {}) {
    const browserArgs = [
      "--session",
      session,
      "--headers",
      headers,
      command,
      ...args.map(String),
    ];
    const { stdout, stderr } = await execFileAsync("agent-browser", browserArgs, {
      cwd: repoRoot,
      env: {
        ...process.env,
        AREYOUIN_PLAYTEST_AUTH: "1",
      },
      maxBuffer: 1024 * 1024 * 5,
    });

    if (options.allowFailure) {
      return stdout || stderr;
    }

    return stdout;
  }

  return {
    click: (selector) => run("click", [selector]),
    fill: (selector, value) => run("fill", [selector, value]),
    getBodyText: async () => {
      const text = await run("eval", [createMainTextEval()]);

      return normalizeCapturedGameText(text);
    },
    open: (pathname) => run("open", [new URL(pathname, baseUrl).toString()]),
    wait: (ms) => run("wait", [String(ms)]),
  };
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
      if (normalized) lines.push(normalized);
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
  await browser.click('button:has-text("Continue")');
  await browser.wait(1500);
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
  await browser.click('button:has-text("Send")');
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
