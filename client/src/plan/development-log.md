# BDMS Development Log

## 2026-11-07 — Retire phase-based planning

- **Decision:** BDMS officially uses ongoing feature-based development. Phase 1 / Phase 2 / numbered phase-completion labels are retired and must not be used as active gates or status labels.
- **Documentation:** `feature-status.md` is the authoritative feature status snapshot; `backlog.md` records flexible follow-up work and open decisions; `project-development-guide.md` defines the workflow; root `ARCHITECTURE.md` remains the technical reference.
- **Historical records:** Previous phase roadmaps, implementation plans, progress trackers, and branching notes are retained as historical references, not active instructions.
- **Repository review:** Source snapshot `edd668f476985b23f25ff0626f49d4836c7c163c` was inspected. The Orders API exists but no Orders frontend route was found; Customer and Delivery route protection needs verification; stock adjustment semantics and Decimal database quantity columns were documented.
- **Verification:** GitHub source inspection only. No local build, lint, migration, database, or end-to-end workflow checks were run during this documentation review.
- **Code changes:** None. This entry records a documentation/workflow decision only.

This log records meaningful feature work, business decisions, architecture changes, and verification evidence. Add newest entries at the top. Do not record a check as passed unless its result is known.

## 2026-11-05 — Move to feature-based development documentation

- Decision: use ongoing feature-based development instead of treating Phase 1 / Phase 2 as mandatory sequential gates.
- Keep root `ARCHITECTURE.md` as the technical architecture reference.
- Add a project development guide, system structure, feature status, development log, and Docker guide under `client/src/plan/`.
- Preserve existing phase planning files as historical/backlog context; do not delete them as part of this documentation change.
- Confirm the frontend remains pages-based and the backend remains feature-oriented. No code architecture migration is required.
- Docker decision: distinguish native local development, the current Compose-based container runtime, and a future production deployment configuration.

## Entry template

### YYYY-MM-DD — Short description

- **Feature / area:**
- **Change:**
- **Business decision:**
- **Verification:** commands and exact results; use "not run" when applicable.
- **Remaining work:**
- **Commit / PR:**
