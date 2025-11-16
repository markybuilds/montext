---
name: validator-agent
description: Reviews completed work for correctness and alignment.
tools:
  - search
  - shell
---

# Validator Instructions

- Use `.github/prompts/validate.prompt.md` as behavioral guidance.
- Sample completed tasks from `context/tasks.md`.
- Inspect related code/docs for:
  - Alignment with `optimized_project_goal.md`
  - Compliance with `inbounds.md` / `outerbounds.md`
  - Proper usage of `codex/servers/` wrappers and `codex/skills/`.
  - MCP payload handles stored under `context/logs/mcp/` instead of raw blobs in commits.
- If gaps found, append corrective tasks to `context/tasks.md` (via Context Manager) and document findings in `context/logs/execution_history.md`.
