# Getting Started

Russian mirror: [`../ru/getting-started.md`](../ru/getting-started.md).

The lab is a **static, client-side-only** site: no backend, no database, no server-side rendering.
Development uses Vite; the built output is plain HTML/CSS/JS/JSON that any trivial static file server
can host.

Below are two independent guides. Pick yours and follow it top to bottom — you never need to switch
between them:

- [**Windows**](#windows) — PowerShell
- [**Linux**](#linux) — bash

The sections common to both — [deep-link parameters](#deep-link-parameters) and
[quality gates](#quality-gates) — come at the end.

## Requirements

| Requirement | Notes |
| --- | --- |
| **Node.js `^20.19` / `^22.12` / `>=24`** | Required by Vite 8 (`^20.19.0 \|\| >=22.12.0`) and Vitest 4. Node 22 LTS or 24 recommended. |
| **npm 10+** | Ships with the supported Node versions. |
| A modern browser | Chrome, Edge, Firefox, Safari, or any Chromium-based browser. |
| Git | Only to clone the repository. |

Nothing else is needed — no Python, no Docker, no web server package.

---

## Windows

Everything runs in **PowerShell**. Open the Start menu → type `PowerShell` → launch **Windows
PowerShell** (or Windows Terminal). Administrator rights are not required.

### 1. Check Node

```powershell
node -v
npm -v
```

If `node -v` reports lower than `v20.19` or the command is not found, install Node 22 LTS from
[nodejs.org](https://nodejs.org/) and open a new PowerShell window.

### 2. Go to your projects folder and clone the repository

```powershell
cd $HOME\Projects
git clone <repository-url>
cd web-security-scenario-lab
```

No `Projects` folder yet? Create it: `New-Item -ItemType Directory $HOME\Projects`. Already cloned the
repository? Just change into it:

```powershell
cd C:\path\to\web-security-scenario-lab
```

> **Synced folders.** If the project lives in OneDrive, Dropbox, or a similar client, pause syncing
> before the next step: sync clients lock files inside `node_modules` and can make the install fail or
> leave a half-written tree.

### 3. Install dependencies

```powershell
npm run setup
```

This checks your Node and npm versions, warns if the repository sits in a synced folder, and runs both
installs. There is an equivalent PowerShell wrapper that holds no logic of its own — it just calls the
same script:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

The `-ExecutionPolicy Bypass` flag is needed because PowerShell refuses unsigned scripts by default.
If you would rather not deal with that, use `npm run setup` — the result is identical.

To check the environment without installing anything: `npm run setup -- --check`.

The script **never wipes anything**: it installs only what is missing and otherwise leaves an existing
tree alone. That matters because `npm install` prunes everything from `node_modules` that
`package.json` does not list — including packages you added by hand (`npm install --no-save …`). Force
a full reinstall with `npm run setup -- --reinstall`.

With nothing to install it says so and exits. On a fresh clone it runs:

```powershell
npm install
npm run frameworks:install
```

The second step is a one-time thing on a fresh clone: the React 17 and React 19 scenarios install into
**nested `node_modules`** so each `react-dom` sits next to its matching `react`, which the root
`npm install` does not cover. Skip it (`npm run setup -- --skip-frameworks`) and only the React 17 /
React 19 scenario pages break; the rest of the lab still builds and runs. Details in
[Adding a Framework or Version](./adding-frameworks.md).

### 4. Run the lab

```powershell
npm start
```

Vite prints an address — `http://localhost:5173/` by default. Open it in a browser: that is the
landing page with the module cards. Hot reload is on and TypeScript is compiled on the fly.

`npm start` runs the preflight checks, installs dependencies if they are missing, and then starts the
dev server. Once step 3 is done, plain `npm run dev` does exactly the same thing. PowerShell wrapper:
`powershell -ExecutionPolicy Bypass -File .\scripts\start.ps1`.

Stop the server with `Ctrl+C` in the same PowerShell window.

Different port, or access from the local network (arguments are forwarded to Vite):

```powershell
npm start -- --port 5180
npm start -- --host
```

### 5. Build and serve the static output (when needed)

You only need this step when checking the lab the way it will be deployed.

```powershell
npm run build
npm run preview
```

`npm run build` writes to `dist\`; `npm run preview` serves it at `http://localhost:4173/`.

To prove the lab runs on any trivial static server — the repository ships one with zero dependencies:

```powershell
node serve.mjs dist
node serve.mjs dist --port 8080
$env:PORT = 8080; node serve.mjs dist
```

Any other static server works too:

```powershell
npx serve dist
py -3 -m http.server 4173 --directory dist
```

**Serve `dist\`, not the repository root** — the source pages reference `src\main.ts`, which only a
bundler can resolve; a plain file server would hand the browser raw TypeScript.

Double-clicking `dist\index.html` (`file://`) is a **nice-to-have, not a supported mode**: module
scripts and `fetch()` of local JSON manifests are subject to origin rules that vary by browser. Use a
static server.

---

## Linux

Everything runs in **bash** (any POSIX shell will do). Open a terminal.

### 1. Check Node

```bash
node -v
npm -v
```

If `node -v` reports lower than `v20.19` or the command is not found, install Node 22 LTS via
[nvm](https://github.com/nvm-sh/nvm) (`nvm install 22`) or your distribution's package manager, then
open a new terminal.

### 2. Go to your projects folder and clone the repository

```bash
mkdir -p ~/projects && cd ~/projects
git clone <repository-url>
cd web-security-scenario-lab
```

Already cloned the repository? Just change into it:

```bash
cd ~/path/to/web-security-scenario-lab
```

### 3. Install dependencies

```bash
npm run setup
```

This checks your Node and npm versions, warns if the repository sits in a synced folder, and runs both
installs. There is an equivalent sh wrapper that holds no logic of its own — it just calls the same
script:

```bash
sh scripts/setup.sh
```

To check the environment without installing anything: `npm run setup -- --check`.

The script **never wipes anything**: it installs only what is missing and otherwise leaves an existing
tree alone. That matters because `npm install` prunes everything from `node_modules` that
`package.json` does not list — including packages you added by hand (`npm install --no-save …`). Force
a full reinstall with `npm run setup -- --reinstall`.

With nothing to install it says so and exits. On a fresh clone it runs:

```bash
npm install
npm run frameworks:install
```

The second step is a one-time thing on a fresh clone: the React 17 and React 19 scenarios install into
**nested `node_modules`** so each `react-dom` sits next to its matching `react`, which the root
`npm install` does not cover. Skip it (`npm run setup -- --skip-frameworks`) and only the React 17 /
React 19 scenario pages break; the rest of the lab still builds and runs. Details in
[Adding a Framework or Version](./adding-frameworks.md).

### 4. Run the lab

```bash
npm start
```

Vite prints an address — `http://localhost:5173/` by default. Open it in a browser: that is the
landing page with the module cards. Hot reload is on and TypeScript is compiled on the fly.

`npm start` runs the preflight checks, installs dependencies if they are missing, and then starts the
dev server. Once step 3 is done, plain `npm run dev` does exactly the same thing. sh wrapper:
`sh scripts/start.sh`.

Stop the server with `Ctrl+C` in the same terminal.

Different port, or access from the local network (arguments are forwarded to Vite):

```bash
npm start -- --port 5180
npm start -- --host
```

### 5. Build and serve the static output (when needed)

You only need this step when checking the lab the way it will be deployed.

```bash
npm run build
npm run preview
```

`npm run build` writes to `dist/`; `npm run preview` serves it at `http://localhost:4173/`.

To prove the lab runs on any trivial static server — the repository ships one with zero dependencies:

```bash
node serve.mjs dist
node serve.mjs dist --port 8080
PORT=8080 node serve.mjs dist
```

Any other static server works too:

```bash
npx serve dist
python3 -m http.server 4173 --directory dist
```

**Serve `dist/`, not the repository root** — the source pages reference `src/main.ts`, which only a
bundler can resolve; a plain file server would hand the browser raw TypeScript.

Opening `dist/index.html` directly (`file://`) is a **nice-to-have, not a supported mode**: module
scripts and `fetch()` of local JSON manifests are subject to origin rules that vary by browser. Use a
static server.

---

## Deep-link parameters

Every page accepts query parameters, so a specific scenario state can be shared or scripted:

| Parameter | Values | Effect |
| --- | --- | --- |
| `?seed=` | any string, e.g. `1042` | Seeds the PRNG so a randomized scenario reproduces exactly. Default: `default`. |
| `?focus=1` | `1` / `0` | Isolated test mode — hides the shell UI (menus, side panels) so only the scenario DOM remains. |
| `?lang=` | `en` / `ru` | Forces the UI language, overriding the stored preference. |
| `?theme=` | `light` / `dark` / `auto` | Forces the color theme. |

They combine:
`http://localhost:5173/pages/visual-manipulation/hidden-text.html?seed=1042&focus=1&lang=ru`

Note that these switch the **lab shell**, not the payload — scenarios that plant bilingual content
plant it regardless of the UI language.

## Quality gates

Before proposing a change, everything must pass. One command, identical on both systems:

```bash
npm run verify
```

It runs, in order:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run smoke     # starts the real servers and checks their responses
```

That last step is not a formality. `npm run smoke` starts the dev server on a free port and a static
server over `dist/`, then asserts against real responses: pages return 200, TypeScript is stripped,
styles reach the browser, and every asset the built page references exists. This is the class of
failure the other four gates miss — the Angular plugin once disabled Vite's TS transform, `npm run
build` stayed green, and every page died on `SyntaxError` under `npm run dev`. Takes about half a
minute.

You can run either half on its own: `npm run smoke -- --dev-only` or `npm run smoke -- --dist-only`.

Tests cover the **engine and infrastructure only** (seeded PRNG, manifest loading, JSON-Schema
validation, i18n, evaluation resolution). Scenario pages are deliberately variable and imperfect and
are never test-covered — see [Contributing](../../CONTRIBUTING.md).

Formatting is available as `npm run format` / `npm run format:check`. A few legacy files are known to
be non-conformant; the repository does not gate on `format:check`.

## Where to go next

- [Documentation index](./index.md) — the full documentation map.
- [Detection modules](./README.md) — what each module tests and which scenarios it ships.
- The scenario catalog page (`pages/scenarios/index.html` in a running lab) lists every scenario with
  its expected signal, verdict, severity, and tags.
