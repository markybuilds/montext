# Codex Skills

Persist reusable snippets that Codex discovers while executing Montext:

- Place each skill in its own folder (e.g., `codex/skills/save-sheet-as-csv/`).
- Store the implementation alongside a `SKILL.md` describing inputs, outputs, and guardrails.
- Reference these skills from agents/prompts so Codex reaches for the saved helper instead of re-generating code every run.

This pattern keeps reasoning tokens low and gives Codex a durable toolbox of higher-level behaviors tailored to the project.
