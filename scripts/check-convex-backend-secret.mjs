import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const envFile = ".env.local";
const key = "AREYOUIN_BACKEND_SECRET";
const localSecret = readNextEnvValue(key);

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

function readNextEnvValue(name) {
  const localRequire = createRequire(import.meta.url);
  const requireFromNext = createRequire(
    localRequire.resolve("next/package.json"),
  );
  const { loadEnvConfig } = requireFromNext("@next/env");

  delete process.env[name];
  loadEnvConfig(process.cwd(), true, undefined, true);

  return process.env[name] ?? "";
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
