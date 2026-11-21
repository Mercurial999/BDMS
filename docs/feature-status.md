# BDMS Feature Status

**Repository:** `Mercurial999/BDMS`
**Source baseline:** `main` at commit `e2264b5`
**Status updated:** 2026-11-21

> This is an evidence-based snapshot of the reviewed `main` baseline, not a live dashboard. It does not include unmerged work from feature branches or local working trees. Verification statements distinguish source inspection, manual checks, builds, automated tests, and end-to-end testing.

## Official development status

BDMS uses ongoing feature-based development. Work is selected by business priority, defects, feature gaps, operational risk, and verification needs. Historical phase plans are archived and are not active instructions.

## Status definitions

- **Working — needs ongoing verification:** implementation is present and the described checks have passed, but complete release testing is not implied.
- **In progress:** active implementation or integration work is underway.
- **Needs improvement:** the feature exists but has known gaps or planned refinements.
- **Needs verification:** implementation or historical evidence exists, but current behavior has not been freshly verified.
- **Not in main baseline:** implementation may exist on a separate branch but is not part of the reviewed main commit; review and integrate it before describing it as available on main.
- **Planned:** not yet implemented or not yet started.
- **Blocked / decision needed:** work depends on a business or technical decision.

## Feature overview

| Feature / area | Current status | Evidence and next action |
|---|---|---|
| Authentication | Needs verification | Login/JWT and active-account checks exist. PR #3 integrated route-level `authenticate` and least-privilege `authorize` middleware across Customers, Orders, Deliveries, Sales, Reports, and Dashboard. Representative 401/403/200 checks passed before merge; automated authorization tests and broader endpoint-level regression remain. |
| Users / Roles / Permissions | Needs verification | Backend and frontend modules exist. Route-level permission checks are integrated for the six business route groups. Verify the one-Admin/staff rules and add automated, endpoint-by-endpoint permission coverage. |
| Products | Working — needs ongoing verification | Product UI and backend feature exist. Preserve separation between product details and stock quantity. |
| Inventory | Needs improvement | `PUT /api/inventory/:id` can change quantity without a matching movement. Inventory and movement quantities use Decimal columns and the reviewed Zod schemas accept fractional values. |
| Stock Movements | Needs improvement | Movement creation updates balance and ledger transactionally, but fractional quantities pass validation and `ADJUSTMENT` sets an absolute balance rather than applying a delta. |
| Customers | Needs verification | Customer UI/API exist and the route group is protected by backend authentication and `customers.*` permission checks. Representative access checks passed before merge; CRUD behavior and endpoint-level authorization still need automated/regression coverage. |
| Orders | Needs improvement | Backend Orders API exists and its route group is protected by backend authentication and `orders.*` permission checks. No Orders frontend page/route was found in the reviewed frontend route tree; endpoint-level authorization tests remain. |
| Deliveries | Needs improvement | UI/API and transactional completion logic exist; the route group is protected by backend authentication and `deliveries.*` permission checks. Re-test insufficient stock, duplicate completion, rollback, and endpoint-level authorization. |
| Sales | Needs verification | Sales are derived from completed deliveries and the route group is protected by backend authentication and `sales.read`. Reconcile totals against delivery records and add endpoint-level authorization tests. |
| Dashboard | Needs verification | The Dashboard route group is protected by backend authentication and `dashboard.read`. Representative Administrator access returned 200 before merge; reconcile metrics and test loading, empty, error, and unauthorized states. |
| Reports | Needs verification | The Reports route group is protected by backend authentication and `reports.read`. Reconcile outputs against source records, verify filters/exports, and add endpoint-level authorization tests. |
| Suppliers | Not in main baseline | The reviewed Prisma schema and route composition do not include the Supplier feature. Separate supplier-branch implementation and manual test evidence must not be represented as merged or verified on main. |
| Purchase Receiving / Stock-In | Planned | Define supplier/reference/cost requirements and safe exactly-once stock posting before implementation. Supplier master data does not implement receiving or inventory posting. |
| Customer Returns | Planned | Define return eligibility, item disposition, inventory effects, and sales reporting. |
| Delivery Receipt printing | Planned / decision needed | Previously deferred. Confirm layout, numbering, required fields, and reprint behavior with the business. |
| Audit Logs | Planned | Define critical events, actor data, access, retention, and safe metadata. |
| Inventory reconciliation / controls | Needs improvement | Confirm every physical stock change has a matching movement and documented reason. |

## Backend route security integrated into main

PR #3, **Secure backend business routes with permission-based authorization**, was squash-merged into `main` on 2026-11-21. The merge commit is `e2264b54c435c7a43d9dc83f693293e913d151ba`.

- Applied `authenticate` and least-privilege `authorize` middleware to every route in the Customers, Orders, Deliveries, Sales, Reports, and Dashboard route groups.
- Added the missing `orders.read/create/update/delete` and `dashboard.read` permission seed entries. The existing idempotent seed process assigns seeded permissions to Administrator; the seed completed successfully against the development database before merge.
- Backend `npm run build` passed before merge. The Docker backend image was rebuilt and the container restarted.
- Representative runtime checks before merge: unauthenticated GET requests returned 401 for all six route groups; Warehouse Staff requests returned 403 for all six groups; Administrator requests returned 200 for Dashboard and Customers.
- These are representative route-group checks, not a claim that every individual endpoint was manually exercised. No automated authorization test suite or full end-to-end regression run has been completed.

Remaining work: add automated authorization tests and perform broader endpoint-level regression against the merged `main` baseline.

## Supplier work outside the main baseline

Supplier master-data implementation and manual API verification were recorded on a separate development branch. That work included a Supplier model/migration, validation, CRUD/status endpoints, and soft-deactivation. Manual checks used the separate `bdms_restore_test` database; the backend build was also reported as passing at that time.

**This work is not present in the reviewed `main` baseline.** Do not describe Suppliers as implemented on main until the relevant branch changes are reviewed, integrated through a pull request, and verified against the resulting main commit. The supplier frontend and automated tests were still outstanding in the recorded implementation notes. Purchase receiving and inventory posting are separate features.

The recorded supplier-name pre-check was case-insensitive, while the database unique index was case-sensitive; concurrent differently-cased inserts therefore remained a known race risk. See the [development log](development-log.md).

## Current main-baseline findings

- The Customer, Orders, Deliveries, Sales, Reports, and Dashboard route groups now apply backend `authenticate` and least-privilege `authorize` middleware. Automated authorization tests and broader endpoint-level regression remain outstanding; frontend route guards alone do not secure API endpoints.
- The Orders backend exists, but no Orders frontend page/route was found in the reviewed frontend route tree.
- `PUT /api/inventory/:id` can change an inventory quantity without creating a corresponding Stock Movement.
- Inventory and Stock Movement quantities are Decimal in Prisma, and the reviewed Zod schemas do not enforce integers.
- The Stock Movement `ADJUSTMENT` implementation treats the submitted quantity as the replacement balance, not a signed delta.
- Delivery completion deducts stock, creates `OUT / SALE` movements, and updates Delivery/Order status in one transaction. Failure, retry, and concurrency behavior still need regression testing.
- The Delivery UI currently supports one product line when creating a delivery, although the backend supports multiple delivery items.

## Follow-up work

The detailed, prioritized list of technical follow-ups and candidate features is maintained in [the backlog](backlog.md). Keep this status document focused on the current implementation and verification state; do not duplicate the backlog here.

## Scope and verification record

The source baseline for this snapshot is `main` commit `e2264b5` (2026-11-21). The findings above come from source inspection and previously recorded, separately scoped manual test evidence; they are not a claim that the entire application was executed or regression-tested on this commit. The route-security build and representative runtime checks were completed before merge, not as part of this documentation update. No local frontend/backend build, automated test suite, exhaustive API security test, or end-to-end regression was run for this documentation change.

For each future status change, record what changed, the exact branch/commit, workflow and scenarios tested, commands and outcomes, what remains untested, and the related pull request. Do not mark a feature verified solely because it compiles.
