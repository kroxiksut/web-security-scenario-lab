# Windows convenience wrapper around scripts/start.mjs — no logic of its own, so the two systems
# can never drift apart. Equivalent to running: node scripts/start.mjs
#
# PowerShell blocks unsigned scripts by default. If it refuses to run this file, either call it as
#   powershell -ExecutionPolicy Bypass -File .\scripts\start.ps1
# or skip the wrapper entirely and run `npm start`.
#
# Arguments are forwarded to Vite, e.g.: .\scripts\start.ps1 --port 5180

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js was not found on PATH. Install Node 22 LTS from https://nodejs.org/ and open a new PowerShell window."
    exit 1
}

Push-Location $repoRoot
try {
    node scripts/start.mjs @args
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
