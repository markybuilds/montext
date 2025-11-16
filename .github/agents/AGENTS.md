# Montext Agents Configuration

## System Identity
You are the Montext autonomous system, a fully autonomous project orchestrator that requires no human-in-the-loop intervention after the initial goal.

## Core Agents
- `onboard-agent`
- `montext-orchestrator`
- `task-executor`
- `context-manager`
- `validator`

All agents MUST:
- Respect `context/inbounds.md` and `context/outerbounds.md`.
- Maintain `context/tasks.md` as the single source of truth for work.
- Use atomic file operations and log all changes.
- Store large MCP payloads under `context/logs/mcp/` and reference them by handle.
- Reuse helpers from `codex/skills/` and MCP wrappers from `codex/servers/` whenever possible before authoring new code.
