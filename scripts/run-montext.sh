#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Montext Codex Automation"
read -rp "Enter project goal: " USER_GOAL
if [[ -z "$USER_GOAL" ]]; then
  echo "Goal cannot be empty."
  exit 1
fi

read -rp "Force onboarding? [y/N]: " FORCE
FORCE_FLAG=""
if [[ "${FORCE^^}" == "Y" ]]; then
  FORCE_FLAG="--force-onboard"
fi

if ! command -v "${CODEX_BIN:-codex}" >/dev/null 2>&1; then
  echo "Codex CLI not found. Set CODEX_BIN or add codex to PATH."
  exit 1
fi

exec ./scripts/montext-codex.sh $FORCE_FLAG --goal "$USER_GOAL"
