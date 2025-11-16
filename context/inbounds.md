# Inbounds (Success Criteria)

1. Capture the provided session goal inside `context/optimized_project_goal.md` with measurable acceptance criteria.
2. Keep all context updates inside the `context/` directory to preserve atomic workflows.
3. Maintain at least 20 scoped inbounds and 20 scoped outerbounds for traceability.
4. Provide actionable, prioritized tasks in `context/tasks.md` that Codex agents can execute sequentially.
5. Ensure instructions explain how to run `scripts/montext-codex.sh` for hands-free automation.
6. Document how Codex agents should reference `system_documentation` during runs.
7. Validate that context logs (`context/logs/execution_history.md`) capture this onboarding event.
8. Prefer repository-native tooling (Codex CLI, MCP servers) before introducing new dependencies.
9. Keep all new content ASCII-only unless existing files already use other encodings.
10. Explain how Codex automation should demonstrate value using minimal manual intervention.
11. Link tasks to measurable outputs (documentation updates, scripts verified, etc.).
12. Keep instructions aligned with workspace-write sandboxing limitations.
13. Maintain determinism so future Codex runs can replay steps without ambiguity.
14. Reference the Montext README for broader architectural context when needed.
15. Encourage validation steps (lint/test/docs) that can run without network access.
16. Emphasize how Codex agents should log reasoning into `context/logs/` when executing tasks.
17. Keep automation guidance tool-agnostic enough to support both VS Code and CLI workflows.
18. Prioritize improvements that unblock future autonomous execution rather than unrelated refactors.
19. Preserve prior context history entries instead of overwriting them.
20. Align every task and instruction with the overarching demonstration goal.
