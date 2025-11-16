# Codex Workspace Assets

This directory organizes all Codex-specific scaffolding so every workspace starts with the same predictable structure.

## Structure

- `servers/` – TypeScript (or JS/TSX) wrappers for MCP servers. Each server gets its own folder and each MCP tool one file so Codex can `import` only what it needs.
- `skills/` – Saved helper functions, scripts, or workflows plus a `SKILL.md` describing how an agent should call them (path: `codex/skills/<skill>`).
- `scripts/` – Automation helpers for generating wrappers, pruning caches, or syncing Codex CLI cloud runs.

See `system_documentation/Codex-Extension-Montext-Guide.md` for end-to-end guidance on how the Codex extension expects these folders to be used.
