import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const envFile = ".env.local";
const key = "AREYOUIN_BACKEND_SECRET";
const localSecret = readEnvValue(envFile, key);

if (!localSecret) {
  console.error(`${key} is missing from ${envFile}.`);
  process.exit(1);
}

const result = spawnSync(
  "pnpm",
  ["convex", "env", "get", key],
  {
    encoding: "utf8",
  },
);

if (result.status !== 0) {
  console.error(result.stderr.trim() || result.stdout.trim());
  process.exit(result.status ?? 1);
}

const convexSecret = result.stdout.trim();
const localFingerprint = fingerprint(localSecret);
const convexFingerprint = fingerprint(convexSecret);

console.log(`Local ${key} fingerprint:  ${localFingerprint}`);
console.log(`Convex ${key} fingerprint: ${convexFingerprint}`);

if (localSecret !== convexSecret) {
  console.error("Convex backend secret does not match .env.local.");
  process.exit(1);
}

console.log("Convex backend secret matches .env.local.");

function readEnvValue(filePath, name) {
  const file = readFileSync(filePath, "utf8");
  const line = file
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${name}=`));

  if (!line) {
    return "";
  }

  const rawValue = line.slice(line.indexOf("=") + 1).trim();

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  return rawValue;
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
