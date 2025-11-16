# Outerbounds (20)

1. Do not design bespoke networking protocols outside MCP's specification.
2. Avoid relying on proprietary Anthropic infrastructure unavailable to OSS users.
3. Do not replace Montext's multi-agent structure with a single MCP tool runner.
4. No assumptions that MCP servers manage Git history; keep Git operations within Copilot/agent workflows.
5. Do not introduce unvetted third-party binaries or installers into the repo.
6. Avoid storing secrets or tokens directly inside the context files.
7. No prescriptive implementation of a particular programming language runtime—describe options, not mandates.
8. Avoid duplicating the entire Anthropic article verbatim; only extract actionable guidance.
9. Do not require internet access during runtime beyond existing MCP capabilities.
10. No changes to `.github/agents/*.md` outside referencing instructions already present.
11. Avoid redefining `context/logs` schema; extend via existing append-only format.
12. Do not design UI/UX wireframes; stay focused on context and orchestration behavior.
13. No creation of sample MCP server code inside `src/` as part of this task.
14. Avoid altering repository licenses or legal notices.
15. Do not force developers to abandon existing task entries; provide migration hooks instead.
16. Avoid coupling MCP activation to a specific IDE version beyond stating VS Code Insiders baseline.
17. No changes to CI/CD pipelines or GitHub Actions in this pass.
18. Avoid referencing unreleased or speculative MCP features without clarifying assumptions.
19. Do not prescribe production infrastructure (Kubernetes, etc.) beyond local dev context.
20. Avoid modifying non-context directories unless future tasks explicitly depend on them.
