import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const envFile = ".env.local";
const key = "AREYOUIN_BACKEND_SECRET";
const secret = readNextEnvValue(key);

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
