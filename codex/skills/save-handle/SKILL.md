---
name: save-handle
summary: Persist large MCP tool outputs to disk and return an opaque handle.
inputs:
  - name: data
    description: Raw string output from an MCP tool or shell command.
  - name: prefix
    description: Optional label for the saved file. Defaults to "payload".
usage:
  steps:
    - import { saveHandle } from "./handle-utils";
    - const { handle } = saveHandle({ data, prefix: "leads" });
    - reference the returned handle in prompts or tasks instead of the raw text.
notes:
  - Files are stored under `context/logs/mcp/`.
  - Handles should be logged in `context/logs/execution_history.md` when created.
---
