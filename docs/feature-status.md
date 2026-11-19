# BDMS Feature Status

**Repository:** `Mercurial999/BDMS`
**Branch:** `feature/phase-2-suppliers`
**Status updated:** 2026-11-09
**Source implementation reviewed:** supplier backend changes committed on this branch

> This is an evidence-based snapshot, not a live dashboard. A feature is not considered fully complete merely because its source compiles. Verification statements below distinguish backend checks from frontend and end-to-end work.

## Official development status

BDMS uses ongoing feature-based development. Work is selected by business priority, defects, feature gaps, operational risk, and verification needs. Historical phase plans are archived and are not active instructions.

## Status definitions

- **Working â€” needs ongoing verification:** implementation is present and the described checks have passed, but complete release testing is not implied.
- **Backend implemented â€” frontend pending:** backend implementation and the stated backend checks are complete; user-facing frontend integration remains.
- **In progress:** active implementation or integration work is underway.
- **Needs improvement / verification:** the feature exists but has known gaps or has not received fresh end-to-end verification.
- **Planned:** not yet implemented or not yet started.
- **Blocked / decision needed:** work depends on a business or technical decision.

## Feature overview

| Feature / area | Current status | Evidence and next action |
|---|---|---|
| Authentication | Working â€” needs ongoing verification | Login/JWT and active-account checks exist. Recheck token/session behavior and API protection when changing access control. |
| Users / Roles / Permissions | Needs verification | Backend and frontend modules exist. Verify the one-Admin/staff rules and endpoint-by-endpoint permission coverage. |
| Products | Working â€” needs ongoing verification | Product UI and backend feature exist. Preserve separation between product details and stock quantity. |
| Inventory | Needs improvement | Inventory module exists. Review database-level whole-number enforcement and every stock-changing path. |
| Stock Movements | Needs verification | Verify IN/OUT/ADJUSTMENT behavior, authorization, and balance-to-ledger reconciliation. |
| Customers | Needs improvement | Customer UI/API exist. Verify backend authentication and permissions on every route. |
| Orders | Needs improvement | Backend Orders API exists, but the frontend Orders page/route was not present in the prior source review. Decide and implement the required staff workflow if still needed. |
| Deliveries | Needs improvement | UI/API and transactional completion logic exist. Verify route protection and re-test insufficient stock, duplicate completion, and rollback. |
| Sales | Working â€” needs ongoing verification | Sales derives from completed deliveries in the current design. Reconcile totals against delivery records. |
| Dashboard | Needs verification | Reconcile displayed metrics and test loading, empty, and error states. |
| Reports | Needs verification | Reconcile outputs against source records and verify report permissions/exports. |
| Suppliers â€” backend | **Backend implemented â€” frontend pending** | Supplier schema/migration, protected CRUD/status API, validation, and soft-deactivation are implemented. Manual API checks passed on the separate `bdms_restore_test` database; backend TypeScript build passed on 2026-11-09. Frontend UI/integration and automated tests remain. |
| Purchase Receiving / Stock-In | Planned | Define supplier/reference/cost requirements and safe exactly-once stock posting before implementation. Supplier master data does not implement receiving or inventory posting. |
| Customer Returns | Planned | Define return eligibility, item disposition, inventory effects, and sales reporting. |
| Delivery Receipt printing | Planned / decision needed | Previously deferred. Confirm layout, numbering, required fields, and reprint behavior with the business. |
| Audit Logs | Planned | Define critical events, actor data, access, retention, and safe metadata. |
| Inventory reconciliation / controls | Needs improvement | Confirm every physical stock change has a matching movement and documented reason. |

## Supplier backend scope and verification

Supplier master-data backend is implemented: required supplier name, optional contact details/notes, ACTIVE/INACTIVE status, protected CRUD/status endpoints, validation, and soft-deactivation/reactivation. Manual API verification on the separate `bdms_restore_test` database and the backend TypeScript build passed on 2026-11-09.

The supplier frontend and automated tests remain outstanding. Purchase receiving and inventory/stock posting are separate features and are not part of supplier master data.

For the detailed implementation record, manual verification scenarios, and known case-insensitive uniqueness race limitation, see [the development log](development-log.md).
## Current review findings

- Verify authentication and authorization on Customer and Delivery APIs.
- The Orders backend feature exists, but the prior reviewed frontend route list had no Orders page/route.
- Review all inventory mutation paths and reconcile inventory balances with stock-movement history.
- The stock-movement service's ADJUSTMENT semantics should remain documented as setting the counted balance unless the business approves a different rule.
- Review whole-number quantity enforcement at the database layer; inspected Prisma quantity columns have used Decimal.
- Delivery completion uses a transaction and corresponding OUT movements; re-test failure and retry paths in a safe database.

## Follow-up work

The detailed, prioritized list of technical follow-ups and candidate features is maintained in [the backlog](backlog.md). Keep this status document focused on the current implementation and verification state; do not duplicate the backlog here.
## Verification record

For each status change, record what changed, which workflow and scenarios were tested, exact commands and outcomes, what remains untested, and the related commit or pull request. Do not mark a feature verified solely because it compiles.
