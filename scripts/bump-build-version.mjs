import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const bumpType = process.argv[2] ?? "patch";
const allowedBumps = new Set(["patch", "minor", "major"]);

if (!allowedBumps.has(bumpType)) {
  throw new Error(
    `Unsupported bump type "${bumpType}". Use patch, minor, or major.`,
  );
}

function bumpVersion(version, type) {
  const parts = version.split(".").map((part) => Number.parseInt(part, 10));

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Expected a semver version like 0.1.0, received "${version}".`);
  }

  const [major, minor, patch] = parts;

  if (type === "major") {
    return `${major + 1}.0.0`;
  }

  if (type === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  return `${major}.${minor}.${patch + 1}`;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

const packagePath = join(repoRoot, "package.json");
const buildVersionPath = join(repoRoot, "build-version.json");

const [packageJson, buildVersion] = await Promise.all([
  readJson(packagePath),
  readJson(buildVersionPath),
]);

if (packageJson.version !== buildVersion.version) {
  throw new Error(
    `package.json (${packageJson.version}) and build-version.json (${buildVersion.version}) are out of sync.`,
  );
}

const nextVersion = bumpVersion(packageJson.version, bumpType);
const today = new Date().toISOString().slice(0, 10);

packageJson.version = nextVersion;
buildVersion.version = nextVersion;
buildVersion.label = `Build ${nextVersion}`;
buildVersion.updatedAt = today;
buildVersion.summary = process.argv.slice(3).join(" ") || buildVersion.summary;

await Promise.all([
  writeJson(packagePath, packageJson),
  writeJson(buildVersionPath, buildVersion),
]);

console.log(`Build version bumped to ${nextVersion}`);
