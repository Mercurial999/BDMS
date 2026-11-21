# BDMS Development Log

## 2026-11-21 — Update route-security documentation after PR #3 merge

- **Scope:** Updated the backlog, feature-status snapshot, and development log to reflect the route-security integration into `main`.
- **Changes:** Marked backend route authentication and authorization as integrated through PR #3; retained automated authorization tests and broader endpoint-level regression as outstanding work. Updated the feature-status source baseline to merge commit `e2264b5`. Supplier status and implementation notes were left unchanged.
- **Verification:** Compared the documentation against the merged `main` source and PR #3 merge details. This is a documentation-only change; no application code, database, migration, or configuration was changed. No build, lint, automated test, or end-to-end regression was run for this documentation update.
- **Branch:** `docs/post-merge-route-security-status`; pending local synchronization, review, and pull request.

## 2026-11-21 — Secure backend business routes

- **Feature / area:** Backend authentication and authorization for Customers, Orders, Deliveries, Sales, Reports, and Dashboard.
- **Change:** Added route-level `authenticate` middleware followed by least-privilege `authorize` checks across the route groups. Added the missing `orders.read/create/update/delete` and `dashboard.read` permission seed entries; retained the existing idempotent seed/upsert pattern.
- **Business decision:** Customers use `customers.read/create/update/delete`; Orders use `orders.read/create/update/delete`; Deliveries use `deliveries.read/create/update` (there is no delivery-delete endpoint); Sales use `sales.read`; Reports use `reports.read`; Dashboard uses `dashboard.read`.
- **Verification:** Local backend `npm run build` passed. The permission seed completed successfully against `bdms_db`. The Docker backend image was rebuilt. Representative unauthenticated GET requests returned 401 for each of the six route groups. Warehouse Staff requests returned 403 for Customers, Orders, Deliveries, Sales, Reports, and Dashboard. Administrator requests returned 200 for Dashboard and Customers. These checks do not mean every individual endpoint was manually exercised. No automated authorization suite or full end-to-end regression was run.
- **Remaining work:** Add automated authorization tests and perform broader endpoint-level regression against the merged `main` baseline. Representative route-group checks do not establish that every endpoint has been exercised.
- **Integration:** Merged through PR #3 by squash into `main` at `e2264b54c435c7a43d9dc83f693293e913d151ba` on 2026-11-21. Implementation/build/runtime verification was recorded on `feature/route-security` at code commit `60fc111`.

## 2026-11-19 — Audit documentation against main

- **Scope:** Reviewed the documentation branch against `main` commit `f239ed9`; no application source or database files were changed.
- **Corrections:** Clarified the main-baseline feature status, backend API security gaps, inventory/stock-movement integrity limitations, whole-number validation mismatch, ADJUSTMENT behavior, and the distinction between Supplier work on a separate branch and features integrated into main.
- **Verification:** GitHub source and documentation inspection only. No local frontend/backend build, lint, automated test, migration, database, Docker, or end-to-end checks were run for this documentation audit.
- **Branch:** `docs/repository-documentation`. The changes remain subject to local review and a documentation pull request.

## 2026-11-09 — Implement and verify Suppliers backend

- **Feature / area:** Supplier master data API.
- **Change:** Added the Supplier model and ACTIVE/INACTIVE status, database migration, repository, service, controller, validation schemas, and protected `/api/suppliers` routes. Existing supplier permissions are used for read/create/update/deactivate actions.
- **Business scope:** Supplier name is required; contact person, phone, address, and notes are optional. Records are deactivated rather than deleted. Reactivation is available through update. Purchase receiving and stock posting are not part of this feature.
- **Database safety:** Manual API checks used the separate Docker test database `bdms_restore_test`; no production database was used for this verification.
- **Verification:** Manual API checks passed for list, create, get by ID, status filtering, case-insensitive duplicate rejection (409), blank-name validation (400), update, deactivate/reactivate, soft-deactivation persistence, repeated deactivation rejection (409), and unauthenticated request rejection (401). Backend `npm run build` completed successfully; TypeScript reported no errors.
- **Remaining work:** Suppliers frontend page and API integration; automated tests; full regression testing. The application-level case-insensitive duplicate pre-check does not eliminate a concurrent differently-cased insert race because the database unique index is case-sensitive. Evaluate database-enforced case-insensitive uniqueness as a separate decision.
- **Commit / branch:** `feature/phase-2-suppliers`; this is a historical record of separate-branch work and does not mean the Supplier feature is present in `main`.

## 2026-11-07 — Consolidate repository documentation

- **Decision:** Repository documentation is organized under `docs/`, with the root `README.md` as the entry point and root `ARCHITECTURE.md` as the technical reference.
- **Documentation:** Added `docs/workflows/inventory-and-stock.md` and consolidated historical phase planning context under `docs/archive/phase-based-planning.md`. Updated the development guide, architecture links, feature notes index, frontend README, and local-development cross-reference.
- **Retirement:** Removed duplicate Docker/system-structure guides and retired the old `client/src/plan/` planning set after consolidating its durable content into `docs/workflows/`, `docs/frontend-design-guidelines.md`, and `docs/archive/`. The former Phase 2 tracker and backup files were consolidated into the historical planning archive; no application source was changed.
- **Verification:** GitHub file inspection and documentation-link review only. No local frontend/backend build, lint, database, Docker, or runtime checks were run.

## 2026-11-07 — Retire phase-based planning

- **Decision:** BDMS officially uses ongoing feature-based development. Phase 1 / Phase 2 / numbered phase-completion labels are retired and must not be used as active gates or status labels.
- **Documentation:** `feature-status.md` is the authoritative feature status snapshot; `backlog.md` records flexible follow-up work and open decisions; `docs/development-guide.md` defines the workflow; root `ARCHITECTURE.md` remains the technical reference.
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
