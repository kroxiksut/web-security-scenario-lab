// One-command setup for a fresh clone: preflight checks, then the two installs.
// Cross-platform by design (Node, not shell) — the .ps1/.sh wrappers next to this file only
// forward to it, so there is a single copy of the logic. Usage:
//   node scripts/setup.mjs [--check] [--skip-frameworks]
//     --check            run the preflight checks only, install nothing
//     --skip-frameworks  skip `npm run frameworks:install` (breaks only React 17/19 pages)
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const skipFrameworks = args.includes("--skip-frameworks");

const ok = (m) => console.log(`  OK    ${m}`);
const warn = (m) => console.log(`  WARN  ${m}`);
const fail = (m) => {
  console.error(`  FAIL  ${m}`);
  process.exitCode = 1;
};

/** Parse "v22.12.0" / "22.12.0" into [major, minor, patch]. */
function parseVersion(value) {
  const [major = 0, minor = 0, patch = 0] = value.replace(/^v/, "").split(".").map(Number);
  return [major, minor, patch];
}

function gte(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  }
  return true;
}

/**
 * Minimal check against the subset of range syntax this repo uses in `engines.node`:
 * `^X.Y.Z` clauses (same major, at least that minor/patch) and `>=X.Y.Z` clauses, joined by `||`.
 */
function satisfies(version, range) {
  const current = parseVersion(version);
  return range.split("||").some((rawClause) => {
    const clause = rawClause.trim();
    if (clause.startsWith("^")) {
      const min = parseVersion(clause.slice(1));
      return current[0] === min[0] && gte(current, min);
    }
    if (clause.startsWith(">=")) return gte(current, parseVersion(clause.slice(2)));
    return false;
  });
}

function run(command, label) {
  console.log(`\n> ${command}`);
  const result = spawnSync(command, { cwd: repoRoot, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\n${label} failed (exit code ${result.status ?? "unknown"}).`);
    process.exit(result.status ?? 1);
  }
}

console.log("Web Security Scenario Lab — setup\n");
console.log("Preflight:");

const pkg = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
const required = pkg.engines?.node ?? "";

if (satisfies(process.version, required)) {
  ok(`Node ${process.version} (required: ${required})`);
} else {
  fail(`Node ${process.version} is too old — this project requires ${required}.`);
  console.error("\n        Install Node 22 LTS or newer, then run this script again:");
  console.error("          Windows: https://nodejs.org/");
  console.error("          Linux:   nvm install 22   (or your distribution's package manager)");
  process.exit(1);
}

const npmVersion = spawnSync("npm -v", {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
}).stdout?.trim();
if (npmVersion) ok(`npm ${npmVersion}`);
else fail("npm was not found on PATH.");

// Sync clients lock files inside node_modules and can leave a half-written install behind.
const SYNC_FOLDERS = ["onedrive", "dropbox", "yandex", "google drive", "icloud"];
const hit = SYNC_FOLDERS.find((name) => repoRoot.toLowerCase().includes(name));
if (hit) warn(`the repository is inside a synced folder ("${hit}") — pause syncing during install`);

if (process.exitCode === 1) process.exit(1);
if (checkOnly) {
  console.log("\nPreflight passed (--check: nothing installed).");
  process.exit(0);
}

run("npm install", "npm install");
if (skipFrameworks) {
  console.log("\nSkipped `npm run frameworks:install` — the React 17 / React 19 scenario pages");
  console.log("will not work until you run it.");
} else {
  run("npm run frameworks:install", "npm run frameworks:install");
}

console.log("\nSetup complete. Next:");
console.log("  npm run dev       start the lab at http://localhost:5173/");
console.log("  npm run verify    typecheck + lint + test + build");
