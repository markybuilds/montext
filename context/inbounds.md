# Inbounds (20)

1. Ground all decisions in the Anthropic "Code Execution with MCP" pattern, including tool registration, capability negotiation, and sandbox lifecycle expectations.
2. Treat `ContextService` as the single gateway for reading/writing state and extend it only through documented atomic APIs.
3. Preserve Montext's requirement for append-only execution logs with timestamps, component names, and status markers.
4. Document how MCP code execution augments the existing task executor loop without bypassing the context-manager agent.
5. Define an MCP server configuration that can run locally (e.g., via Node or Python) without extra SaaS dependencies.
6. Outline the minimal set of MCP tools (`run_code`, `read_file`, `write_file`, etc.) required to realize autonomous code execution inside Montext.
7. Specify how MCP tool outputs should be summarized back into `context/logs/execution_history.md`.
8. Call out security boundaries such as filesystem sandboxing, resource caps, and secret isolation.
9. Ensure the plan covers failure handling for tool crashes, timeouts, or invalid responses coming from the MCP server.
10. Clarify how tasks in `context/tasks.md` are tagged or structured when they require MCP code execution.
11. Include guidance for orchestrating MCP server startup/shutdown inside VS Code Insiders or CLI workflows.
12. Provide a migration sequence so existing Montext projects can adopt the MCP-enabled context without losing history.
13. Emphasize deterministic, reproducible task runs through pinned container images or interpreter versions.
14. Reference how MCP telemetry can feed validator agents for auditing completed work.
15. Align with `.github/agents/*` instructions—no new agent types are introduced, only capabilities.
16. Define how MCP tool schemas are documented so downstream agents understand argument contracts.
17. Describe how to parallelize MCP executions safely without corrupting context state.
18. Maintain compatibility with GitHub Copilot Plan Mode's expectation for deterministic task queues.
19. Include at least one example of translating a context task into a concrete MCP tool invocation.
20. Keep all documentation self-contained inside `context/*.md` files so downstream agents need no external references.
