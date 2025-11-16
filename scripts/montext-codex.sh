#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="$ROOT_DIR"
CODEX_BIN="${CODEX_BIN:-codex}"
GOAL_TEXT=""
GOAL_FILE=""
MAX_LOOPS=50
FORCE_ONBOARD=0
VALIDATE_INTERVAL=1

usage() {
  cat <<'EOF'
Usage: scripts/montext-codex.sh [options]

Options:
  --goal "text"          Project goal to supply to Codex (overrides context file).
  --goal-file path       Read goal text from file.
  --workspace path       Workspace for Codex (default: repo root).
  --max-loops N          Max task-executor iterations (default: 50).
  --force-onboard        Run onboard-agent even if context already initialized.
  --validate-interval N  Run validator every N executor iterations (default: 1).
  -h, --help             Show this message.

Environment:
  CODEX_BIN              Path to Codex CLI binary (default: "codex").
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

require_codex() {
  if ! command -v "$CODEX_BIN" >/dev/null 2>&1; then
    die "Codex CLI ('$CODEX_BIN') not found. Install it or set CODEX_BIN."
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --goal)
        GOAL_TEXT="$2"; shift 2;;
      --goal-file)
        GOAL_FILE="$2"; shift 2;;
      --workspace)
        WORKSPACE="$2"; shift 2;;
      --max-loops)
        MAX_LOOPS="$2"; shift 2;;
      --force-onboard)
        FORCE_ONBOARD=1; shift;;
      --validate-interval)
        VALIDATE_INTERVAL="$2"; shift 2;;
      -h|--help)
        usage; exit 0;;
      *)
        die "Unknown option: $1"
        ;;
    esac
  done
}

strip_front_matter() {
  awk 'BEGIN{skip=1}
       /^---$/ {
         if (skip) {skip=0; getline; next}
       }
       {if(!skip) print}' "$1"
}

safe_cat() {
  local file="$1"
  if [[ -f "$file" ]]; then
    cat "$file"
  else
    echo "(missing)"
  fi
}

context_snapshot() {
  cat <<EOF
## Session Goal
${GOAL_TEXT:-$(safe_cat "$WORKSPACE/context/optimized_project_goal.md")}

## Project Context
### optimized_project_goal.md
$(safe_cat "$WORKSPACE/context/optimized_project_goal.md")

### inbounds.md
$(safe_cat "$WORKSPACE/context/inbounds.md")

### outerbounds.md
$(safe_cat "$WORKSPACE/context/outerbounds.md")

### tasks.md (excerpt)
$(safe_cat "$WORKSPACE/context/tasks.md")
EOF
}

build_prompt_file() {
  local agent_file="$1"
  local extra_text="$2"
  local tmp
  tmp="$(mktemp)"
  cat >"$tmp" <<EOF
$(strip_front_matter "$agent_file")

$(context_snapshot)

## Additional Guidance
$extra_text
EOF
  echo "$tmp"
}

log_dir="$WORKSPACE/context/logs/codex"
mkdir -p "$log_dir"

append_history() {
  local agent="$1"
  local status="$2"
  local history="$WORKSPACE/context/logs/execution_history.md"
  local timestamp
  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  mkdir -p "$(dirname "$history")"
  {
    echo "- [$timestamp] Agent: $agent — $status"
  } >>"$history"
}

run_agent() {
  local agent="$1"
  local extra="$2"
  local file
  file="$WORKSPACE/.github/agents/$agent.md"
  [[ -f "$file" ]] || die "Missing agent instructions: $file"
  local prompt_file
  prompt_file="$(build_prompt_file "$file" "$extra")"
  local log_file="$log_dir/${agent}-$(date +"%Y%m%d-%H%M%S").log"
  echo ">>> Running $agent ..."
  if "$CODEX_BIN" chat --cwd "$WORKSPACE" --input-file "$prompt_file" | tee "$log_file"; then
    append_history "$agent" "ok (log: context/logs/codex/$(basename "$log_file"))"
  else
    append_history "$agent" "failed (log: context/logs/codex/$(basename "$log_file"))"
    die "Codex CLI failed for $agent. See $log_file"
  fi
  rm -f "$prompt_file"
}

pending_tasks() {
  grep -qE '^- \[ \]' "$WORKSPACE/context/tasks.md"
}

maybe_read_goal() {
  if [[ -n "$GOAL_FILE" ]]; then
    [[ -f "$GOAL_FILE" ]] || die "Goal file not found: $GOAL_FILE"
    GOAL_TEXT="$(cat "$GOAL_FILE")"
  fi
  if [[ -z "$GOAL_TEXT" ]] && [[ -s "$WORKSPACE/context/optimized_project_goal.md" ]]; then
    GOAL_TEXT="$(cat "$WORKSPACE/context/optimized_project_goal.md")"
  fi
  if [[ -z "$GOAL_TEXT" ]]; then
    die "No goal provided and context/optimized_project_goal.md missing. Use --goal or --goal-file."
  fi
}

main() {
  parse_args "$@"
  require_codex
  maybe_read_goal

  if [[ $FORCE_ONBOARD -eq 1 || ! -s "$WORKSPACE/context/optimized_project_goal.md" ]]; then
    run_agent "onboard-agent" "Use the provided goal to initialize context."
  fi

  run_agent "montext-orchestrator" "Plan with the provided goal and ensure tasks are updated."

  local loop=0
  local validator_counter=0
  while pending_tasks; do
    (( loop++ ))
    if (( loop > MAX_LOOPS )); then
      echo "Reached max loops ($MAX_LOOPS). Pending tasks remain."
      break
    fi
    run_agent "task-executor" "Focus on completing the next unchecked task only."
    (( validator_counter++ ))
    if (( validator_counter % VALIDATE_INTERVAL == 0 )); then
      run_agent "validator" "Spot check recent tasks and add corrections if needed."
    fi
  done

  if pending_tasks; then
    echo "Automation finished but tasks remain unchecked. Review context/tasks.md."
  else
    echo "All tasks completed."
  fi
}

main "$@"
