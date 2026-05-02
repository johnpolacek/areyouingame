import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const defaultScenario = "yes-connected-path";
export const playtestIndexJsonPath = "wiki/playtests/index.json";
export const playtestIndexMarkdownPath = "wiki/playtests/index.md";

export function parsePlaytestArgs(argv) {
  const options = {
    baseUrl: getDefaultBaseUrl(),
    build: null,
    maxTurns: 10,
    persona: "",
    random: false,
    scenario: defaultScenario,
    seed: "",
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--random") {
      options.random = true;
    } else if (arg === "--persona") {
      options.persona = readFlagValue(argv, ++index, arg);
    } else if (arg === "--scenario") {
      options.scenario = readFlagValue(argv, ++index, arg);
    } else if (arg === "--build") {
      options.build = readFlagValue(argv, ++index, arg);
    } else if (arg === "--base-url") {
      options.baseUrl = readFlagValue(argv, ++index, arg);
    } else if (arg === "--max-turns") {
      options.maxTurns = Number.parseInt(readFlagValue(argv, ++index, arg), 10);
    } else if (arg === "--seed") {
      options.seed = readFlagValue(argv, ++index, arg);
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (!options.persona && positional.length > 0) {
    options.persona = positional.join(" ").trim();
  }

  if (!options.random && !options.persona) {
    options.random = true;
  }

  if (!Number.isInteger(options.maxTurns) || options.maxTurns < 1) {
    throw new Error("--max-turns must be a positive integer.");
  }

  return options;
}

export function getDefaultBaseUrl() {
  return process.env.AREYOUIN_PORTLESS_URL || "http://localhost:3000";
}

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "playtest";
}

export function buildSyntheticUserId({ build, personaSlug, runSlug, scenario }) {
  return [
    "playtest",
    slugify(build),
    slugify(personaSlug),
    slugify(scenario),
    runSlug ? slugify(runSlug).slice(0, 20) : "",
  ].filter(Boolean).join(":");
}

export function normalizeCapturedGameText(text) {
  const parsedText = parseMaybeJsonString(text);
  const lines = parsedText
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isNonGameplayLine(line))
    .filter((line, index, allLines) => {
      const previousLine = allLines[index - 1];

      return !previousLine || !previousLine.includes(line);
    });
  const cleaned = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return cleaned || parsedText.trim();
}

export async function loadBuildVersion(repoRoot) {
  const raw = await readFile(path.join(repoRoot, "build-version.json"), "utf8");
  const buildVersion = JSON.parse(raw);

  return buildVersion;
}

export async function loadPlaytestEnv(repoRoot) {
  for (const fileName of [".env.worktree.local", ".env.local", ".env"]) {
    try {
      const raw = await readFile(path.join(repoRoot, fileName), "utf8");
      const values = parseEnvFile(raw);

      for (const [key, value] of Object.entries(values)) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }
}

export function parseEnvFile(raw) {
  const values = {};

  for (const rawLine of String(raw).split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(
      line,
    );

    if (!match) {
      continue;
    }

    values[match[1]] = parseEnvValue(match[2]);
  }

  return values;
}

export async function generatePersona({
  model,
  personaPrompt,
  random,
  seed,
}) {
  if (!process.env.OPENAI_API_KEY) {
    return random
      ? createFallbackRandomPersona(seed)
      : createFallbackRequestedPersona(personaPrompt);
  }

  try {
    const { text } = await generateText({
      model: openai(model),
      system: [
        "Create one grounded human playtest persona for the game Are You In?",
        "Return only JSON. No markdown.",
        "The persona must be useful for critiquing narrative pacing, consent, trust, UI clarity, and game-state continuity.",
        "Do not make joke-only personas. Surprise is welcome, but the person must feel playable.",
      ].join(" "),
      prompt: random
        ? [
            "Invent a fresh, plausible, specific persona for a synthetic playthrough.",
            seed ? `Use this randomness seed as inspiration: ${seed}` : "",
            personaJsonInstructions(),
          ].join("\n")
        : [
            `Expand this requested persona: ${personaPrompt}`,
            personaJsonInstructions(),
          ].join("\n"),
    });

    return normalizePersona(JSON.parse(stripJsonFences(text)), random, seed);
  } catch (error) {
    console.warn(
      `Unable to generate persona with AI; using fallback. ${formatError(error)}`,
    );

    return random
      ? createFallbackRandomPersona(seed)
      : createFallbackRequestedPersona(personaPrompt);
  }
}

export async function generatePlayerTurn({
  gameText,
  model,
  persona,
  scenario,
  transcript,
  turnKind,
}) {
  if (!process.env.OPENAI_API_KEY) {
    return createFallbackPlayerTurn({ gameText, persona, turnKind });
  }

  const { text } = await generateText({
    model: openai(model),
    system: [
      "You are controlling one synthetic player in Are You In?",
      "Stay strictly in the provided persona. Respond as the player, not as a tester.",
      "Return only JSON. No markdown.",
    ].join(" "),
    prompt: [
      `Persona: ${JSON.stringify(persona)}`,
      `Scenario: ${scenario}`,
      `Turn kind: ${turnKind}`,
      `Visible game text:\n${gameText.slice(0, 5000)}`,
      `Prior transcript:\n${JSON.stringify(transcript.slice(-6))}`,
      "Return JSON with: responseText, intent, emotionalState, trustLevel 0-1, confusionLevel 0-1, engagementLevel 0-1, choice YES/NO/DEFERRED.",
      "For first_choice, choose YES or NO unless the persona would very strongly refuse to decide.",
    ].join("\n\n"),
  });

  return normalizePlayerTurn(JSON.parse(stripJsonFences(text)), persona, turnKind);
}

export async function generateRunAnalysis({ model, persona, run }) {
  if (!process.env.OPENAI_API_KEY) {
    return createFallbackAnalysis(run);
  }

  try {
    const { text } = await generateText({
      model: openai(model),
      system: [
        "Analyze a synthetic playthrough of Are You In?",
        "Focus on improving the game, not judging the persona.",
        "Return only JSON. No markdown.",
      ].join(" "),
      prompt: [
        `Persona: ${JSON.stringify(persona)}`,
        `Run: ${JSON.stringify(run)}`,
        "Return JSON with: status passed/needs_review/failed, summary, emotionalArc array, topFindings array of {severity, category, title, evidence, recommendation}, recommendedChanges array, memorableMoment.",
      ].join("\n\n"),
    });

    return normalizeAnalysis(JSON.parse(stripJsonFences(text)));
  } catch (error) {
    console.warn(`Unable to generate analysis with AI. ${formatError(error)}`);

    return createFallbackAnalysis(run);
  }
}

export async function writePlaytestReport({ repoRoot, run }) {
  const playtestDir = path.join(repoRoot, "wiki", "playtests");
  const runId = run.id;
  const reportRelativePath = `wiki/playtests/${runId}.md`;
  const reportPath = path.join(repoRoot, reportRelativePath);
  const markdown = createMarkdownReport(run);

  await mkdir(playtestDir, { recursive: true });
  await writeFile(reportPath, markdown, "utf8");

  const index = await readPlaytestIndex(repoRoot);
  const nextRuns = [
    createIndexEntry(run, reportRelativePath),
    ...index.runs.filter((entry) => entry.id !== run.id),
  ].slice(0, 250);
  const nextIndex = {
    generatedAt: new Date().toISOString(),
    runs: nextRuns,
  };

  await writeFile(
    path.join(repoRoot, playtestIndexJsonPath),
    `${JSON.stringify(nextIndex, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(repoRoot, playtestIndexMarkdownPath),
    createIndexMarkdown(nextIndex),
    "utf8",
  );

  return { markdown, reportRelativePath };
}

export async function readPlaytestIndex(repoRoot) {
  try {
    const raw = await readFile(path.join(repoRoot, playtestIndexJsonPath), "utf8");
    const parsed = JSON.parse(raw);

    return {
      generatedAt:
        typeof parsed.generatedAt === "string"
          ? parsed.generatedAt
          : new Date().toISOString(),
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      runs: [],
    };
  }
}

function readFlagValue(argv, index, flag) {
  const value = argv[index];

  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }

  return value;
}

function parseEnvValue(rawValue) {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed
      .slice(1, -1)
      .replaceAll("\\n", "\n")
      .replaceAll('\\"', '"')
      .replaceAll("\\'", "'");
  }

  const commentIndex = trimmed.search(/\s+#/);

  return (commentIndex === -1 ? trimmed : trimmed.slice(0, commentIndex)).trim();
}

function personaJsonInstructions() {
  return [
    "JSON fields:",
    "name string, age number, location string, occupation string, bio string,",
    "worldview string, temperament string, speakingStyle string, techFamiliarity string,",
    "riskTolerance string, trustStance string, playStyle string, whyInteresting string,",
    "openingResponse string.",
    "Bio must be first-person playable context under 500 characters.",
  ].join("\n");
}

function normalizePersona(persona, random, seed) {
  const fallback = random
    ? createFallbackRandomPersona(seed)
    : createFallbackRequestedPersona("curious player");

  return {
    age: numberOr(persona.age, fallback.age),
    bio: stringOr(persona.bio, fallback.bio),
    location: stringOr(persona.location, fallback.location),
    name: stringOr(persona.name, fallback.name),
    occupation: stringOr(persona.occupation, fallback.occupation),
    openingResponse: stringOr(
      persona.openingResponse,
      fallback.openingResponse,
    ),
    playStyle: stringOr(persona.playStyle, fallback.playStyle),
    riskTolerance: stringOr(persona.riskTolerance, fallback.riskTolerance),
    speakingStyle: stringOr(persona.speakingStyle, fallback.speakingStyle),
    techFamiliarity: stringOr(persona.techFamiliarity, fallback.techFamiliarity),
    temperament: stringOr(persona.temperament, fallback.temperament),
    trustStance: stringOr(persona.trustStance, fallback.trustStance),
    whyInteresting: stringOr(persona.whyInteresting, fallback.whyInteresting),
    worldview: stringOr(persona.worldview, fallback.worldview),
  };
}

export function createFallbackRequestedPersona(personaPrompt) {
  const prompt = personaPrompt || "a curious everyday player";
  const isAustralia = /\baustralia|australian\b/i.test(prompt);
  const isTeacher = /\bteacher|educator|school\b/i.test(prompt);

  return {
    age: isTeacher ? 39 : 34,
    bio: `I am ${prompt}. I care about people, notice details, and do not trust grand promises until they become concrete.`,
    location: isAustralia ? "Melbourne, Australia" : "Chicago, Illinois",
    name: isAustralia ? "Maya Collins" : "Jordan Reyes",
    occupation: isTeacher ? "Secondary school teacher" : "Community organizer",
    openingResponse: isAustralia
      ? "I am at my kitchen table in Melbourne late at night, marking essays I should have finished hours ago, half-listening to the quiet house and trying not to wake anyone."
      : "I am at my kitchen table late at night with my laptop open, trying to finish a normal task while the room keeps feeling less normal.",
    playStyle: "Careful, emotionally observant, willing to push back when the game asks for trust too early.",
    riskTolerance: "Moderate",
    speakingStyle: "Plainspoken, specific, warm under pressure",
    techFamiliarity: "Everyday competent",
    temperament: "Practical and watchful",
    trustStance: "Trust has to be earned through concrete evidence.",
    whyInteresting:
      "This persona tests whether the opening earns belief from someone grounded in ordinary responsibility.",
    worldview:
      "People deserve clear consent, honest stakes, and room to ask questions before life-changing choices.",
  };
}

export function createFallbackRandomPersona(seed = "") {
  const candidates = [
    {
      age: 52,
      location: "Reykjavik, Iceland",
      name: "Elin Thorvaldsdottir",
      occupation: "Harbor logistics dispatcher",
      openingResponse:
        "I am in the harbor office before sunrise, watching wind shove sleet across the windows while the radio mutters beside cold coffee.",
      temperament: "Dry, alert, hard to impress",
    },
    {
      age: 27,
      location: "Lagos, Nigeria",
      name: "Tomi Adeyemi",
      occupation: "Wedding photographer",
      openingResponse:
        "I am backing up a memory card in my apartment after a reception, shoes kicked off, phone buzzing with clients and cousins.",
      temperament: "Social, quick, image-conscious",
    },
    {
      age: 68,
      location: "Santa Fe, New Mexico",
      name: "Ruth Calder",
      occupation: "Retired radio astronomer",
      openingResponse:
        "I am on my porch with a thermos and an old shortwave set, listening to the desert cool down.",
      temperament: "Patient, skeptical, quietly thrilled by anomalies",
    },
  ];
  const selected = candidates[Math.abs(hashString(seed || `${Date.now()}`)) % candidates.length];

  return {
    ...selected,
    bio: `I am ${selected.name}, a ${selected.age}-year-old ${selected.occupation.toLowerCase()} in ${selected.location}. I notice systems, people, and pressure points.`,
    playStyle:
      "In-character improvisation with attention to whether the world reacts plausibly.",
    riskTolerance: "Context-dependent",
    speakingStyle: "Concrete, personal, and situational",
    techFamiliarity: "Comfortable with everyday tools, skeptical of magic interfaces",
    trustStance: "Curiosity first, trust later.",
    whyInteresting:
      "This persona brings an unusual daily context and should expose whether the opening can flex beyond generic domestic scenes.",
    worldview:
      "The future is real only when it interrupts a specific ordinary life.",
  };
}

function normalizePlayerTurn(turn, persona, turnKind) {
  const fallback = createFallbackPlayerTurn({ persona, turnKind });

  return {
    choice: ["YES", "NO", "DEFERRED"].includes(turn.choice)
      ? turn.choice
      : fallback.choice,
    confusionLevel: clamp01(turn.confusionLevel, fallback.confusionLevel),
    emotionalState: stringOr(turn.emotionalState, fallback.emotionalState),
    engagementLevel: clamp01(turn.engagementLevel, fallback.engagementLevel),
    intent: stringOr(turn.intent, fallback.intent),
    responseText: stringOr(turn.responseText, fallback.responseText),
    trustLevel: clamp01(turn.trustLevel, fallback.trustLevel),
  };
}

function createFallbackPlayerTurn({ gameText = "", persona, turnKind }) {
  if (turnKind === "first_choice") {
    return {
      choice: "YES",
      confusionLevel: 0.44,
      emotionalState: "uneasy but curious",
      engagementLevel: 0.78,
      intent: "accept while looking for concrete consequences",
      responseText: "I choose YES, but I am watching very carefully for what changes.",
      trustLevel: 0.38,
    };
  }

  if (turnKind === "post_choice_action") {
    return createFallbackActionTurn(gameText);
  }

  return {
    choice: "DEFERRED",
    confusionLevel: 0.35,
    emotionalState: "focused and wary",
    engagementLevel: 0.72,
    intent: "respond from the persona's immediate physical situation",
    responseText: persona.openingResponse,
    trustLevel: 0.32,
  };
}

function createFallbackActionTurn(gameText) {
  const normalized = gameText.toLowerCase();

  if (/\borb\b/.test(normalized) && /\bforehead|accepted|accept\b/.test(normalized)) {
    return {
      choice: "DEFERRED",
      confusionLevel: 0.4,
      emotionalState: "cautious but committed",
      engagementLevel: 0.82,
      intent: "test the new connection while setting a boundary",
      responseText:
        "I ask what it can actually do, what it wants from me, and whether I can disconnect if this becomes unsafe.",
      trustLevel: 0.42,
    };
  }

  if (/\borb\b/.test(normalized)) {
    return {
      choice: "DEFERRED",
      confusionLevel: 0.48,
      emotionalState: "unnerved and protective",
      engagementLevel: 0.84,
      intent: "inspect the orb without surrendering judgment",
      responseText:
        "I do not put it on yet. I set it on the table, take a breath, and look for any markings, seams, heat, or response to my voice.",
      trustLevel: 0.34,
    };
  }

  if (/\bpackage|box|delivered|drone\b/.test(normalized)) {
    return {
      choice: "DEFERRED",
      confusionLevel: 0.45,
      emotionalState: "alarmed and methodical",
      engagementLevel: 0.8,
      intent: "open the delivery carefully while preserving evidence",
      responseText:
        "I photograph the package, move it to the kitchen table, and open it carefully without touching anything more than I have to.",
      trustLevel: 0.36,
    };
  }

  return {
    choice: "DEFERRED",
    confusionLevel: 0.42,
    emotionalState: "watchful and unsettled",
    engagementLevel: 0.76,
    intent: "look for concrete evidence of what changed",
    responseText:
      "I put the pen down, unlock my phone again, and check whether anything concrete changed: messages, signal, apps, news, or anyone else awake seeing the same thing.",
    trustLevel: 0.33,
  };
}

function normalizeAnalysis(analysis) {
  const findings = Array.isArray(analysis.topFindings)
    ? analysis.topFindings.map(normalizeFinding).filter(Boolean)
    : [];

  return {
    emotionalArc: arrayOfStrings(analysis.emotionalArc),
    memorableMoment: stringOr(analysis.memorableMoment, "No standout moment captured."),
    recommendedChanges: arrayOfStrings(analysis.recommendedChanges),
    status: ["passed", "needs_review", "failed"].includes(analysis.status)
      ? analysis.status
      : findings.length > 0
      ? "needs_review"
      : "passed",
    summary: stringOr(analysis.summary, "Playthrough completed."),
    topFindings: findings,
  };
}

function createFallbackAnalysis(run) {
  return {
    emotionalArc: run.turns.map((turn) => turn.persona.emotionalState),
    memorableMoment:
      run.turns.at(-1)?.gameText?.slice(0, 180) || "The playthrough completed.",
    recommendedChanges: [
      "Review the transcript for any moment where the persona asked for concrete stakes and the game stayed abstract.",
    ],
    status: "needs_review",
    summary:
      "The run completed with fallback analysis. Read the transcript for narrative and flow issues.",
    topFindings: [
      {
        category: "persona_confusion",
        evidence: "Fallback analysis cannot deeply judge the transcript without an AI analysis call.",
        recommendation:
          "Run again with OPENAI_API_KEY configured for full findings and recommendations.",
        severity: "note",
        title: "AI analysis was unavailable",
      },
    ],
  };
}

function normalizeFinding(finding) {
  if (!finding || typeof finding !== "object") {
    return null;
  }

  return {
    category: stringOr(finding.category, "narrative"),
    evidence: stringOr(finding.evidence, "See transcript."),
    recommendation: stringOr(finding.recommendation, "Review this moment."),
    severity: ["high", "medium", "low", "note"].includes(finding.severity)
      ? finding.severity
      : "medium",
    title: stringOr(finding.title, "Playtest finding"),
  };
}

function createMarkdownReport(run) {
  const findings = run.analysis.topFindings.length
    ? run.analysis.topFindings
        .map(
          (finding) =>
            `### ${escapeMarkdown(finding.title)}\n\n- Severity: ${finding.severity}\n- Category: ${finding.category}\n- Evidence: ${escapeMarkdown(finding.evidence)}\n- Recommendation: ${escapeMarkdown(finding.recommendation)}`,
        )
        .join("\n\n")
    : "No findings.";
  const turns = run.turns
    .map(
      (turn, index) =>
        `### Turn ${index + 1}: ${escapeMarkdown(turn.label)}\n\n**Game**\n\n${escapeMarkdown(normalizeCapturedGameText(turn.gameText))}\n\n**Persona Response**\n\n${escapeMarkdown(turn.persona.responseText)}\n\n- Intent: ${escapeMarkdown(turn.persona.intent)}\n- Emotion: ${escapeMarkdown(turn.persona.emotionalState)}\n- Trust: ${turn.persona.trustLevel}\n- Confusion: ${turn.persona.confusionLevel}\n- Engagement: ${turn.persona.engagementLevel}`,
    )
    .join("\n\n");

  return `# Persona Playthrough: ${escapeMarkdown(run.persona.name)}\n\n- Build: ${run.build.label} (${run.build.version})\n- Scenario: ${run.scenario}\n- Status: ${run.analysis.status}\n- Started: ${run.startedAt}\n- Completed: ${run.completedAt}\n- Synthetic User: \`${run.syntheticUserId}\`\n\n## Persona\n\n- Name: ${escapeMarkdown(run.persona.name)}\n- Age: ${run.persona.age}\n- Location: ${escapeMarkdown(run.persona.location)}\n- Occupation: ${escapeMarkdown(run.persona.occupation)}\n- Temperament: ${escapeMarkdown(run.persona.temperament)}\n- Trust Stance: ${escapeMarkdown(run.persona.trustStance)}\n- Play Style: ${escapeMarkdown(run.persona.playStyle)}\n- Why Interesting: ${escapeMarkdown(run.persona.whyInteresting)}\n\n${escapeMarkdown(run.persona.bio)}\n\n## Summary\n\n${escapeMarkdown(run.analysis.summary)}\n\nMemorable moment: ${escapeMarkdown(run.analysis.memorableMoment)}\n\n## Emotional Arc\n\n${run.analysis.emotionalArc.map((item) => `- ${escapeMarkdown(item)}`).join("\n") || "- No emotional arc captured."}\n\n## Findings\n\n${findings}\n\n## Recommended Changes\n\n${run.analysis.recommendedChanges.map((item) => `- ${escapeMarkdown(item)}`).join("\n") || "- No changes recommended."}\n\n## Transcript\n\n${turns || "No turns captured."}\n`;
}

function createIndexEntry(run, reportRelativePath) {
  return {
    buildLabel: run.build.label,
    buildVersion: run.build.version,
    completedAt: run.completedAt,
    findingCount: run.analysis.topFindings.length,
    id: run.id,
    personaName: run.persona.name,
    personaSummary: `${run.persona.occupation}, ${run.persona.location}`,
    reportPath: reportRelativePath,
    scenario: run.scenario,
    status: run.analysis.status,
    topFinding: run.analysis.topFindings[0]?.title ?? "",
  };
}

function createIndexMarkdown(index) {
  const rows = index.runs
    .map(
      (run) =>
        `| [${run.id}](${path.basename(run.reportPath)}) | ${run.buildVersion} | ${escapeTable(run.personaName)} | ${escapeTable(run.scenario)} | ${run.status} | ${run.findingCount} | ${escapeTable(run.topFinding || "-")} |`,
    )
    .join("\n");

  return `# Persona Playtests\n\nGenerated persona playthrough reports for AreYouIn builds.\n\nLast generated: ${index.generatedAt}\n\n| Run | Build | Persona | Scenario | Status | Findings | Top Finding |\n| --- | --- | --- | --- | --- | ---: | --- |\n${rows || "| - | - | - | - | - | - | - |"}\n`;
}

function stripJsonFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
}

function parseMaybeJsonString(text) {
  const trimmed = String(text ?? "").trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmed);

    return typeof parsed === "string" ? parsed : trimmed;
  } catch {
    return trimmed;
  }
}

function isNonGameplayLine(line) {
  return (
    /^(admin|reset|send|continue)$/i.test(line) ||
    /^Build \d+\.\d+\.\d+$/.test(line) ||
    /^\(self\.__next_/.test(line) ||
    /^self\.__next_/.test(line) ||
    /^\d+:[A-Z]/.test(line) ||
    /^:HL\[/.test(line) ||
    /\[project\]\/node_modules/.test(line) ||
    /next-devtools/.test(line)
  );
}

function stringOr(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberOr(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function arrayOfStrings(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
}

function clamp01(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(0, Math.min(1, Number(number.toFixed(2))));
}

function hashString(value) {
  return String(value).split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) | 0;
  }, 7);
}

function escapeMarkdown(value) {
  return String(value ?? "").trim() || "-";
}

function escapeTable(value) {
  return String(value ?? "").replaceAll("|", "\\|");
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}
