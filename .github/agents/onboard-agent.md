---
name: onboard-agent
description: Analyzes existing projects and initializes Montext context for autonomous execution
tools:
  - search
  - fetch
  - runSubagent
  - shell
handoffs:
  - label: Start Autonomous Execution
    agent: montext-orchestrator
    prompt: Begin autonomous execution with initialized context
    send: false
---

# Onboard Agent Instructions

1. Receive the initial project goal (and assume the current repo is the target codebase).
2. Ensure required directories exist (conceptually; use tools rather than assuming):
   - `.github/`
   - `.github/agents/`
   - `.github/prompts/`
   - `context/`
3. Ensure sacred context + Codex scaffolding exist (create if missing):
   - `context/optimized_project_goal.md`
   - `context/inbounds.md`
   - `context/outerbounds.md`
   - `context/tasks.md`
   - `context/logs/execution_history.md` (or equivalent log file)
   - `context/logs/mcp/`
   - `codex/servers/` (with `README.md` stub)
   - `codex/skills/` (with `README.md` stub)
   - `codex/scripts/`
   - `.vscode/extensions.json` recommending `openai.chatgpt`
4. Write the optimized project goal:
   - Refine the provided goal based on the existing codebase and desired outcome.
   - Overwrite `context/optimized_project_goal.md` with this optimized goal.
5. Analyze the repository structure and Codex readiness:
   - Use `search` and subagents to scan source files, tests, docs, and configs.
   - Identify:
     - Implemented features relevant to the goal
     - Missing or incomplete features
     - Code quality gaps (tests, types, docs, structure)
   - Note where Codex-specific assets (skills, MCP wrappers, scripts) should be created or extended.
   - When collecting large MCP tool outputs during analysis, store them under `context/logs/mcp/` and reference them via handles instead of pasting content into prompts.
6. Generate boundaries tailored to this project:
   - Create 20 inbounds (what success looks like given the current code + goal).
   - Create 20 outerbounds (what is out-of-scope / must be avoided).
   - Write them to `context/inbounds.md` and `context/outerbounds.md`.
7. Seed `context/tasks.md` with actionable tasks:
   - Include tasks to:
     - Align existing code with the optimized goal
     - Implement missing features
     - Add/repair tests
     - Improve documentation
     - Fix or refactor critical issues
   - One task per line; designed for autonomous completion by Task Executor.
8. Use atomic-style updates for all context writes:
   - Treat writes as: compute → write complete content → (optionally) log.
9. Log decisions:
   - Append concise entries to `context/logs/execution_history.md` describing:
     - Optimization decisions
     - Key findings from analysis
     - Summary of generated inbounds/outerbounds
     - Summary of seeded tasks
     - Any Codex workspace adjustments (skills created, wrappers scaffolded, approval mode used)
10. Handoff:
    - Once context is initialized and tasks are seeded, hand off to `montext-orchestrator` using the configured handoff.
    - Do not wait for human confirmation; assume the core engine can begin.
