<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Like you did before when you gave me the setup guide could you do that again for the onboarding implementation in detail in a way that I can easily understand.

Here is a clear and detailed step-by-step implementation guide to create an onboard agent for the Montext system that can automate onboarding of existing projects:

***

# Montext Onboard Agent Implementation Guide

## Goal

Build an onboard agent that:

- Takes an existing project and a project goal as inputs
- Initializes Montext context (goal, boundaries, tasks)
- Analyzes the project codebase to generate success criteria, constraints, and tasks
- Seeds the initial task queue with gaps or refinements from the existing code
- Hands control to the core Montext autonomous execution engine

***

## Step 1: Define the Agent Role \& Configuration

Create a specialized agent file `.github/agents/onboard-agent.md` with instructions and handoffs:

```markdown
---
name: Onboard Agent
description: Analyzes existing projects and initializes Montext context for autonomous execution
tools:
  - search
  - read_file
  - edit_file
  - fetch
handoffs:
  - label: Start Autonomous Execution
    agent: montext-master
    prompt: Begin autonomous execution with initialized context
    send: false
---

# Onboard Agent Instructions

1. Receive the initial project goal and existing codebase location.
2. Initialize or verify Montext context folders and sacred files.
3. Write the optimized project goal to context/optimized_project_goal.md.
4. Analyze the repository structure and existing code:
   - Identify implemented features
   - Locate missing or incomplete features
   - Detect code quality and testing gaps
5. Generate 20 inbounds (success criteria) and 20 outerbounds (constraints), tailored to current state and project goals.
6. Seed context/tasks.md with actionable tasks to complete missing or improvement areas.
7. Atomically update all context files.
8. Log all decision rationale in context/logs/execution_history.md.
9. Autonomously hand off control to the Montext Master Agent.
```


***

## Step 2: Implement Key Onboarding Functions

Within the onboard agent implementation (TypeScript, or your agent language):

- **Context Initialization**:
    - Check or create `.github/agents/`, `context/`, `.vscode/` directories if missing.
    - Initialize `context/` files if not present.
- **Goal Writing**:
    - Write the user-provided project goal to `context/optimized_project_goal.md`.
- **Codebase Analysis**:
    - Use the `search` and `read_file` tools to scan repo files.
    - Summarize current implementation state.
    - Detect features, missing requirements, tests, and docs.
- **Boundary Generation**:
    - Generate deterministic `inbounds.md` and `outerbounds.md` scoped to existing project and goal.
    - Follow the Montext format of 20 optimized positive and negative criteria.
- **Task Seeding**:
    - Create an initial set of `tasks.md` from discovered gaps.
    - Seed typical onboarding tasks like setup verification, missing feature implementations, refactoring, test writing.
- **Atomic Updates \& Logging**:
    - Use atomic write APIs to update context files.
    - Log decisions and results with timestamps and rationale.

***

## Step 3: Onboard Agent Lifecycle

1. **Receive input**: "Onboard this existing project with goal X."
2. **Initialize context**: Create folders and files.
3. **Analyze repository**: Scan and identify current state.
4. **Produce boundaries and tasks**: Write inbounds, outerbounds, and task list.
5. **Persist context**: Atomically save all files.
6. **Handoff**: Trigger Montext Master Agent to begin autonomous execution.

***

## Step 4: Integrate Onboard Agent into Montext Workflow

- Add onboard agent as the first phase in your Montext pipeline.
- After receiving a project goal, launch this agent to bootstrap context.
- Onboard agent automates heavy-lifting of project understanding and setup.
- After successful onboarding, control seamlessly flows to the core autonomous loop for execution.

***

## Additional Tips

- Use subagents where appropriate to parallelize analysis tasks.
- Maintain strict atomicity and logging to avoid corruption and enable tracing.
- Validate integrity of initial context files before handoff.
- Provide clear, deterministic outputs for inbounds, outerbounds, and tasks for consistency across runs.

***

## Summary

The onboard agent is a specialized autonomous agent responsible for bridging an existing codebase with Montext's strict context and autonomous execution model. It handles all context bootstrapping, codebase scanning, success criteria generation, and task seeding — requiring zero manual intervention beyond project goal input. Once onboarded, the Montext Master Agent proceeds to full autonomous project delivery.

***

This detailed guide should enable an implementer to create a robust onboard agent facilitating smooth adoption of Montext on any existing project.
<span style="display:none">[^1]</span>

<div align="center">⁂</div>

[^1]: montext_summary.md

