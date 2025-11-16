# Montext + OpenAI Codex Extension Integration Guide

*Last updated: November 2025. Sources: OpenAI “Codex IDE extension” documentation (developers.openai.com/codex/ide) and Anthropic “Code execution with MCP” (Nov 4, 2025).*

## 1. Executive Summary

Montext now targets OpenAI’s Codex extension (`openai.chatgpt`) instead of GitHub Copilot agents. Codex can read, edit, and run your workspace directly from VS Code, Cursor, Windsurf, or Codex CLI cloud sessions. It supports:

- **Approval modes** (`Chat`, `Agent`, `Agent (Full Access)`) that control whether Codex can run commands without prompting.
- **Model switches** between GPT-5 and GPT-5-Codex plus a reasoning-effort dial (low/medium/high) for depth vs speed.
- **Tight IDE integration** (move Codex panel, keyboard shortcuts, @file references, skill persistence).

Anthropic’s MCP article highlights why the Codex integration should lean on *code execution* rather than direct tool calls: load only the tools you need, move large intermediate data through disk handles, and persist reusable “skills.” This guide explains how to apply those principles inside Montext’s context system.

---

## 2. Codex Extension Reference (from OpenAI docs)

1. **Supported IDEs**: VS Code, VS Code Insiders, Cursor, Windsurf (doc: developers.openai.com/codex/ide). Windows is experimental; best results come from WSL + VS Code or macOS/Linux.
2. **Installation**: install `openai.chatgpt` from the marketplace or the IDE-specific links, then restart so the sidebar icon appears. Pin Codex to the right sidebar for quick access.
3. **Sign-in path**: use the ChatGPT account associated with Codex (Plus/Pro/Business/Edu/Enterprise). API-key usage is optional but requires manual quota setup.
4. **Approval Modes**:
   - `Chat`: ask/answer only (good for onboarding or verifying plans).
   - `Agent` *(recommended for Montext)*: Codex can read/write the repo and run commands locally, but asks before leaving the workspace or accessing the network.
   - `Agent (Full Access)`: no prompts; only use when you trust the repo.
5. **Reasoning effort + model switcher**: default GPT-5, but switch to GPT-5-Codex for better agentic coding. Adjust reasoning effort to “medium” for Montext’s day-to-day loop; bump to “high” only for complex refactors due to rate-limit cost.
6. **Keyboard shortcuts**: open Codex → ⚙ → *Keyboard shortcuts* to bind “Toggle Codex”, “Add selection to context”, “Run cloud task”, etc. Encourage the orchestrator to capture these combos in `context/logs/execution_history.md` when new shortcuts are adopted so future sessions stay consistent.
7. **Skill persistence**: Codex can save helper functions under `codex/skills/<name>/` along with a `SKILL.md`. Montext can seed this folder with durable routines (e.g., `codex/skills/context/atomic-write.ts`) that the agent reuses.

---

## 3. Montext Phase Mapping to Codex Features

| Montext Phase | Recommended Codex Mode | Notes |
| --- | --- | --- |
| **Onboarding / Goal Refinement** | `Chat` → `Agent` | Start in `Chat` to capture the raw goal and repository checks, then upgrade to `Agent` to populate `context/*.md` without prompts. |
| **Project Setup / Planning** | `Agent` + GPT-5-Codex (medium reasoning) | Use `plan.prompt.md`, run `codex/servers/*` discovery scripts, and cache hashed handles for large scans. |
| **Autonomous Execution** | `Agent` (default) or `Agent (Full Access)` when you explicitly need background command access or outbound network requests. | Codex runs commands locally, writes to repo via `ContextService`, and loads MCP wrappers on demand. |
| **Validator / Cloud delegation** | Codex CLI cloud tasks or local `Agent` plus Validator handoff. | Cloud tasks keep long refactor/test loops off your laptop; Codex keeps context synchronized so you can open results locally later. |

**Operational tips**

- Keep `.github/agents` as the single source for agent instructions. Codex respects nested agent files when `chat.useNestedAgentsMdFiles` is enabled (see `.vscode/settings.json`).
- When switching between local and cloud runs, persist `context/logs/execution_history.md` plus any hashed payload files so both environments can resolve handles.
- For experiments that should *not* mutate the repo, temporarily drop Codex into `Chat` mode and use scratch buffers before escalating privileges.

---

## 4. MCP Code-Execution Blueprint (per Anthropic’s article)

1. **Generate TypeScript wrappers for MCP servers.** Instead of dumping every tool definition into the context window, create a `codex/servers/` tree (see `codex/servers/template/exampleTool.ts` for a starter):
   ```text
   servers/
     google-drive/
       getDocument.ts
       getSheet.ts
       index.ts
     salesforce/
       query.ts
       updateRecord.ts
       index.ts
   ```
   Each wrapper exports a function that calls the MCP server through Codex’s runtime (Codex CLI or VS Code execution) and returns typed results. Montext agents import only the functions they need, keeping Codex’s context lean.
2. **Store large tool outputs as handles.** When a tool returns a bulky payload (drive docs, logs, spreadsheets), write it to `context/logs/mcp/<hash>.json` and return a descriptor such as:
   ```json
   { "handle": "mcp://logs/lead-sync/5f02d7.json", "summary": "Google Sheet rows mapped to Salesforce IDs" }
   ```
   Later MCP calls accept the handle, load the file locally, and relay only the metadata back through Codex. This removes duplicate token usage and prevents sensitive data from appearing in chats.
3. **Implement deterministic routing rules.** Because the handle never exposes data to the model, you can enforce routing policies (“Google Sheets → Salesforce only”) in the code path before the model sees anything, as suggested in the article.
4. **Persist state & skills.** Use Codex’s filesystem access to save intermediate CSVs, caches, and reusable helpers:
   - `/workspace/leads.csv` for long-running lead audits.
   - `codex/skills/save-handle/` (plus `SKILL.md`) for storing large outputs as handles.
   - Add more skills (e.g., `codex/skills/save-sheet-as-csv/`) whenever Codex synthesizes reusable workflows.
5. **Sandboxing reminders.** The article cautions that code execution introduces operational overhead. Keep Codex in `Agent` mode (non–full access) for day-to-day work, limit resource usage, and document any elevated runs in `context/logs/execution_history.md` (who requested, why, what constraints were enforced).

---

## 5. Workspace Configuration Checklist

1. **Extensions** (`.vscode/extensions.json`):
   - Recommend `openai.chatgpt`.
   - Optionally note compatibility with Cursor/Windsurf by linking to `cursor:extension/openai.chatgpt` etc.
2. **Settings** (`.vscode/settings.json`):
   - `chat.useNestedAgentsMdFiles: true` → exposes `.github/agents/**/*.md` to Codex.
   - `chat.experimental.contextProfiles` (if available) to bias Codex toward `context/*.md`. Document manual steps in `Codex-Extension-Montext-Guide.md` if the setting isn’t GA yet.
3. **MCP Layout**:
   - `servers/` folder for wrappers plus tests.
   - `codex/skills/` folder for persistent helpers.
   - `context/logs/mcp/` for hashed payloads (add to `.gitignore` if sensitive).
4. **Runtime scripts**:
   - `scripts/codex-bootstrap.ts` (optional) to scaffold wrappers by introspecting MCP capabilities.
   - `scripts/mcp-cache-prune.ts` to clean unused handles.
   - `scripts/montext-codex.sh` to run Montext end-to-end using the Codex CLI.
5. **Documentation**:
   - Update `README.md` and `system_documentation/README.md` with Codex-first messaging (done in this repo).
   - Reference this guide wherever onboarding instructions mention Codex.

---

## 6. Operating the Codex-Driven Montext Loop

1. **Bootstrap**: run `Install_Montext.ps1` or clone manually, open in VS Code, ensure `openai.chatgpt` is installed, and sign in.
2. **Set Approval Mode**: switch Codex to `Agent`. For background tasks or network access without prompts, temporarily switch to `Agent (Full Access)` but document it.
3. **Load Orchestrator**: open Codex → Agents → `montext-orchestrator`. Supply the `project_goal`. Codex will:
   - Write `context/optimized_project_goal.md`.
   - Refresh `context/inbounds.md`, `context/outerbounds.md`, and `context/tasks.md`.
   - Seed hashed MCP handles as needed.
4. **Execution Loop**:
   - `task-executor` pulls the next pending task, edits files, updates `context/tasks.md`, and logs MCP handles.
   - `context-manager` validates atomic writes and caches hashed payloads.
   - `validator` samples completed tasks; if issues arise, it adds corrective tasks.
5. **Cloud Delegation (optional)**: from Codex, create a cloud task (Codex CLI) when a job would be long-running. The cloud run uses the same `context/` artifacts and MCP wrappers; when it completes, sync diffs locally.
6. **Shut Down**: when all tasks are complete and `context/tasks.md` is empty (besides meta entries), have Codex produce a final summary and archive the context.

> Automation Shortcut: run `./scripts/montext-codex.sh --goal "..."` to drive steps 1–6 automatically via Codex CLI, logging each agent run under `context/logs/codex/`.

---

By grounding Montext in Codex’s approval modes, keyboard shortcuts, and MCP code-execution strategy, you get an agent that acts confidently inside VS Code while keeping token usage and sensitive data exposure under control. Keep this guide alongside the main README so every new workspace spins up with consistent Codex-era expectations.
