# Montext System Summary for Developers

This document explains how to implement the Montext autonomous system as described across all markdown files in the repo. It consolidates intents, roles, and mechanics into a concrete, buildable architecture.

---

## 1. `Montext.md` — Master Orchestrator (Top-Level Contract)

**Role**: System entrypoint and high-level specification.

**Key Ideas**:
- Montext is a **fully autonomous** agentic system: no human-in-the-loop is required after the initial project goal is provided.
- It must be **lightweight yet powerful**: minimal moving parts, but robust behaviors.
- It coordinates two core subsystems:
  1. `core_autonomous_engine.md`
  2. `context_management_system.md`
- It enforces strict discipline around `tasks.md` and context integrity.

**Implementation Notes**
- This file should be reflected as environment-level configuration (system prompt, bootstrap config, or top-level service wiring).
- It should not contain low-level logic; instead it defines guarantees that lower layers must implement.

**Developer Takeaways**:
- Treat `Montext.md` as the **system prompt / root configuration**.
- On startup:
  - Initialize context management.
  - Initialize the core engine with full authority.
  - Run integrity and recovery routines.
- On each new project:
  - Accept a `project_goal` once.
  - Delegate everything else to the core engine + context system.
- On completion:
  - Ensure summaries, artifacts, and histories are persisted.

**Example (Orchestrator Flow)**
- Input: `"Build a SaaS-style project management dashboard with authentication, teams, and real-time updates."`
- Steps:
  1. `MontextOrchestrator.start(goal)` writes the goal to context (via `ContextService`).
  2. Calls `BoundariesService.generate(goal)` → creates optimized goal + in/out-of-scope.
  3. Calls `CoreEngine.run_until_done()` → handles tasks and execution.
  4. On completion, Montext writes a final report and artifact index.

Implementation-wise, `Montext.md` maps to:
- A top-level Orchestrator class/module that wires dependencies and lifecycle.
- Guarantees:
  - No prompts like “Should I continue?” or “Waiting for user input”.
  - All decisions are delegated to internal policies.

---

## 2. `ARCHITECTURE.md` — System Shape & Consolidation Map

**Role**: Describes how earlier, fragmented workflows are merged into a minimal set of components.

**Key Ideas**:
- Historical workflows (`orchestrator`, `task_builder`, `task_execution`, `project_loop`, etc.) are conceptually preserved but **logically consolidated**.
- Core components now:
  - `Montext.md` — master orchestrator.
  - `core_autonomous_engine.md` — planning + execution.
  - `context_management_system.md` — storage + integrity + logging.
  - `bounderies.md` — project scoping & initial tasks.
- Strong emphasis on:
  - `tasks.md` as the authoritative task graph.
  - Autonomous loop until success.

**Developer Takeaways**:
- Use this file as your **reference blueprint** for mapping legacy concepts into the new codebase.
- All major behaviors (self-healing, loop, task planning, etc.) must be implemented, but **behind fewer modules**.

**Example (Legacy → V2 Mapping)**
- Old `project_loop.md` → now: `CoreEngine.run_until_done()` internal loop.
- Old `task_builder.md` → now: `CoreEngine.generate_tasks_from(inbounds, outerbounds)`.
- Old `atomic_operations.md` → now: methods on `ContextService`.

---

## 3. `Workflows/core_autonomous_engine.md` — Core Autonomous Engine

**Role**: The main brain. Owns planning, execution, decision-making, and self-healing.

**Responsibilities**:
1. **Project Orchestration**
   - Drive phases: INITIALIZATION → PROJECT_SETUP → AUTONOMOUS_EXECUTION → COMPLETION_EXCELLENCE.
2. **Autonomous Decision Making**
   - Full authority: choose tools, design, structure, approaches.
   - Never defers to the user when it can reasonably infer.
3. **Self-Healing**
   - Detects stalls, repeated failures, or corrupt context.
   - Adapts: alternative approaches, decomposes tasks, restores from backups.
4. **Context Management (via API)**
   - Always uses the context system for reads/writes.
5. **Task Lifecycle Management**
   - Generates tasks.
   - Executes tasks.
   - Ensures `tasks.md` is always up to date.

**Core Behaviors to Implement**:

- **Execution Phases**:
  - `INITIALIZATION`:
    - Call context API: integrity check, cleanup, log session start.
  - `PROJECT_SETUP`:
    - Call `bounderies` workflow to produce:
      - `optimized_project_goal.md`
      - `inbounds.md`
      - `outerbounds.md`
      - initial `tasks.md`.
  - `AUTONOMOUS_EXECUTION`:
    - Main loop:
      - Load context snapshot.
      - Select next actionable task(s) from `tasks.md`.
      - Plan solution using “UltraThink” style: multi-step reasoning, alternatives.
      - Execute task (generate code/docs/changes).
      - Use context API to atomically mark completion and log.
      - Optionally append new tasks when gaps are discovered.
  - `COMPLETION_EXCELLENCE`:
    - Check if goal is fully satisfied vs inbounds.
    - If yes: generate final summary, docs, artifacts.
    - Archive state.

**Example (CoreEngine Loop Pseudocode)**
```ts
while (true) {
  const state = ContextService.get_current_project_state();
  if (CoreEngine.is_goal_satisfied(state)) break;

  const task = CoreEngine.select_next_task(state.tasks);
  if (!task) {
    CoreEngine.generate_additional_tasks(state);
    continue;
  }

  const result = CoreEngine.execute_task(task, state);
  ContextService.atomic_update_tasks_md(task, result);
  ContextService.log_operation({ type: 'TASK_COMPLETE', taskId: task.id });
}
CoreEngine.produce_final_artifacts();
```

- **Tasks Enforcement**:
  - After every task:
    - `tasks.md` MUST be updated via atomic write.
    - Use `[x] ...` for completed tasks; preserve history.

- **Decision Framework**:
  - When blocked:
    - Try multiple approaches.
    - Simplify to MVP.
    - Mock or stub dependencies.
    - Keep moving; never stall waiting for human input.

**Developer Implementation Notes**:
- Implement as a state machine or orchestrator service.
- Provide abstractions:
  - `select_next_task()`
  - `execute_task(task)`
  - `update_tasks_md()`
  - `is_goal_satisfied()`
- Ensure idempotence: safe if restarted mid-run.

---

## 4. `Workflows/context_management_system.md` — Context & Storage Layer

**Role**: Strong contract for file I/O, logs, backups, and serving the right context at the right time.

**Key Capabilities**:
1. **Atomic Operations**
   - Lock file (`.lock`) to gate writers.
   - Write to `*.tmp`, validate, backup original, atomic move.
2. **Execution History**
   - Structured logs with timestamps, components, operations, status.
   - Rotation and archival.
3. **Integrity Management**
   - Validation of encoding, non-empty content (where required), cross-file consistency.
   - Periodic sweeps and checksums.
4. **Backup & Recovery**
   - Incremental backups, snapshots, rollback.
5. **Context Optimization**
   - Only load what is needed per operation.
   - Prioritize `optimized_project_goal.md` and `tasks.md`.

**Developer Takeaways**:
- Implement this as a dedicated module/service and treat it as the **only way** to touch:
  - `tasks.md`
  - `optimized_project_goal.md`
  - `inbounds.md` / `outerbounds.md`
  - logs, snapshots.
- Provide a clear API surface (pseudocode):
  - `atomic_read(path)`
  - `atomic_write(path, content)`
  - `log(event)`
  - `create_backup(path)`
  - `verify_integrity()`
  - `get_current_project_state()`
- Design for robustness first; performance second (but it should remain lightweight: simple file operations, not heavy infra).

**Example (ContextService Interface Sketch)**
```ts
interface ContextService {
  atomicRead(path: string): Promise<string>;
  atomicWrite(path: string, content: string, opts?: { backup?: boolean }): Promise<void>;
  log(op: { component: string; operation: string; status: string; details?: any }): void;
  getCurrentProjectState(): Promise<ProjectState>; // aggregates goal, bounds, tasks
}
```

---

## 5. `Workflows/bounderies.md` — Goal Optimization & Scope Definition

**Role**: Takes a raw `project_goal` and produces the structured scope and initial tasks.

**Key Behaviors**:
- Analyze `project_goal` and expand into `optimized_project_goal`.
- Generate:
  - 20 `inbounds` (what the system should consider in scope).
  - 20 `outerbounds` (what to avoid or ignore).
- Save via context management system to:
  - `context/optimized_project_goal.md`
  - `context/inbounds.md`
  - `context/outerbounds.md`
- Initialize `context/tasks.md` with:
  - Setup tasks.
  - Architecture tasks.
  - Core implementation tasks.
  - Testing & docs tasks.

**Developer Takeaways**:
- Implement this as a transform:
  - Input: `project_goal` string.
  - Output files: 3 scope files + seeded `tasks.md`.
- It should be deterministic and machine-consumable:
  - One statement per line.
  - Plain text.
- This is the **first step** the core engine calls for any new project.

**Example (BoundariesService Usage)**
```ts
const goal = input.projectGoal;
await BoundariesService.generate(goal);
// Produces:
// - context/optimized_project_goal.md
// - context/inbounds.md
// - context/outerbounds.md
// - context/tasks.md (initial tasks)
```

---

## 6. Legacy/Empty Workflow Files

Files:
- `Workflows/orchestrator.md`
- `Workflows/task_builder.md`
- `Workflows/task_execution.md`
- `Workflows/project_loop.md`
- `Workflows/execution_history.md`
- `Workflows/atomic_operations.md`
- `Workflows/autonomous_decision_engine.md`
- `Workflows/self_healing_progress.md`

These currently exist but are **empty**. Their logic has been absorbed into:
- `core_autonomous_engine.md`
- `context_management_system.md`
- `bounderies.md`

**Developer Takeaways**:
- Treat these as deprecated stubs.
- Safe to remove or leave as documentation pointers.
- Do not implement new logic here; centralize in the consolidated components.

---

## 7. Context Files Under `context/`

### 7.1 `context/optimized_project_goal.md`
- Target location for the refined project goal.
- Written by `bounderies` and consumed by the core engine.

**Developer**: enforce existence and keep it the single source of truth for “what we are building and why”.

### 7.2 `context/inbounds.md`
- Holds 20 positive, in-scope constraints/targets.
- Used to:
  - Validate decisions.
  - Generate tasks aligned with desired outcomes.

### 7.3 `context/outerbounds.md`
- Holds 20 negative, out-of-scope or anti-goals.
- Used to:
  - Prevent scope creep.
  - Reject or flag tasks/ideas that conflict with constraints.

### 7.4 `context/tasks.md`
- The **most critical runtime artifact**.
- Requirements:
  - Always maintained via context management API.
  - Every change is atomic and logged.
  - Tasks never silently disappear.
- Recommended structure:
  - One task per line.
  - Pending tasks: plain actionable sentences.
  - Completed tasks: prefixed with `[x] `.
  - Optionally annotate “(added by agent)” when system appends.

**Developer Takeaways**:
- Implement `tasks.md` as a minimal, append-only-ish log of work items.
- Core engine logic:
  - Parse tasks into objects.
  - Select next tasks; mark done; append new tasks as needed.

**Example (`tasks.md` lifecycle)**
```text
Set up project structure
Design core domain model
Implement auth module
[x] Initialize git repository
```
- Engine reads, executes "Set up project structure", then rewrites as:
```text
[x] Set up project structure
Design core domain model
Implement auth module
[x] Initialize git repository
```

At present some of these files are placeholders; the system is designed so that they will be programmatically filled.

---

## 8. `Research/Claude-4-Best-Practices/best-practices.md` — Prompting & Behavior Guidelines

**Role**: External guideline document informing how the system should instruct LLMs.

Key principles relevant to Montext implementation:
- Be explicit and detailed in instructions.
- Use XML-like tags to structure prompts logically.
- Use examples that match the desired output format.
- Encourage “don’t hold back” for rich, production-grade outputs.
- Prefer parallel tool calls for independent operations.
- Clean up temporary artifacts.
- Use retrieval and structured context for long context windows.

**Developer Takeaways**:
- When embedding prompts (e.g., system messages for the LLM-powered core engine), follow these conventions:
  - Structured tags: `<system_instructions>`, `<instructions>`, `<examples>`, etc.
  - Clear phase-based instructions.
  - No ambiguous language like “maybe” / “if you want”.
- This file is not executed; it shapes how you design prompts and policies.

**Example (LLM System Prompt Skeleton)**
```xml
<system_instructions>
  <role>You are the Core Autonomous Engine for the Montext system.</role>
  <capabilities>
    <item>Plan tasks from goals and inbounds</item>
    <item>Execute tasks and update tasks.md atomically</item>
    <item>Recover from errors without human input</item>
  </capabilities>
</system_instructions>
```

---

## 9. How to Build Montext (Architectural Blueprint)

Below is a concrete mental model for implementation based on all files:

### 9.1 Components

1. **MontextOrchestrator** (from `Montext.md`)
   - Bootstraps systems.
   - Accepts `project_goal`.
   - Calls `BoundariesService` then `CoreEngine`.

2. **BoundariesService** (from `bounderies.md`)
   - Generate `optimized_project_goal`, `inbounds`, `outerbounds`.
   - Seed `tasks.md`.

3. **ContextService** (from `context_management_system.md`)
   - Atomic read/write.
   - Logging.
   - Backups & integrity.

4. **CoreEngine** (from `core_autonomous_engine.md`)
   - Task planner + executor.
   - Autonomous loop.
   - Self-healing & decision logic.

### 9.2 Control Flow (High Level)

1. `MontextOrchestrator.start(project_goal)`
2. `ContextService.init()` — verify/repair state.
3. `BoundariesService.generate(project_goal)` — write context files.
4. `CoreEngine.run_until_done()`:
   - Loop:
     - State = `ContextService.get_current_project_state()`.
     - task = `CoreEngine.select_next_task(State.tasks)`.
     - If no tasks and goal unmet → generate tasks.
     - Execute task (possibly via LLM/tooling).
     - `ContextService.atomic_update_tasks_md()`.
     - Log via `ContextService.log_operation()`.
     - Check progress vs `optimized_project_goal` + `inbounds`.
5. When satisfied:
   - CoreEngine produces final artifacts and reports.
   - ContextService archives.

### 9.3 Design Principles Derived from All Docs

- **Autonomous by Default**: never block on user input after initial goal.
- **Tasks as the Runtime Contract**: `tasks.md` is the driving queue; strict maintenance is non-negotiable.
- **Context-Safe**: all I/O via atomic operations; integrity checks are first-class.
- **Recoverable**: logs + backups allow restart without losing coherence.
- **Prompt-Structured**: use XML/markdown structure for clarity if LLM-driven.
- **Lightweight Implementation**: standard filesystem + simple modules, no unnecessary infra.

---

This `montext_summary.md` now serves as the authoritative, developer-oriented specification of how all markdown-defined behaviors fit together and how to implement the Montext autonomous system end-to-end.