# Reusable AI Development Workflow

This document defines the standard workflow for AI-assisted development in the Bakery Distribution Management System (BDMS). Follow it for each task, especially Phase 2, to protect the working Phase 1 behavior and keep changes reviewable.

## Required reading before each task

Read these repository documents before planning changes:

1. `client/src/plan/phase2/ai-development-workflow.md` (this document).
2. `client/src/plan/phase2/bdms-phasing-plan.md`, if present at the current branch.
3. `client/src/plan/phase2/implementationPlan.md`.
4. `client/src/plan/phase2/progress-tracker.md`.
5. The relevant architecture notes and feature-specific plans.
6. The source files, tests, migrations, and recent Git history relevant to the task.

If a referenced file is missing or has a different path/name, inspect the repository and report that instead of assuming its contents. Treat plans as guidance, not proof of actual code or runtime behavior.

## Development rules

1. **Inspect first.** Review the current implementation, architecture, API contracts, validation, permissions, database schema, tests, and relevant history before proposing edits.
2. **Clarify scope.** State the goal, acceptance criteria, affected files, dependencies, risks, and any business decisions that must be confirmed. Ask before making a material assumption.
3. **Use a dedicated branch.** Create a small feature or documentation branch from the correct development branch. Keep `main` as the stable Phase 1 baseline unless the repository plan explicitly changes that rule.
4. **Keep changes focused.** Follow existing conventions and make only changes required for the task. Avoid unrelated refactors, dependency changes, formatting churn, or generated build artifacts unless explicitly needed.
5. **Preserve user work.** Never discard, reset, overwrite, delete, or clean up uncommitted work, backups, or local files without explicit permission. Do not run destructive database commands or reset a database.
6. **Protect stock integrity.** Inventory is the current stock record and stock movements are the ledger. Do not calculate and persist authoritative stock quantities in the frontend. Stock-changing operations must follow the approved backend path and maintain matching movement history transactionally.
7. **Protect Phase 1.** Keep existing order, delivery, inventory, sales, dashboard, and reporting contracts compatible unless a scoped change explicitly requires otherwise and is reviewed.
8. **Follow security patterns.** Use existing authentication, authorization, validation, error handling, and API helper conventions. Frontend route hiding is not a replacement for backend authorization. Never expose secrets or log credentials, JWTs, or authorization headers.
9. **Review every diff.** Check changed-file lists and diffs for correctness, regressions, security problems, unrelated edits, and generated files before committing.
10. **Test honestly.** Run checks available in the current environment. Report exact commands and actual outcomes. Never claim tests, builds, migrations, or runtime flows passed unless their results confirm it.
11. **Request local verification when needed.** If a check requires the user's Windows environment, Docker services, local database, credentials, or manual browser testing, provide exact PowerShell commands and explain what each checks. Wait for the results before marking the work verified.
12. **Update plans with evidence.** Update the implementation plan and progress tracker only when the task changes them and evidence supports the status. Record date, branch/commit or PR, checks performed, results, and remaining limitations. Do not mark a feature complete based only on code changes or a successful build.
13. **Do not merge prematurely.** Keep work on its task branch until the diff is reviewed and required tests and acceptance criteria are satisfied. Do not merge to `phase-2-development` or `main` without explicit user approval.
14. **Explain in small steps.** Use clear, beginner-friendly explanations. Explain important design choices and commands before asking the user to run them.

## Standard task sequence

1. Confirm the repository, current branch, and task scope.
2. Read the required plans and tracker; inspect relevant source and history.
3. Summarize the current behavior and identify the smallest safe change.
4. Identify unresolved business rules and ask for decisions before coding when necessary.
5. Create a dedicated branch from the appropriate base.
6. Implement only the approved, task-related change.
7. Review the full diff and check for unrelated files or generated artifacts.
8. Run relevant automated checks and tests; record failures and limitations.
9. Provide exact local test steps for anything not verifiable remotely.
10. Update relevant plan/tracker entries if justified by evidence.
11. Commit the task branch and report its link, commit, files changed, checks, risks, and next step.
12. Wait for review and approval before merging.

## Testing and completion report

For each task, report:

- **Inspected:** plans, source files, tests, schema/migrations, and history reviewed.
- **Branch/base:** task branch and the base branch or commit used.
- **Changes:** each file changed and why.
- **Validation:** exact checks run and their actual results.
- **Local checks remaining:** commands or manual steps the user must perform.
- **Risks/limitations:** known gaps, assumptions, and unverified behavior.
- **Status:** in progress, blocked, ready for review, or ready to merge. “Ready to merge” requires acceptance criteria and required tests to be satisfied; merging still requires user approval.

## Reusable task prompt

Copy and adapt this prompt when starting a new BDMS task:

> Read `client/src/plan/phase2/ai-development-workflow.md`, `client/src/plan/phase2/implementationPlan.md`, `client/src/plan/phase2/progress-tracker.md`, and the relevant architecture/feature documents first. Inspect the actual source code and Git history before editing. Summarize the current behavior, scope, acceptance criteria, affected files, risks, and unresolved business decisions. Create a dedicated branch from the correct base, make only the approved related changes, review the diff, and run the checks available to you. Do not claim unrun tests passed. Give me exact local commands for checks that require my environment. Preserve local changes and backups. Update plans/tracker only when supported by evidence. Do not merge anything without my explicit approval.
