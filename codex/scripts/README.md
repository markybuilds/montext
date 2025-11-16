# Codex Automation Scripts

Use this directory for scripts that support Codex-first workflows, for example:

- `generate-wrappers.ts` – introspects connected MCP servers and scaffolds `servers/<name>/<tool>.ts` files.
- `prune-mcp-cache.ts` – cleans stale payload handles under `context/logs/mcp/`.
- `sync-cloud-run.ts` – mirrors Codex CLI cloud task artifacts back into the local workspace.

Document each script with inline comments and mention them in `context/logs/execution_history.md` whenever an agent relies on them.
