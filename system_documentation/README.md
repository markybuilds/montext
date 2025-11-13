# Montext Autonomous System

Montext is a fully autonomous, GitHub Copilot–integrated development system designed to take a single high-level project goal and drive it all the way to completion without requiring human intervention after initialization.

This repository is configured for the November 2025 Copilot Agent ecosystem (Agent HQ, Plan Mode, custom agents, MCP) and uses a small set of well-defined components:

- Global instructions for agent behavior
- Specialized Copilot agents (orchestrator, executor, context manager, validator)
- A context-driven task loop (`context/*.md` files)
- Optional runtime stubs under `src/` for a concrete implementation

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

- `Montext.md` — Master orchestrator spec.
- `montext_summary.md` — Developer-focused spec summarizing all instructions.
- `Copilot-Agent-Montext-Guide.md` — Integration guide for Copilot Agents & VS Code Insiders.

**Copilot Configuration**
- `.github/copilot-instructions.md` — Global behavior for all agents.
- `.github/agents/AGENTS.md` — Global agents contract.
- `.github/agents/montext-orchestrator.md` — Planner/orchestrator agent.
- `.github/agents/task-executor.md` — Executes tasks from `context/tasks.md`.
- `.github/agents/context-manager.md` — Manages context integrity (instructions).
- `.github/agents/validator.md` — Validates results and enqueues fixes.
- `.github/prompts/plan.prompt.md` — Plan Mode prompt for setup.
- `.github/prompts/execute.prompt.md` — Execution behavior prompt.
- `.github/prompts/validate.prompt.md` — Validation behavior prompt.
- `.github/mcp.json` — MCP configuration skeleton.

**Context**
- `context/optimized_project_goal.md` — Refined goal.
- `context/inbounds.md` — 20 in-scope constraints.
- `context/outerbounds.md` — 20 out-of-scope constraints.
- `context/tasks.md` — Authoritative task queue (CRITICAL).

**Runtime Stubs (Optional Implementation)**
- `src/contextService.ts` — Atomic context I/O and aggregation API.
- `src/boundariesService.ts` — Generates goal/boundaries + seeds tasks.
- `src/coreEngine.ts` — Implements the autonomous loop.
- `src/montextOrchestrator.ts` — Wires everything; run with a `project_goal`.

**VS Code**
- `.vscode/settings.json` — Enables Copilot Agents, workspace context, nested agents, MCP.

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

1. **In VS Code Insiders with Copilot Agents enabled**:
   - Open this repo.
   - Start a Copilot Agent session using the `montext-orchestrator` agent.
   - Provide a single high-level `project_goal`.

2. **The system should then**:
   - Run planning (Plan Mode / plan prompt).
   - Populate `context/` files and `context/tasks.md`.
   - Let the `task-executor` agent iterate through tasks.
   - Use `context-manager` semantics to keep state consistent.
   - Use `validator` to refine results until done.

3. **Optional runtime**:
   - Implement the TODOs in `src/contextService.ts`, `src/boundariesService.ts`, and `src/coreEngine.ts`.
   - Create a small CLI or script that instantiates `MontextOrchestrator` and calls `run(project_goal)`.

This README reflects the current system state and visually documents how Montext’s autonomous flow operates end-to-end.
