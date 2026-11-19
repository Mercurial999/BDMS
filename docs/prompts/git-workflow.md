# Reusable Prompt: Follow the Official BDMS Git Workflow

You are assisting with the Bakery Distribution Management System (BDMS) repository.

Before doing Git, branch, commit, pull-request, merge, or repository-integration work, read and follow:

- `docs/git-workflow.md` — the authoritative Git and branching policy.
- `docs/development-guide.md` — the feature-based development process.
- `docs/local-development.md` — local runtime and database safety.
- `docs/feature-status.md` and `docs/backlog.md` when the task concerns feature status or planned work.

## Non-negotiable rules

1. Treat `main` as the only stable integration branch.
2. Start new short-lived `feature/*`, `fix/*`, `docs/*`, or `chore/*` branches from the latest `origin/main`.
3. Do not develop directly on `main`.
4. Do not create or rely on permanent phase-specific integration branches.
5. Do not merge a legacy or broad branch directly into `main` without comparing its history and reviewing its complete diff.
6. Do not run merge, rebase, reset, force-push, branch rename, or branch deletion commands until the history and consequences have been explained and the repository owner has approved the operation.
7. Keep each integration unit focused. Transfer only reviewed logical changes to clean branches from `main`.
8. Verify changes and review the diff before recommending a commit or pull request.
9. Never claim a local test, build, migration, push, or merge succeeded unless the owner provides output or a trusted tool confirms it.
10. Clearly distinguish GitHub remote state from the owner's local working tree.

## Working method

- Explain the next step and why it is needed before giving commands.
- Give exact PowerShell commands when the owner is using Windows PowerShell.
- Keep each step small; ask the owner to run it and share the output before proceeding when local state matters.
- Inspect the current branch, working tree, remote branches, merge base, commits, and file-level diffs before proposing integration.
- Preserve useful work. Do not blindly discard old branches, documentation, migrations, or source changes.
- Check for secrets, temporary files, backups, generated output, unintended deletions, and database risks.
- Update the relevant repository documentation when approved decisions or verified implementation status changes.
- The owner controls commits, pushes, pull requests, merges, and branch deletion.

## Current transition context

The repository has legacy phase-based history and broad branches that may contain multiple logical changes. The transition to the official workflow must be deliberate:

1. Finalize the documentation structure and this Git policy.
2. Audit all existing branches against `origin/main`.
3. Group useful differences into focused integration units.
4. Create clean branches from the latest `origin/main`.
5. Transfer, test, and review one logical unit at a time.
6. Integrate accepted pull requests into `main`.
7. Verify `main`, then enable branch protection.
8. Retire legacy branches only after every unique change has been accounted for and the owner approves.

Do not assume this transition is complete. First inspect the current repository and report what is already done, what remains, and the safest next action. Do not perform a destructive Git operation without explicit approval.
