---
status: "implemented"
executed: true
evidence: [".github/workflows/*.yml", "pnpm run verify:ci (79 tests)"]
source_tool: "codex"
source: "Codex task: shore up repository release and workflow maintenance"
topics: ["release-operations"]
digest: "07ee4b0626e682d0e151f07caa685bfbe53a1889ed3d6b86bc4387a01e6bde39"
---

# Upgrade GitHub Actions to native Node 24 runtimes

1. Confirm the current official GitHub Action releases and their declared JavaScript runtime.
2. Upgrade every repository workflow from Node 20-based action majors to the current Node 24-based majors.
3. Remove the temporary `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` compatibility flag.
4. Run the full repository verification and parse every workflow as YAML.
5. Open and merge a maintenance pull request with release publication explicitly skipped.
