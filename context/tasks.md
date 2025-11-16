# Task Queue

| Status | ID | Description | Owner | Notes |
| --- | --- | --- | --- | --- |
| [ ] | T1 | Draft MCP-aware `ContextService` design doc covering atomic ops + MCP code execution telemetry | task-executor | Capture file flow diagrams and cross-reference `context/logs` updates |
| [ ] | T2 | Define MCP server contract (tools, args, responses) aligned with Anthropic "Code Execution with MCP" article | task-executor | Include JSON schema and mapping to tasks |
| [ ] | T3 | Outline sandbox lifecycle + resource guardrails for MCP executions inside context-manager responsibilities | context-manager | Clarify backup cadence and rollback triggers |
| [ ] | T4 | Provide migration checklist for existing projects to adopt MCP-enabled context files without disruption | montext-orchestrator | Should reference append-only log strategy |
| [ ] | T5 | Demonstrate example task-to-MCP invocation mapping + validator feedback loop for telemetry | validator | Include sample log entry format |
| [ ] | T6 | Update `.github/mcp.json` template instructions pointing to the MCP code execution server | task-executor | Template can live under `.github` or documentation |
| [ ] | T7 | Audit security and compliance considerations (sandboxing, secrets, network policy) for MCP usage | context-manager | Provide risk table |
| [ ] | T8 | Define monitoring/alerting signals derived from MCP tool exit codes for validator agent | validator | Outline metrics stored in context |
| [ ] | T9 | Document VS Code launch recipe for starting MCP server + Montext agents simultaneously | montext-orchestrator | Mention tasks gating |
| [ ] | T10 | Create backlog triage process for MCP tasks vs. standard tasks ensuring deterministic order | montext-orchestrator | Provide tie-breaking rules |
