$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot ".."))
Set-Location $repoRoot

Write-Host "Montext Codex Automation" -ForegroundColor Cyan
$goal = Read-Host "Enter project goal"
if ([string]::IsNullOrWhiteSpace($goal)) {
    Write-Error "Goal cannot be empty."
    exit 1
}

$forceAnswer = Read-Host "Force onboarding? [y/N]"
$forceFlag = ""
if ($forceAnswer -match '^[Yy]') {
    $forceFlag = "--force-onboard"
}

function Get-CodexPath {
    if ($env:CODEX_BIN -and (Test-Path $env:CODEX_BIN)) {
        if ($env:CODEX_BIN -like "*.exe") {
            return $env:CODEX_BIN
        }
        Write-Warning "Ignoring CODEX_BIN because it points to a non-Windows binary: $($env:CODEX_BIN)"
    }

$cmd = Get-Command codex -ErrorAction SilentlyContinue
if ($cmd -and ($cmd.Source -like "*.exe")) {
    return $cmd.Source
}

$candidates = @(
    "$env:USERPROFILE\.vscode-insiders\extensions\openai.chatgpt-0.4.43\bin\windows-x86_64\codex.exe",
    "$env:USERPROFILE\.vscode-insiders\extensions\openai.chatgpt\bin\windows-x86_64\codex.exe",
    "$env:USERPROFILE\.vscode\extensions\openai.chatgpt-0.4.43\bin\windows-x86_64\codex.exe",
    "$env:USERPROFILE\.vscode\extensions\openai.chatgpt\bin\windows-x86_64\codex.exe"
)

    foreach ($path in $candidates) {
        if (Test-Path $path) {
            return $path
        }
    }

    return $null
}

$codexPath = Get-CodexPath
if (-not $codexPath) {
    Write-Error "Codex CLI not found. Add it to PATH or set CODEX_BIN."
    exit 1
}

$env:CODEX_BIN = $codexPath
Write-Host "Using Codex CLI at $codexPath"

$escapedGoal = $goal.Replace('"', '``"')
$cmdParts = @("./scripts/montext-codex.sh")
if ($forceFlag) {
    $cmdParts += $forceFlag
}
$cmdParts += "--goal `"$escapedGoal`""
$cmd = $cmdParts -join " "

function Get-BashPath {
    $bashCmd = Get-Command bash -ErrorAction SilentlyContinue
    if ($bashCmd -and ($bashCmd.Source -notmatch "System32\\bash.exe")) {
        return $bashCmd.Source
    }

    $candidates = @(
        "$env:ProgramFiles\Git\bin\bash.exe",
        "$env:ProgramFiles(x86)\Git\bin\bash.exe"
    )
    foreach ($path in $candidates) {
        if (Test-Path $path) {
            return $path
        }
    }
    return $null
}

$bashPath = Get-BashPath
if (-not $bashPath) {
    Write-Error "Could not find Git Bash. Install Git for Windows or ensure bash.exe is on PATH."
    exit 1
}

Write-Host "Starting Codex automation via $bashPath ..."
& $bashPath -lc $cmd
