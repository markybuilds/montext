# Montext Autonomous System

Montext is a fully autonomous, OpenAI Codex–optimized development system designed to take a single high-level project goal and drive it all the way to completion without requiring human intervention after initialization.

This repository is configured for the November 2025 Codex Extension ecosystem (Agent + Chat approval modes, Codex CLI handoffs, MCP-aware execution) and uses a small set of well-defined components:

- Global instructions for agent behavior
- Specialized Codex agents (orchestrator, executor, context manager, validator)
- A context-driven task loop (`context/*.md` files)
- Optional runtime stubs under `src/` for a concrete implementation
- MCP code-execution practices from Anthropic’s *Code execution with MCP* (Nov 4, 2025) so large tool graphs stay token-efficient

---

## High-Level Flow

1. **User provides `project_goal`** (one-time input).
2. **Montext Orchestrator** (via Plan Mode + `montext-orchestrator` agent):
   - Interprets the goal.
   - Generates optimized goal + inbounds + outerbounds.
   - Seeds `context/tasks.md`.
3. **Task Executor Agent** runs autonomously:
   - Reads context files.
   - Executes tasks directly in the repo.
   - Atomically updates `context/tasks.md`.
4. **Context Manager Agent** ensures integrity:
   - Validates context files.
   - Enforces atomic operations semantics (conceptually via `ContextService`).
5. **Validator Agent**:
   - Audits completed work.
   - Adds corrective/follow-up tasks.
6. Loop continues until goals (as defined in `optimized_project_goal.md` & `inbounds.md`) are met.

---

## Key Files & Directories

- `Codex-Extension-Montext-Guide.md` — Deep-dive on Codex extension setup, Codex CLI, and MCP best practices.
- `../codex/README.md` — Codex scaffolding overview (`servers/`, `skills/`, `scripts/`).
- `../codex/servers/` — MCP wrappers that Codex imports on demand (starter template in `codex/servers/template/exampleTool.ts`).
- `../codex/skills/` — Persistent helper implementations with `SKILL.md` metadata (e.g., `codex/skills/save-handle/`).
- `../codex/scripts/` — Scripts for wrapper generation, cache pruning, and Codex CLI sync.
- `../scripts/montext-codex.sh` — Automation shell that drives Montext via the Codex CLI.

**Codex Configuration**
- `.github/agents/AGENTS.md` — Global agents contract.
- `.github/agents/montext-orchestrator.md` — Planner/orchestrator agent.
- `.github/agents/task-executor.md` — Executes tasks from `context/tasks.md`.
- `.github/agents/context-manager.md` — Manages context integrity (instructions).
- `.github/agents/validator.md` — Validates results and enqueues fixes.
- `.github/prompts/plan.prompt.md` — Plan Mode prompt for setup.
- `.github/prompts/execute.prompt.md` — Execution behavior prompt.
- `.github/prompts/validate.prompt.md` — Validation behavior prompt.

**Context**
- `context/optimized_project_goal.md` — Refined goal.
- `context/inbounds.md` — 20 in-scope constraints.
- `context/outerbounds.md` — 20 out-of-scope constraints.
- `context/tasks.md` — Authoritative task queue (CRITICAL).
- `context/logs/execution_history.md` — Agent rationale log.
- `context/logs/mcp/` — Hashed payload handles for large tool responses.

**Runtime Stubs (Optional Implementation)**
- `src/contextService.ts` — Atomic context I/O and aggregation API.
- `src/boundariesService.ts` — Generates goal/boundaries + seeds tasks.
- `src/coreEngine.ts` — Implements the autonomous loop.
- `src/montextOrchestrator.ts` — Wires everything; run with a `project_goal`.

**VS Code**
- `.vscode/settings.json` — Enables shared chat settings (nested agents, workspace context).
- `.vscode/extensions.json` — Recommends `openai.chatgpt` so Codex is available wherever Montext runs.

**Codex + MCP Execution Highlights**
- Run Montext from Codex’s `Agent` approval mode so it can modify the repo and run terminal commands locally; escalate only when Codex needs network or cross-workspace access (per OpenAI Codex IDE docs, Nov 2025).
- Represent MCP servers as importable modules so only the tools required for the active task are loaded, following Anthropic’s code-execution pattern of generating a `codex/servers/<name>/<tool>.ts` tree and lazily importing helpers.
- Persist large tool responses as hashed handles inside `context/logs/mcp/` and hand the handle to subsequent MCP calls rather than re-tokenizing payloads through Codex.
- Capture reusable logic under `codex/skills/<name>/` with a local `SKILL.md` so Codex can self-bootstrap higher-level workflows over time.

---

## System Flow (Mermaid Diagram)

```mermaid
flowchart TD
    U[User<br/>Provides project_goal (once)] -->|Initial instruction| ORCH[Montext Orchestrator Agent<br/>(.github/agents/montext-orchestrator.md)]

    subgraph PLAN[INITIALIZATION & PROJECT_SETUP]
        ORCH -->|Use Plan Mode<br/>& plan.prompt.md| BOUND[Boundaries / Planning Logic]
        BOUND -->|Write| OPG[context/optimized_project_goal.md]
        BOUND -->|Write| INB[context/inbounds.md]
        BOUND -->|Write| OUTB[context/outerbounds.md]
        BOUND -->|Seed tasks| TASKS[context/tasks.md]
    end

    ORCH -->|Handoff| EXEC[Task Executor Agent<br/>(.github/agents/task-executor.md)]

    subgraph EXEC_LOOP[AUTONOMOUS_EXECUTION]
        EXEC -->|Read
                 optimized_project_goal.md,
                 inbounds.md,
                 outerbounds.md,
                 tasks.md| DECIDE[Select Next Pending Task]

        DECIDE -->|Implement change in repo| APPLY[Code / Docs / Config Changes]
        APPLY -->|On success| UPDATE_TASKS[Update context/tasks.md atomically]

        subgraph CTX[Context Manager Agent]
            CTX -->|Validate & enforce| TASKS
            CTX -->|Ensure atomic ops,
                     backups, integrity| LOGS[(Execution History / Logs)]
        end

        UPDATE_TASKS --> CTX
        UPDATE_TASKS --> LOOP_CHECK{Goal Satisfied?<br/>(vs optimized goal & inbounds)}

        subgraph VAL[Validator Agent]
            EXEC -->|When requested or periodically| VAL_RUN[Sample [x] tasks & outputs]
            VAL_RUN -->|If issues| VAL_NEW[Append corrective tasks<br/>to context/tasks.md]
            VAL_NEW --> TASKS
        end

        LOOP_CHECK -->|No| DECIDE
        LOOP_CHECK -->|Yes| COMPLETE[Completion Excellence
Generate final summary,
confirm alignment,
archive context]
    end

    COMPLETE --> DONE[Project Complete<br/>No further human input required]
```

---

## How to Use This Setup

1. **In VS Code / Cursor / Windsurf with Codex installed**:
   - Open this repo and make sure the Codex extension (`openai.chatgpt`) is active.
   - Sign in with the ChatGPT account tied to Codex, then set the approval mode to `Agent` so Montext can operate hands-free.
   - Launch the `montext-orchestrator` agent definition from `.github/agents/montext-orchestrator.md` and provide a single high-level `project_goal`.

2. **The system should then**:
   - Run planning (`plan.prompt.md`) to refresh the optimized goal, boundaries, and seeds for `context/tasks.md`.
   - Execute tasks locally, leaning on MCP wrappers for tool access and the hashed-handle technique for large payloads.
   - Keep context integrity via the context-manager semantics and schedule validator reviews to refine work.

3. **Automated CLI option**:
   - Install the Codex CLI and run `./scripts/montext-codex.sh --goal "..."`.
   - The script orchestrates onboard → plan → task execution → validation until no unchecked tasks remain.

4. **Optional runtime**:
   - Implement the TODOs in `src/contextService.ts`, `src/boundariesService.ts`, and `src/coreEngine.ts`.
   - Create a small CLI or script that instantiates `MontextOrchestrator` and calls `run(project_goal)`.
   - Attach Codex CLI background sessions if you want cloud-hosted execution to manipulate the same `context/` artifacts.

This README reflects the Codex-first system state and visually documents how Montext’s autonomous flow operates end-to-end.
