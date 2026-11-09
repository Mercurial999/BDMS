# BDMS Feature Status

**Repository:** `Mercurial999/BDMS`  
**Branch:** `feature/phase-2-suppliers`  
**Status updated:** 2026-11-09  
**Source implementation reviewed:** supplier backend changes committed on this branch

> This is an evidence-based snapshot, not a live dashboard. A feature is not considered fully complete merely because its source compiles. Verification statements below distinguish backend checks from frontend and end-to-end work.

## Official development status

BDMS uses ongoing feature-based development. Work is selected by business priority, defects, feature gaps, operational risk, and verification needs. Historical phase plans are archived and are not active instructions.

## Status definitions

- **Working — needs ongoing verification:** implementation is present and the described checks have passed, but complete release testing is not implied.
- **Backend implemented — frontend pending:** backend implementation and the stated backend checks are complete; user-facing frontend integration remains.
- **In progress:** active implementation or integration work is underway.
- **Needs improvement / verification:** the feature exists but has known gaps or has not received fresh end-to-end verification.
- **Planned:** not yet implemented or not yet started.
- **Blocked / decision needed:** work depends on a business or technical decision.

## Feature overview

| Feature / area | Current status | Evidence and next action |
|---|---|---|
| Authentication | Working — needs ongoing verification | Login/JWT and active-account checks exist. Recheck token/session behavior and API protection when changing access control. |
| Users / Roles / Permissions | Needs verification | Backend and frontend modules exist. Verify the one-Admin/staff rules and endpoint-by-endpoint permission coverage. |
| Products | Working — needs ongoing verification | Product UI and backend feature exist. Preserve separation between product details and stock quantity. |
| Inventory | Needs improvement | Inventory module exists. Review database-level whole-number enforcement and every stock-changing path. |
| Stock Movements | Needs verification | Verify IN/OUT/ADJUSTMENT behavior, authorization, and balance-to-ledger reconciliation. |
| Customers | Needs improvement | Customer UI/API exist. Verify backend authentication and permissions on every route. |
| Orders | Needs improvement | Backend Orders API exists, but the frontend Orders page/route was not present in the prior source review. Decide and implement the required staff workflow if still needed. |
| Deliveries | Needs improvement | UI/API and transactional completion logic exist. Verify route protection and re-test insufficient stock, duplicate completion, and rollback. |
| Sales | Working — needs ongoing verification | Sales derives from completed deliveries in the current design. Reconcile totals against delivery records. |
| Dashboard | Needs verification | Reconcile displayed metrics and test loading, empty, and error states. |
| Reports | Needs verification | Reconcile outputs against source records and verify report permissions/exports. |
| Suppliers — backend | **Backend implemented — frontend pending** | Supplier schema/migration, protected CRUD/status API, validation, and soft-deactivation are implemented. Manual API checks passed on the separate `bdms_restore_test` database; backend TypeScript build passed on 2026-11-09. Frontend UI/integration and automated tests remain. |
| Purchase Receiving / Stock-In | Planned | Define supplier/reference/cost requirements and safe exactly-once stock posting before implementation. Supplier master data does not implement receiving or inventory posting. |
| Customer Returns | Planned | Define return eligibility, item disposition, inventory effects, and sales reporting. |
| Delivery Receipt printing | Planned / decision needed | Previously deferred. Confirm layout, numbering, required fields, and reprint behavior with the business. |
| Audit Logs | Planned | Define critical events, actor data, access, retention, and safe metadata. |
| Inventory reconciliation / controls | Needs improvement | Confirm every physical stock change has a matching movement and documented reason. |

## Supplier backend scope and verification

Implemented scope:

- Supplier fields: required name; optional contact person, phone, address, and notes; ACTIVE/INACTIVE status; timestamps.
- List suppliers, optionally filter by status, retrieve by ID, create, update, and deactivate.
- Protected routes use authentication and the corresponding `suppliers.read/create/update/delete` permissions.
- Input validation trims text and rejects blank names.
- Service-level case-insensitive duplicate-name check.
- Deactivation is soft: the supplier record is retained with INACTIVE status. Reactivation is supported through update.

Manual API verification on the separate Docker test database `bdms_restore_test` passed for: list; create; get by ID; ACTIVE filtering; case-insensitive duplicate rejection (409); blank-name validation (400); update; deactivate/reactivate; INACTIVE filtering; soft-deactivation persistence; repeated deactivation rejection (409); and unauthenticated access rejection (401). The backend `npm run build` / TypeScript compilation passed on 2026-11-09.

Not yet verified or implemented:

- Supplier frontend page, forms, navigation, and API integration.
- Automated unit/integration tests and full regression testing.
- Receiving, purchase records, inventory quantity changes, stock movements, FIFO allocation, or delivery changes. These are explicitly outside this supplier master-data feature.

Known technical limitation: the service checks names case-insensitively, while the database's ordinary unique index is case-sensitive. Concurrent requests using different letter casing could race past the application pre-check. A database-level case-insensitive unique constraint is not included and requires a separate design decision.

## Current review findings

- Verify authentication and authorization on Customer and Delivery APIs.
- The Orders backend feature exists, but the prior reviewed frontend route list had no Orders page/route.
- Review all inventory mutation paths and reconcile inventory balances with stock-movement history.
- The stock-movement service's ADJUSTMENT semantics should remain documented as setting the counted balance unless the business approves a different rule.
- Review whole-number quantity enforcement at the database layer; inspected Prisma quantity columns have used Decimal.
- Delivery completion uses a transaction and corresponding OUT movements; re-test failure and retry paths in a safe database.

## Recommended follow-up

1. Build the Suppliers frontend and connect it to the protected API.
2. Add automated tests for supplier validation, permissions, duplicate handling, updates, and deactivation.
3. Decide whether to add database-enforced case-insensitive uniqueness for supplier names.
4. Verify Customer and Delivery API security.
5. Decide the required Orders frontend workflow.
6. Reconcile inventory balances and stock-movement history; verify all stock-changing paths.
7. Run the core staff workflow: order → delivery → inventory deduction → sales/reports.
8. Plan Purchase Receiving as a separate feature with explicit stock-posting and reversal rules.

This is a suggested order, not a rigid sequence. Priorities may change with business needs.

## Verification record

For each status change, record what changed, which workflow and scenarios were tested, exact commands and outcomes, what remains untested, and the related commit or pull request. Do not mark a feature verified solely because it compiles.
