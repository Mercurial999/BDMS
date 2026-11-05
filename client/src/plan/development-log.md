# BDMS Development Log

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
