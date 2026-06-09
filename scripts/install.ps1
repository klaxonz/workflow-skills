# One-click install script for Workflow Skills (Windows)
# Usage: & ([scriptblock]::Create((irm https://raw.githubusercontent.com/klaxonz/workflow-skills/main/scripts/install.ps1))) -Target codex

param(
    [Parameter(Mandatory = $true)]
    [string]$Target
)

$ErrorActionPreference = "Stop"

$Repo = "klaxonz/workflow-skills"
$RepoUrl = "https://github.com/${Repo}.git"
$InstallDir = if ($env:WORKFLOW_SKILLS_HOME) { $env:WORKFLOW_SKILLS_HOME } else { "$env:USERPROFILE\.workflow-skills" }

function info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function ok($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function err($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

foreach ($cmd in @("git", "node", "npm")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        err "Required command not found: $cmd. Please install it first."
        exit 1
    }
}

if (Test-Path $InstallDir) {
    info "Updating existing installation at $InstallDir..."
    git -C $InstallDir pull --ff-only
} else {
    info "Cloning $RepoUrl into $InstallDir..."
    git clone $RepoUrl $InstallDir
}

info "Installing skills to target: $Target"
node "$InstallDir\bin\skills.js" install $Target

ok "Workflow Skills installed successfully!"
Write-Host ""
Write-Host "Quick start:"
Write-Host "  npx @klaxonz/workflow-skills list codex           # List Codex project skills"
Write-Host "  npx @klaxonz/workflow-skills install codex:global # Install globally for Codex"
Write-Host "  npx @klaxonz/workflow-skills update codex         # Update project install"
