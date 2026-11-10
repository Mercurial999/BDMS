# BDMS Git and Branching Workflow

**Status:** Official project workflow  
**Applies to:** All BDMS development, maintenance, documentation, and integration work  
**Default stable branch:** `main`

This document is the source of truth for BDMS Git branching and integration. If an older plan, archived note, branch name, or conversation conflicts with this document, follow this document unless the project owner explicitly approves a change.

## 1. Branch model

- `main` is the single stable, integrated branch. It should contain reviewed changes that have passed the project's required verification.
- Create short-lived working branches from the latest `origin/main`.
- Use one branch for one focused feature, fix, chore, or documentation change.
- Do not use a permanent phase-specific integration branch. Project milestones belong in documentation, not long-lived Git branches.
- Do not develop directly on `main`.
- Do not merge an unfinished feature branch into `main` just to preserve progress.

Recommended names:

| Work type | Naming convention | Example |
|---|---|---|
| Feature | `feature/<short-description>` | `feature/suppliers` |
| Bug fix | `fix/<short-description>` | `fix/delivery-stock-validation` |
| Documentation | `docs/<short-description>` | `docs/git-workflow` |
| Maintenance | `chore/<short-description>` | `chore/remove-generated-output` |

Use lowercase kebab-case names. Avoid phase prefixes and vague names such as `update`, `test`, or `new-feature`.

## 2. Standard work cycle

For each new task:

1. Confirm the requested outcome and scope.
2. Inspect the repository state and relevant source before editing.
3. Check the current branch, working-tree status, and whether local work is committed.
4. Fetch the latest remote references.
5. Start from an up-to-date `origin/main`:
   - Switch to local `main`.
   - Fast-forward it from `origin/main`.
   - Create a new focused branch from that updated base.
6. Implement only the agreed scope. Avoid unrelated refactors.
7. Run the relevant tests, builds, lint checks, API checks, and regression scenarios.
8. Review the complete diff for accidental changes, secrets, generated files, unrelated formatting, and risky database changes.
9. Update feature status and development documentation when the implementation or verification state changes.
10. Commit and push the branch when the owner is ready.
11. Open a pull request targeting `main`, review it, complete required checks, and merge only after acceptance criteria are met.

Do not assume that a successful build proves the feature is fully tested. Record exactly what passed and what remains unverified.

## 3. Pull-request and merge rules

- All feature integration targets `main`.
- Prefer a pull request for review and a visible record of scope, test evidence, and discussion.
- A pull request must describe the business purpose, key implementation changes, database/migration impact, verification performed, and known limitations.
- Resolve review feedback and ensure required checks pass before merging.
- Do not merge a branch with unrelated changes, unexplained deletions, secrets, unreviewed migrations, or unresolved data-loss risk.
- Do not force-push shared branches or rewrite published history unless the owner explicitly approves a recovery plan.
- Use the repository's selected merge method consistently. Prefer a clean, understandable history; do not squash away useful history without considering whether the branch contains multiple logical changes.
- After merge, verify that `main` contains the intended change and that the merged result remains buildable/testable.

Branch protection should be enabled on GitHub for `main` after the initial repository integration is complete. Recommended protections: require pull requests, require applicable status checks, block force pushes, and restrict deletion. Do not claim these settings are enabled until they are checked in GitHub.

## 4. Existing branches and legacy history

Existing branches may predate this policy and may contain multiple features, documentation reorganizations, generated-file changes, or historical phase work.

Do not merge a legacy branch directly into `main` merely because it is ahead of `main` or contains useful work.

Before integrating a legacy branch:

1. Fetch and compare it with `origin/main`.
2. Identify its merge base, unique commits, changed files, and logical groups of changes.
3. Inspect important diffs, including deletions, migrations, configuration, generated output, backups, and documentation.
4. Separate unrelated work into focused integration units.
5. Create clean branches from the latest `origin/main`.
6. Transfer only the reviewed changes needed for that unit. Cherry-pick suitable individual commits when their scope is clean; otherwise reconstruct the change carefully from the reviewed diff.
7. Verify each integration unit independently before opening its pull request.

Do not cherry-pick a large range blindly. Do not use a merge, rebase, reset, branch deletion, or branch rename as a shortcut around understanding the history.

For the current legacy Phase 2 history, preserve useful work by reviewing and integrating it in logical groups. In particular, separately review inventory safeguards, permissions, dashboard/report work, Docker configuration, documentation, Suppliers, and generated build output. Do not automatically bring database backup folders, temporary files, unintended deletions, or generated `server/dist` files into `main`.

## 5. Branch retirement

A legacy branch can be deleted only after all of the following are true:

- Its unique commits and file changes have been reviewed.
- Every change worth keeping has been merged or otherwise safely preserved in an appropriate branch.
- Unwanted or obsolete changes have been explicitly identified.
- The resulting `main` state has been verified.
- The owner approves retiring the branch.

Do not delete `phase-2-development`, `feature/phase-2-suppliers`, or any other existing branch before this audit is complete. Retaining a legacy branch temporarily is safer than losing unreviewed work.

## 6. Database and generated-file safeguards

- Confirm the branch, environment, database host, port, and database name before migrations or data-changing commands.
- Use a separate test database for risky schema changes and stock-mutation tests.
- Review migration SQL and the Prisma schema before applying migrations.
- Never run destructive reset or volume-removal commands against a database containing data that must be retained.
- Keep credentials and local environment files out of Git.
- Do not commit generated build output such as `server/dist/` unless the project explicitly changes that policy.
- Review `.gitignore` and the full Git diff before committing.

See [Local Development](local-development.md) for database and Docker safety procedures.

## 7. Required collaboration behavior

Anyone assisting with BDMS development must:

- Explain the purpose and risk of a Git operation before asking the owner to run it.
- Give exact commands for the owner's shell and wait for output before assuming success.
- Inspect before editing and avoid unrelated changes.
- Distinguish remote GitHub state from the owner's local working tree.
- Never claim a local command, test, build, migration, push, or merge succeeded without evidence.
- Ask before any destructive or history-rewriting operation.
- Keep the owner in control of commits, pushes, pull requests, merges, and branch deletion.
- Update this policy only with the owner's approval.

## 8. Initial repository transition

The repository is transitioning from historical phase-based branches to this feature-branch model. Until the transition audit is complete:

- Treat `main` as the intended stable target, but do not assume it already contains every useful feature.
- Keep existing branches intact.
- Review and integrate documentation and application changes in focused groups.
- Do not merge the current broad legacy feature branch directly into `main`.
- Finish the documentation structure and transition audit before integrating application changes.
- Enable `main` branch protection after the initial integration and verification are complete.

The branch model is the long-term policy; the transition audit is a one-time cleanup and integration task.
