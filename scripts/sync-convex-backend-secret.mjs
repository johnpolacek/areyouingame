import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const envFile = ".env.local";
const key = "AREYOUIN_BACKEND_SECRET";
const secret = readEnvValue(envFile, key);

if (!secret) {
  console.error(`${key} is missing from ${envFile}.`);
  process.exit(1);
}

const result = spawnSync("pnpm", [
  "convex",
  "env",
  "set",
  key,
  secret,
], {
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`${key} synced to Convex dev deployment.`);
console.log(`Local secret fingerprint: ${fingerprint(secret)}`);

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
