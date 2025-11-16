Param(
    [string]$Goal,
    [switch]$ForceOnboard,
    [string]$CodexBin
)

$root = (Split-Path -Parent $MyInvocation.MyCommand.Path)
$repoRoot = (Resolve-Path (Join-Path $root "..")).Path
Set-Location $repoRoot

if (-not $Goal) {
    $Goal = Read-Host "Enter project goal"
}
if (-not $Goal) {
    Write-Error "Goal cannot be empty."
    exit 1
}

if (-not $CodexBin) {
    if ($env:CODEX_BIN) {
        $CodexBin = $env:CODEX_BIN
    } else {
        $codexCmd = Get-Command codex -ErrorAction SilentlyContinue
        if ($codexCmd) {
            $CodexBin = $codexCmd.Source
        }
    }
}

if (-not $CodexBin) {
    Write-Error "Codex CLI not found. Install it or pass -CodexBin / set CODEX_BIN."
    exit 1
}

$env:CODEX_BIN = $CodexBin
$cmd = "./scripts/montext-codex.sh --goal `"$Goal`""
if ($ForceOnboard) {
    $cmd += " --force-onboard"
}

Write-Host "Starting Codex automation via bash..."
bash -lc $cmd
