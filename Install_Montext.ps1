Param(
    [string]$ProjectName = "my-montext-project",
    [string]$RepoUrl = "https://github.com/markybuilds/montext.git"
)

Write-Host "Montext Bootstrap (PowerShell)" -ForegroundColor Cyan
Write-Host "Project Name : $ProjectName"
Write-Host "Starter Repo: $RepoUrl"

# 1. Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: git is not installed. Please install git and re-run." -ForegroundColor Red
    exit 1
}

# 2. Create project folder if not exists
if (-not (Test-Path $ProjectName)) {
    Write-Host "Creating project folder '$ProjectName'..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ProjectName | Out-Null
}
else {
    Write-Host "Project folder '$ProjectName' already exists." -ForegroundColor Yellow
}

Set-Location $ProjectName

# 3. Warn if not empty
$items = Get-ChildItem -Force | Where-Object { $_.Name -notin @(".", "..") }
if ($items.Count -gt 0) {
    Write-Host "Warning: Project folder is not empty. Existing files may be overwritten or cause conflicts." -ForegroundColor Yellow
}

# 4. Initialize git if needed
if (-not (Test-Path ".git")) {
    git init | Out-Null
}

# 5. Configure origin remote
$existingOrigin = git remote get-url origin 2>$null
if (-not $existingOrigin) {
    git remote add origin $RepoUrl
    Write-Host "Added remote 'origin' -> $RepoUrl" -ForegroundColor Green
}
else {
    Write-Host "Remote 'origin' already set to $existingOrigin" -ForegroundColor DarkGray
}

Write-Host "Fetching Montext starter from '$RepoUrl'..." -ForegroundColor Cyan
if (-not (git fetch origin)) {
    Write-Host "Error: Failed to fetch from '$RepoUrl'. Check URL or network." -ForegroundColor Red
    exit 1
}

# 6. Checkout main/master from starter
$hasMain = git show-ref --verify --quiet refs/remotes/origin/main; $mainExit = $LASTEXITCODE
$hasMaster = git show-ref --verify --quiet refs/remotes/origin/master; $masterExit = $LASTEXITCODE

if ($mainExit -eq 0) {
    git checkout -B main origin/main | Out-Null
}
elseif ($masterExit -eq 0) {
    git checkout -B main origin/master | Out-Null
}
else {
    Write-Host "Error: Neither 'origin/main' nor 'origin/master' found in starter repo." -ForegroundColor Red
    exit 1
}

Write-Host "" 
Write-Host "Montext system successfully bootstrapped in '$ProjectName'." -ForegroundColor Green
Write-Host "" 
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open '$ProjectName' in VS Code Insiders." 
Write-Host "2. Ensure GitHub Copilot and Copilot Agents are enabled." 
Write-Host "3. Use the Onboard Agent or Montext Orchestrator agent and provide your project goal." 
Write-Host "4. Montext will initialize context and begin autonomous execution based on the starter setup." 
Write-Host "" 
Write-Host "Note: Update -RepoUrl if you host a different official montext-starter repository." -ForegroundColor DarkGray
