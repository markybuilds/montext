# Task Backlog

## Immediate (execute sequentially)
1. [ ] **Dry-run + document Codex CLI automation**
   - Run `scripts/montext-codex.sh --goal "Demonstrate Codex automation"` in workspace-write mode.
   - Capture command output in `context/logs/codex/` and summarize observations + gaps inside `context/logs/execution_history.md`.
   - Output: log file reference, checklist of blockers/unblocked steps.
2. [ ] **Publish Codex quickstart in README**
   - Add a CLI-focused snippet showing prerequisites, command invocation, expected log artifacts, and how to continue execution using context files.
   - Reference `system_documentation/Codex-Extension-Montext-Guide.md` for deeper instructions.
   - Output: README section titled “Codex Automation Quickstart” (or similar) that mentions context + script hand-off.
3. [ ] **Audit `codex/` scaffolding**
   - Verify every referenced server/skill/script path exists (especially those cited in README + docs).
   - If discrepancies exist, list TODOs in `context/tasks.md`.
   - Output: note in execution log summarizing findings; new tasks if fixes required.
4. [ ] **Update system documentation**
   - Add an addendum/section to `system_documentation/Codex-Extension-Montext-Guide.md` that calls out the “Demonstrate Codex automation” context and how agents should reference `context/*.md`.
   - Output: section referencing context goal + logging expectations.
5. [ ] **Define offline validation steps**
   - Document lint/test/docs checks Codex can run without network (e.g., `npm test`, `npm run lint`, `scripts/montext-codex.sh --goal ... --max-loops 1` dry-run).
   - Update README or a new doc so future agents can reuse them.
   - Output: explicit command list with pass criteria.
6. [ ] **Cross-link execution history**
   - Ensure every entry in `context/logs/execution_history.md` links to a log file (existing + new runs).
   - Output: updated history plus new log entries describing today’s updates.
7. [ ] **Plan validator follow-up**
   - Draft a task describing when/how to run validator to confirm new inbounds/outerbounds compliance.
   - Output: new checkbox task referencing validator cadence.
8. [ ] **Confirm MCP manifests**
   - Inspect `codex/servers/` for missing manifests or TODO placeholders; add specific remediation tasks if needed.
   - Output: updated tasks list showing any missing components and where to add them.

## Additional Guidance
- Keep execution notes synced to `context/logs/`.
- Reference `system_documentation/` whenever interpreting agent instructions.
