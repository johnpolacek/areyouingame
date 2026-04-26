import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const envFile = ".env.local";
const key = "AREYOUIN_BACKEND_SECRET";
const secret = readEnvValue(envFile, key);

if (!secret) {
  console.error(`${key} is missing from ${envFile}.`);
  process.exit(1);
}

const result = spawnSync("pnpm", ["convex", "env", "set", key, secret], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);

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
