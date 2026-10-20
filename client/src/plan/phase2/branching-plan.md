# Phase 2 Branching & Safety Plan

## Goal
Keep `main` as the stable Phase 1 baseline. Build and test Phase 2 separately.

## Branch Workflow
1. **`main`** — stable Phase 1; do not develop Phase 2 directly here.
2. **`phase-2-development`** — integration branch for approved Phase 2 work.
3. Create one feature branch at a time from `phase-2-development`, e.g. `feature/phase-2-suppliers`.
4. Test the feature, then merge it into `phase-2-development`.
5. After all Phase 2 regression checks pass, open a pull request from `phase-2-development` to `main`. Merge only after review and approval.

## Before Starting
- Confirm the working tree is clean and commit or safely stash unfinished work.
- Pull the latest `main`; create `phase-2-development` from it.
- Back up the database and keep secrets in local environment files, never Git.
- Record the Phase 1 build and core workflow test results.

## For Every Feature
- Use a separate feature branch; avoid unrelated changes.
- Plan and review Prisma schema changes and migrations before applying them.
- Test the API, UI, permissions, inventory quantities, and affected Phase 1 workflows.
- Run frontend/backend builds and Docker smoke tests when relevant.
- Merge only after tests pass; fix issues on the feature branch first.

## Important
Branches isolate code changes, but **do not isolate the database**. Use a separate development database for Phase 2 migrations and testing. Keep backups, and do not apply untested migrations to the Phase 1 database.
