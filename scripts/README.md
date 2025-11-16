# Codex Automation Scripts

## `montext-codex.sh`

Runs the full Montext workflow using the Codex CLI (no API key required).

### Prerequisites
1. Install the [Codex CLI](https://github.com/openai/codex) and ensure the `codex` binary is on your `PATH`.  
   Set `CODEX_BIN=/path/to/codex` if you installed it elsewhere.
2. Open this repo in VS Code/Cursor/Windsurf so context files stay up to date.

### Usage
```bash
./scripts/montext-codex.sh --goal "Ship feature X"
```

Key flags:
- `--goal-file goal.txt` – read the goal from a file.
- `--workspace /path/to/repo` – override workspace path.
- `--force-onboard` – rerun onboarding even if context already exists.
- `--max-loops 25` – limit task executor iterations.

Logs are written to `context/logs/codex/`. Each agent run also appends a short note to `context/logs/execution_history.md`.

## Quick-start wrappers

- `run-montext.sh` — interactive Bash wrapper that prompts for a goal and (optionally) forces onboarding before calling `montext-codex.sh`.
  ```bash
  ./scripts/run-montext.sh
  ```
- `run-montext.ps1` — PowerShell equivalent, useful on Windows:
  ```powershell
  ./scripts/run-montext.ps1 -ForceOnboard
  ```
  Use `-CodexBin "C:\path\to\codex.exe"` if the CLI isn’t on your `PATH`.
