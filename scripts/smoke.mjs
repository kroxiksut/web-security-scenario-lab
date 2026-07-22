// Smoke check: does the lab actually RUN? Starts the real servers and asserts over real responses.
//
// Why this exists: `@analogjs/vite-plugin-angular` once disabled Vite's TypeScript transform for
// every file, so the dev server served raw TS and every page died on `SyntaxError: Unexpected token
// ':'` — no styles, no shell. typecheck, lint, test and build all stayed green, because the build
// path was unaffected. Only starting a server and reading what it returns catches that class of bug.
//
// Usage: node scripts/smoke.mjs [--dev-only|--dist-only]
// Requires `dist/` for the dist phase (run `npm run build` first; `npm run verify` does).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const runDev = !args.includes("--dist-only");
const runDist = !args.includes("--dev-only");
const READY_TIMEOUT_MS = 90_000;

let failures = 0;
const pass = (m) => console.log(`  ok    ${m}`);
const fail = (m, detail) => {
  console.error(`  FAIL  ${m}`);
  if (detail) console.error(`        ${detail}`);
  failures += 1;
};

function check(condition, message, detail) {
  if (condition) pass(message);
  else fail(message, detail);
}

/** Ask the OS for a free port so parallel runs never collide. */
function freePort() {
  return new Promise((resolvePort, rejectPort) => {
    const probe = createServer();
    probe.on("error", rejectPort);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolvePort(port));
    });
  });
}

/** Kill the whole child tree — npm spawns vite as a grandchild, so killing the parent is not enough. */
function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", shell: true });
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

async function waitForServer(url, child, label) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`${label} exited early (code ${child.exitCode})`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`${label} did not become ready within ${READY_TIMEOUT_MS / 1000}s`);
}

async function get(base, path) {
  const response = await fetch(`${base}${path}`);
  return {
    status: response.status,
    type: response.headers.get("content-type") ?? "",
    body: await response.text(),
  };
}

function startServer(commandLine, label) {
  // One command string (not command + args) with `shell: true` — passing an args array that way is
  // deprecated in Node 24 because the arguments are concatenated rather than escaped.
  const child = spawn(commandLine, {
    cwd: repoRoot,
    shell: true,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", () => {});
  child.stderr.on("data", (chunk) => {
    const text = String(chunk);
    if (/error/i.test(text)) console.error(`  [${label}] ${text.trim().slice(0, 200)}`);
  });
  return child;
}

async function smokeDev() {
  console.log("\nDev server (npm run dev)");
  const port = await freePort();
  const base = `http://localhost:${port}`;
  const child = startServer(`npm run dev -- --port ${port} --strictPort`, "dev");
  try {
    await waitForServer(`${base}/index.html`, child, "dev server");

    const page = await get(base, "/index.html");
    check(page.status === 200, "GET /index.html → 200", `got ${page.status}`);
    check(page.body.includes("data-shell-main"), "landing page ships its content slot");

    // The regression that started all this: TypeScript must be stripped before it reaches a browser.
    const entry = await get(base, "/src/main.ts");
    check(entry.status === 200, "GET /src/main.ts → 200", `got ${entry.status}`);
    check(
      entry.type.includes("javascript"),
      "entry is served as JavaScript",
      `content-type: ${entry.type}`,
    );
    check(
      !/function boot\(\)\s*:\s*void/.test(entry.body),
      "TypeScript annotations are stripped from the entry",
      "raw TS reached the response — Vite's transform is disabled (check `oxc` in vite.config.ts)",
    );

    const behavior = await get(base, "/src/scenarios/hidden-text-mixed.ts");
    check(
      behavior.status === 200,
      "GET a scenario behavior module → 200",
      `got ${behavior.status}`,
    );
    check(
      !/:\s*ScenarioContext/.test(behavior.body),
      "TypeScript annotations are stripped from scenario behavior",
    );

    const css = await get(base, "/src/styles/main.css");
    check(css.status === 200, "GET /src/styles/main.css → 200", `got ${css.status}`);
    check(css.body.includes("__vite__updateStyle"), "stylesheet is wired for injection");
    check(css.body.includes(".app-shell"), "stylesheet carries the shell rules");

    for (const path of [
      "/pages/visual-manipulation/hidden-text.html",
      "/pages/link-domain-security/benign.html",
      "/pages/scenarios/index.html",
    ]) {
      const scenario = await get(base, path);
      check(scenario.status === 200, `GET ${path} → 200`, `got ${scenario.status}`);
    }
  } finally {
    killTree(child);
  }
}

async function smokeDist() {
  console.log("\nBuilt output (serve.mjs dist)");
  if (!existsSync(resolve(repoRoot, "dist", "index.html"))) {
    fail("dist/index.html is missing", "run `npm run build` first");
    return;
  }
  const port = await freePort();
  const base = `http://localhost:${port}`;
  const child = startServer(`node serve.mjs dist --port ${port}`, "dist");
  try {
    await waitForServer(`${base}/index.html`, child, "static server");

    const page = await get(base, "/index.html");
    check(page.status === 200, "GET /index.html → 200", `got ${page.status}`);

    // Every asset the built page references must exist — a hand-built runtime path once 404'd here.
    const refs = [...page.body.matchAll(/(?:src|href)="(\.\/[^"]+\.(?:js|css|png))"/g)].map(
      (m) => m[1],
    );
    check(
      refs.length > 0,
      "landing page references built assets",
      "no hashed asset references found",
    );
    for (const ref of refs) {
      const asset = await get(base, `/${ref.replace(/^\.\//, "")}`);
      check(asset.status === 200, `asset ${ref} → 200`, `got ${asset.status}`);
    }
    check(
      refs.some((r) => r.endsWith(".css")),
      "landing page links a built stylesheet",
    );

    for (const path of [
      "/pages/visual-manipulation/benign.html",
      "/pages/link-domain-security/homographs.html",
      "/frameworks/angular/v22/hidden-text.html",
      "/pages/scenarios/index.html",
    ]) {
      const scenario = await get(base, path);
      check(scenario.status === 200, `GET ${path} → 200`, `got ${scenario.status}`);
    }
  } finally {
    killTree(child);
  }
}

console.log("Web Security Scenario Lab — smoke check");
try {
  if (runDev) await smokeDev();
  if (runDist) await smokeDist();
} catch (error) {
  fail("smoke run aborted", String(error instanceof Error ? error.message : error));
}

console.log(failures === 0 ? "\nSmoke check passed." : `\nSmoke check FAILED (${failures}).`);
process.exit(failures === 0 ? 0 : 1);
