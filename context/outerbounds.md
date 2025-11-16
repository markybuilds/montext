# Outerbounds (Explicitly Out of Scope)

1. Building new external services or APIs unrelated to demonstrating Codex automation.
2. Modifying proprietary Codex CLI binaries or installation packages.
3. Introducing paid third-party dependencies or SaaS integrations.
4. Rewriting the entire Montext architecture or repo structure.
5. Shipping production-ready features for unrelated projects.
6. Making network calls to fetch remote assets or documentation.
7. Editing files outside the repository workspace.
8. Running destructive git commands (`reset --hard`, `clean -fd`, etc.).
9. Implementing the full runtime engine beyond what is needed for this demonstration.
10. Changing automation scripts (`scripts/montext-codex.sh`) in ways that break existing flows without justification.
11. Overhauling MCP server implementations or adding new remote tools.
12. Writing unit/integration tests that require unavailable services.
13. Altering Codex global instructions located in `.github/agents/AGENTS.md`.
14. Uploading repository contents or logs to external systems.
15. Making irreversible schema or data migrations.
16. Editing binary assets or proprietary diagrams unrelated to this goal.
17. Replacing documentation style guides already defined in `system_documentation/`.
18. Changing licensing information or legal notices.
19. Deleting historical log entries or context artifacts.
20. Performing security-sensitive configuration changes (SSH keys, secrets, etc.).
