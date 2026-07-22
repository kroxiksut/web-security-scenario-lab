# Windows convenience wrapper around scripts/setup.mjs — no logic of its own, so the two systems
# can never drift apart. Equivalent to running: node scripts/setup.mjs
#
# PowerShell blocks unsigned scripts by default. If it refuses to run this file, either call it as
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
# or skip the wrapper entirely and run `node scripts/setup.mjs`.
#
# Arguments are forwarded, e.g.: .\scripts\setup.ps1 --check

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js was not found on PATH. Install Node 22 LTS from https://nodejs.org/ and open a new PowerShell window."
    exit 1
}

Push-Location $repoRoot
try {
    node scripts/setup.mjs @args
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
