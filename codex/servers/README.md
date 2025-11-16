# Codex MCP Server Wrappers

Create a folder per MCP server (e.g., `google-drive/`, `salesforce/`). Inside each folder:

1. Mirror the MCP tools with one `.ts` file per tool. Export strongly typed helpers that Codex can import on demand.
2. Use local caching (`context/logs/mcp/`) for large payloads and return handles instead of inlining data into model prompts.
3. Include an optional `index.ts` that re-exports curated helpers for convenience.

This layout follows Anthropic’s *Code execution with MCP* guidance so Codex only loads the tools it actually invokes during a task.
