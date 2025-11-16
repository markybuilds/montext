# Montext Autonomous System

Montext is a fully autonomous, OpenAI Codex–optimized development system designed to take a single high-level project goal and drive it all the way to completion without requiring human intervention after initialization.

This repository is configured for the November 2025 Codex Extension + Codex CLI ecosystem (Agent / Chat approval modes, plan-first workflows, MCP-backed code execution) and uses a small set of well-defined components:

- Global instructions for agent behavior
- Specialized Codex agents (onboard, orchestrator, executor, context manager, validator)
- A context-driven task loop (`context/*.md` files)
- Optional runtime stubs under `src/` for a concrete implementation
- MCP-aware code execution practices derived from Anthropic’s *Code execution with MCP* (Nov 4, 2025) to keep token usage low while scaling to many tools

---

## High-Level Flow

1. **User requests onboarding for an existing project** (with a `project_goal`).
2. **Onboard Agent** (`.github/agents/onboard-agent.md`):
   - Ensures `context/` structure and sacred files exist.
   - Writes an optimized project goal.
   - Analyzes the existing codebase.
   - Generates 20 inbounds and 20 outerbounds.
   - Seeds `context/tasks.md` with gaps, improvements, and alignment tasks.
   - Logs rationale to `context/logs/execution_history.md`.
   - Hands off to `montext-orchestrator`.
3. **Montext Orchestrator** (via Plan Mode + `montext-orchestrator` agent):
   - Optionally refines plan using `plan.prompt.md`.
   - Coordinates phases and delegates execution.
4. **Task Executor Agent** runs autonomously:
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

- `system_documentation/Codex-Extension-Montext-Guide.md` — Integration guide for the Codex extension, Codex CLI, and MCP-backed workflows.
- `codex/README.md` — Layout for Codex-specific scaffolding (`servers/`, `skills/`, `scripts/`).
- `codex/servers/` — House MCP wrappers so Codex can import only the tools it needs per task (see `codex/servers/template/exampleTool.ts` for a starter pattern).
- `codex/skills/` — Persistent helper scripts + `SKILL.md` manifests to reduce repeated reasoning (e.g., `codex/skills/save-handle` for storing MCP payloads).
- `codex/scripts/` — Automation helpers (wrapper generation, cache pruning, Codex CLI sync).

**Codex Configuration**
- `scripts/montext-codex.sh` — Automation shell that drives agents via the Codex CLI.
- `.github/agents/AGENTS.md` — Global agents contract.
- `.github/agents/onboard-agent.md` — Onboards existing projects into Montext context.
- `.github/agents/montext-orchestrator.md` — Planner/orchestrator agent.
- `.github/agents/task-executor.md` — Executes tasks from `context/tasks.md`.
- `.github/agents/context-manager.md` — Manages context integrity (instructions).
- `.github/agents/validator.md` — Validates results and enqueues fixes.
- `.github/prompts/plan.prompt.md` — Plan Mode prompt for setup.
- `.github/prompts/execute.prompt.md` — Execution behavior prompt.
- `.github/prompts/validate.prompt.md` — Validation behavior prompt.

**Context**
- `context/optimized_project_goal.md` — Refined goal (written by onboard/orchestrator flows).
- `context/inbounds.md` — 20 in-scope constraints (goal- and codebase-aware).
- `context/outerbounds.md` — 20 out-of-scope constraints.
- `context/tasks.md` — Authoritative task queue (CRITICAL), seeded by onboard agent and maintained by executors.
- `context/logs/execution_history.md` — Log of onboarding and autonomous decisions.
- `context/logs/mcp/` — Payload handles for large tool outputs (never share raw contents with the model).

**Runtime Stubs (Optional Implementation)**
- `src/contextService.ts` — Atomic context I/O and aggregation API.
- `src/boundariesService.ts` — Generates goal/boundaries + seeds tasks.
- `src/coreEngine.ts` — Implements the autonomous loop.
- `src/montextOrchestrator.ts` — Wires everything; run with a `project_goal`.

**VS Code**
- `.vscode/settings.json` — Enables shared chat settings (nested agents, workspace context).
- `.vscode/extensions.json` — Recommends the `openai.chatgpt` Codex extension for VS Code / Cursor / Windsurf.

**Codex + MCP Code Execution**
- Codex runs Montext inside VS Code, Cursor, or Windsurf with the `Agent` approval mode so the system can read/write files and execute commands locally, while escalating only when leaving the workspace (per OpenAI’s Codex IDE guide, Nov 2025).
- MCP servers should be exposed as TypeScript modules rather than raw tool manifests to avoid flooding Codex’s context window. Generate a `codex/servers/<server>/<tool>.ts` tree that wraps MCP calls, then let the agent import just-in-time helpers (Anthropic, *Code execution with MCP*, Nov 4, 2025).
- For large tool responses, persist opaque handles (e.g., hashed filenames) in `context/logs/` and teach Montext to share only the handle inside chats/tasks. When another MCP call needs the payload, resolve it inside the execution sandbox instead of re-tokenizing it through the model.
- Encourage agents to persist reusable snippets under `codex/skills/` (plus `SKILL.md`) so Codex can grow a library of deterministic helpers without re-discovering patterns every session.

---

## System Flow (Mermaid Diagram)

```mermaid
flowchart TD
    U[User<br/>Requests onboarding<br/>with project_goal] -->|Start Onboarding| ONB[Onboard Agent<br/>(.github/agents/onboard-agent.md)]

    subgraph ONBOARD[ONBOARDING EXISTING PROJECT]
        ONB -->|Ensure exists| CTXDIR[context/ & logs/]
        ONB -->|Write| OPG[context/optimized_project_goal.md]
        ONB -->|Analyze repo & derive| INB[context/inbounds.md]
        ONB -->|Analyze repo & derive| OUTB[context/outerbounds.md]
        ONB -->|Seed tasks from gaps| TASKS[context/tasks.md]
        ONB -->|Log rationale| LOGS[context/logs/execution_history.md]
    end

    ONB -->|Handoff| ORCH[Montext Orchestrator Agent<br/>(.github/agents/montext-orchestrator.md)]

    subgraph PLAN[INITIALIZATION & PROJECT_SETUP]
        ORCH -->|Use Plan Mode<br/>& plan.prompt.md| BOUND[Optional extra planning]
        BOUND -->|Refine if needed| OPG
        BOUND -->|Refine tasks| TASKS
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

1. **In VS Code / Cursor / Windsurf with the Codex extension installed** (`openai.chatgpt`):
   - Sign in with the ChatGPT account tied to your Codex plan (per OpenAI’s Codex IDE extension guide, Nov 2025).
   - Switch Codex to the `Agent` approval mode so it can read/write files and run commands inside this workspace without prompting.
   - Start a Codex session that loads `.github/agents/montext-orchestrator.md` (Codex automatically surfaces nested agents when `chat.useNestedAgentsMdFiles` is on).
   - Provide a single high-level `project_goal`.

2. **The system should then**:
   - Run planning (`plan.prompt.md`) to refresh the optimized goal, boundaries, and `context/tasks.md`.
   - Execute tasks via `task-executor` in the same workspace, leveraging MCP wrappers under `codex/servers/` to only load the tools that matter for the current step.
   - Use the context manager semantics to keep state consistent and log high-volume tool data behind hashed handles in `context/logs/mcp/`.
   - Call the validator periodically (or after completions) to append corrective tasks.

3. **Automated CLI option**:
   - Install the [Codex CLI](https://github.com/openai/codex) and ensure the `codex` binary is on your `PATH`.
   - Run the interactive wrapper `./scripts/run-montext.sh` (Bash) or `./scripts/run-montext.ps1` (PowerShell) and enter your project goal when prompted. Both wrappers call `montext-codex.sh` under the hood.
   - Alternatively, invoke `./scripts/montext-codex.sh --goal "Your project goal"` directly for scripted/CI usage.
   - The script invokes the onboard, orchestrator, executor, and validator agents sequentially, looping until `context/tasks.md` has no unchecked tasks.
   - Logs for each Codex run are stored under `context/logs/codex/`, and summaries are appended to `context/logs/execution_history.md`.

4. **Optional runtime**:
   - Implement the TODOs in `src/contextService.ts`, `src/boundariesService.ts`, and `src/coreEngine.ts`.
   - Create a small CLI or script that instantiates `MontextOrchestrator` and calls `run(project_goal)`.
   - Wire Codex CLI background sessions (cloud agent mode) to the same context structure if you want Codex to work asynchronously in OpenAI’s cloud.

## Montext Realms — Browser RPG Demo

Looking for a tangible example experience? Open `web/rpg/index.html` in any modern browser and explore a self-contained RPG prototype powered by Three.js (no build tooling required). The demo showcases:

- Smooth WASD navigation with sprinting (Shift) and manual camera orbit (Q/E) anchored to the courier avatar.
- Combat (Space to swing an energy blade), stamina + health bars, and a roaming guardian that can defeat or be defeated.
- A mini quest: approach the Seer, collect three astral shards scattered around the valley, dispatch the guardian, then return for debrief.
- Procedural scenery (terrain, crystals, obelisk, rocks) that renders instantly because every asset lives inside `web/rpg/`.

Because it is pure static content, you can drag the folder into any static host or simply double-click the HTML file—perfect for showcasing Montext outputs inside the same repository.

This README reflects the new Codex-first system state and visually documents how Montext’s autonomous flow operates end-to-end.
