# BDMS Feature Status

**Repository reviewed:** `Mercurial999/BDMS`  
**Branch reviewed:** `feature/phase-2-suppliers`  
**Source snapshot reviewed:** `edd668f476985b23f25ff0626f49d4836c7c163c`  
**Review date:** 2026-11-07

> This is an evidence-based snapshot of committed source inspected on the date above. It is not a live dashboard and excludes uncommitted local changes. Repository presence is not proof of complete runtime verification.

## Official development status

**BDMS is in active, ongoing feature-based development.**

The project does not use Phase 1, Phase 2, or numbered phase-completion gates. Work is selected by business priority, defects, feature gaps, operational risk, and verification needs. Existing features may be revisited at any time. Historical phase plans are archived and are not active instructions.

## Status definitions

- **Working — needs ongoing verification:** implementation is present and has been used, but complete release testing is not implied.
- **In progress:** active implementation or integration work is underway.
- **Needs improvement:** the feature exists but has known gaps or planned refinements.
- **Needs verification:** source or historical evidence exists, but current end-to-end behavior has not been freshly confirmed.
- **Planned:** not yet implemented or not yet started.
- **Blocked / decision needed:** work depends on a business or technical decision.

## Feature overview

| Feature / area | Current status | Evidence and next action |
|---|---|---|
| Authentication | Working — needs ongoing verification | Login/JWT and active-account checks exist. Recheck token/session behavior and API protection when changing access control. |
| Users / Roles / Permissions | Needs verification | Backend and frontend modules exist. Verify the one-Admin/staff rules and endpoint-by-endpoint permission coverage. |
| Products | Working — needs ongoing verification | Product UI and backend feature exist. Preserve separation between product details and stock quantity. |
| Inventory | Needs improvement | Inventory module exists. API/service checks enforce whole-number quantities in inspected paths, but Prisma quantity columns are Decimal; review database-level enforcement and all stock-changing paths. |
| Stock Movements | Needs verification | Movement feature exists. Verify IN/OUT/ADJUSTMENT behavior, authorization, and balance-to-ledger reconciliation. |
| Customers | Needs improvement | Customer UI/API exist. Customer route protection was not visible in the reviewed route file; verify and enforce backend authentication/permissions. |
| Orders | Needs improvement | Backend Orders API exists, but the reviewed frontend route list has no Orders page/route. Decide and implement the required staff workflow if still needed. |
| Deliveries | Needs improvement | UI/API and transactional completion logic exist. Delivery route protection was not visible in the reviewed route file; verify it. Re-test insufficient stock, duplicate completion, and rollback. |
| Sales | Working — needs ongoing verification | Sales derives from completed deliveries in the current design. Reconcile totals against delivery records. |
| Dashboard | Needs verification | UI/API exist. Reconcile displayed metrics and test loading, empty, and error states. |
| Reports | Needs verification | UI/API exist. Reconcile outputs against source records and verify report permissions/exports. |
| Suppliers | Planned | No Supplier model or feature implementation was found in the reviewed branch snapshot. Confirm fields, deactivation behavior, and permissions before implementation. |
| Purchase Receiving / Stock-In | Planned | Define supplier/reference/cost requirements and safe exactly-once stock posting before implementation. |
| Customer Returns | Planned | Define return eligibility, item disposition, inventory effects, and sales reporting. |
| Delivery Receipt printing | Planned / decision needed | Previously deferred. Confirm layout, numbering, required fields, and reprint behavior with the business. |
| Audit Logs | Planned | Define critical events, actor data, access, retention, and safe metadata. |
| Inventory reconciliation / controls | Needs improvement | Confirm every physical stock change has a matching movement and documented reason. |

## Current review findings

- Customer and Delivery route files inspected during the source review did not show the authentication/authorization middleware pattern used by several other protected features. Verify complete route composition and close any missing protection before treating these APIs as secure.
- The Orders backend feature exists, but no Orders frontend route/page was present in the inspected route list.
- The inventory update service accepts minimum-stock changes rather than direct quantity edits.
- The stock-movement service treats an ADJUSTMENT quantity as the new counted stock balance. Preserve this meaning unless the business explicitly approves a different rule.
- API/service checks enforce integer quantities in the inspected paths, while Prisma stores Inventory and StockMovement quantities as Decimal. Consider database-level enforcement as a separate, carefully planned change.
- Delivery completion uses a transaction, locks inventory, and creates corresponding OUT movements. Re-test failure and retry paths in a safe database.
- The inspected package scripts expose build/lint commands but no configured test script was found. Builds, lint, database checks, and end-to-end tests were not run as part of this GitHub source review.

## Recommended work queue

1. Verify authentication and authorization on Customer and Delivery APIs.
2. Decide the required Orders frontend workflow and integrate it if still needed by staff.
3. Reconcile inventory balances and stock-movement history; verify all stock-changing paths.
4. Run the critical staff workflow: order → delivery → inventory deduction → sales/reports.
5. Confirm migration safety and backup/restore using a separate test database.
6. Implement Suppliers when requirements and acceptance criteria are confirmed.
7. Consider receiving, returns, receipt printing, audit logs, and reporting enhancements as separate feature requests.

This is a suggested order based on reviewed risks, not a rigid sequence. The user may reprioritize work at any time.

## Verification record

For each status change, record what changed, which workflow and scenarios were tested, exact commands and outcomes, what remains untested, and the related commit or pull request. Do not mark a feature verified solely because it compiles. Do not claim a full regression or release check unless it was actually performed.
