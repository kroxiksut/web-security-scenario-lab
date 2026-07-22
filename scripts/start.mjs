// One command from a fresh clone to a running lab: preflight, install if needed, then `npm run dev`.
// Cross-platform by design (Node, not shell) — the .ps1/.sh wrappers next to this file only forward
// to it. Extra arguments go straight to Vite, e.g.:
//   node scripts/start.mjs --port 5180
//   node scripts/start.mjs --host
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const viteArgs = process.argv.slice(2);

function run(command, { fatal = true } = {}) {
  const result = spawnSync(command, { cwd: repoRoot, stdio: "inherit", shell: true });
  if (fatal && result.status !== 0) process.exit(result.status ?? 1);
  return result.status ?? 1;
}

// Preflight only — `setup.mjs --check` prints the Node/npm verdict and exits non-zero if unusable.
run("node scripts/setup.mjs --check");

if (!existsSync(resolve(repoRoot, "node_modules"))) {
  console.log("\nnode_modules is missing — running the full setup first.\n");
  run("node scripts/setup.mjs");
}

// Vite resolves its own root from vite.config.ts, so this works from any directory.
const command = viteArgs.length ? `npm run dev -- ${viteArgs.join(" ")}` : "npm run dev";
console.log(`\n> ${command}`);
console.log("Open the URL Vite prints below. Stop the server with Ctrl+C.\n");
process.exit(run(command, { fatal: false }));
