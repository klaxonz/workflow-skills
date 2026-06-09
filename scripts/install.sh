#!/usr/bin/env bash
set -euo pipefail

# One-click install script for Workflow Skills
# Usage: curl -fsSL https://raw.githubusercontent.com/klaxonz/workflow-skills/main/scripts/install.sh | bash -s -- codex

REPO="klaxonz/workflow-skills"
REPO_URL="https://github.com/${REPO}.git"
INSTALL_DIR="${WORKFLOW_SKILLS_HOME:-$HOME/.workflow-skills}"
TARGET="${1:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# Check prerequisites
for cmd in git node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    err "Required command not found: $cmd. Please install it first."
    exit 1
  fi
done

# Clone or update repo
if [ -d "$INSTALL_DIR" ]; then
  info "Updating existing installation at $INSTALL_DIR..."
  git -C "$INSTALL_DIR" pull --ff-only
else
  info "Cloning $REPO_URL into $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

# Install skills via CLI
if [ -z "$TARGET" ]; then
  err "Missing target. Choose codex, codex:global, claude, claude:global, opencode, or another explicit target."
  exit 1
fi

info "Installing skills to target: $TARGET"
node "$INSTALL_DIR/bin/skills.js" install "$TARGET"

ok "Workflow Skills installed successfully!"
echo ""
echo "Quick start:"
echo "  npx @klaxonz/workflow-skills list codex           # List Codex project skills"
echo "  npx @klaxonz/workflow-skills install codex:global # Install globally for Codex"
echo "  npx @klaxonz/workflow-skills update codex         # Update project install"
