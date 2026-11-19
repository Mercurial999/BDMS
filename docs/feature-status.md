# BDMS Feature Status

**Repository:** `Mercurial999/BDMS`
**Source baseline:** `main` at commit `f239ed9`
**Status updated:** 2026-11-19

> This is an evidence-based snapshot of the reviewed `main` baseline, not a live dashboard. It does not include unmerged work from feature branches or local working trees. Verification statements distinguish source inspection, manual checks, builds, automated tests, and end-to-end testing.

## Official development status

BDMS uses ongoing feature-based development. Work is selected by business priority, defects, feature gaps, operational risk, and verification needs. Historical phase plans are archived and are not active instructions.

## Status definitions

- **Working â€” needs ongoing verification:** implementation is present and the described checks have passed, but complete release testing is not implied.
- **In progress:** active implementation or integration work is underway.
- **Needs improvement:** the feature exists but has known gaps or planned refinements.
- **Needs verification:** implementation or historical evidence exists, but current behavior has not been freshly verified.
- **Not in main baseline:** implementation may exist on a separate branch but is not part of the reviewed main commit; review and integrate it before describing it as available on main.
- **Planned:** not yet implemented or not yet started.
- **Blocked / decision needed:** work depends on a business or technical decision.

## Feature overview

| Feature / area | Current status | Evidence and next action |
|---|---|---|
| Authentication | Needs improvement | Login/JWT and active-account checks exist, but the reviewed API route coverage is incomplete: Customers, Orders, Deliveries, Sales, Reports, and Dashboard do not apply backend authentication middleware. |
| Users / Roles / Permissions | Needs verification | Backend and frontend modules exist. Verify the one-Admin/staff rules and endpoint-by-endpoint permission coverage. |
| Products | Working â€” needs ongoing verification | Product UI and backend feature exist. Preserve separation between product details and stock quantity. |
| Inventory | Needs improvement | `PUT /api/inventory/:id` can change quantity without a matching movement. Inventory and movement quantities use Decimal columns and the reviewed Zod schemas accept fractional values. |
| Stock Movements | Needs improvement | Movement creation updates balance and ledger transactionally, but fractional quantities pass validation and `ADJUSTMENT` sets an absolute balance rather than applying a delta. |
| Customers | Needs improvement | Customer UI/API exist. In this main baseline, the Customer route group does not apply backend authentication or permission middleware. |
| Orders | Needs improvement | Backend Orders API exists, but no Orders frontend page/route was found in the reviewed frontend route tree. The Orders route group also lacks backend authentication and permission middleware. |
| Deliveries | Needs improvement | UI/API and transactional completion logic exist. The Delivery route group lacks backend authentication and permission middleware; re-test insufficient stock, duplicate completion, and rollback. |
| Sales | Needs improvement | Sales are derived from completed deliveries, but the Sales route group lacks backend authentication and permission middleware. Reconcile totals against delivery records. |
| Dashboard | Needs improvement | The Dashboard route group lacks backend authentication and permission middleware. Reconcile metrics and test loading, empty, and error states. |
| Reports | Needs improvement | The Reports route group lacks backend authentication and permission middleware. Reconcile outputs against source records and verify filters/exports. |
| Suppliers | Not in main baseline | The reviewed Prisma schema and route composition do not include the Supplier feature. Separate supplier-branch implementation and manual test evidence must not be represented as merged or verified on main. |
| Purchase Receiving / Stock-In | Planned | Define supplier/reference/cost requirements and safe exactly-once stock posting before implementation. Supplier master data does not implement receiving or inventory posting. |
| Customer Returns | Planned | Define return eligibility, item disposition, inventory effects, and sales reporting. |
| Delivery Receipt printing | Planned / decision needed | Previously deferred. Confirm layout, numbering, required fields, and reprint behavior with the business. |
| Audit Logs | Planned | Define critical events, actor data, access, retention, and safe metadata. |
| Inventory reconciliation / controls | Needs improvement | Confirm every physical stock change has a matching movement and documented reason. |

## Supplier work outside the main baseline

Supplier master-data implementation and manual API verification were recorded on a separate development branch. That work included a Supplier model/migration, validation, CRUD/status endpoints, and soft-deactivation. Manual checks used the separate `bdms_restore_test` database; the backend build was also reported as passing at that time.

**This work is not present in the reviewed `main` baseline.** Do not describe Suppliers as implemented on main until the relevant branch changes are reviewed, integrated through a pull request, and verified against the resulting main commit. The supplier frontend and automated tests were still outstanding in the recorded implementation notes. Purchase receiving and inventory posting are separate features.

The recorded supplier-name pre-check was case-insensitive, while the database unique index was case-sensitive; concurrent differently-cased inserts therefore remained a known race risk. See the [development log](development-log.md).

## Current main-baseline findings

- The Customer, Orders, Deliveries, Sales, Reports, and Dashboard route groups do not apply backend `authenticate` or `authorize` middleware in the reviewed baseline. Frontend route guards and a client-sent bearer token do not secure these API endpoints.
- The Orders backend exists, but no Orders frontend page/route was found in the reviewed frontend route tree.
- `PUT /api/inventory/:id` can change an inventory quantity without creating a corresponding Stock Movement.
- Inventory and Stock Movement quantities are Decimal in Prisma, and the reviewed Zod schemas do not enforce integers.
- The Stock Movement `ADJUSTMENT` implementation treats the submitted quantity as the replacement balance, not a signed delta.
- Delivery completion deducts stock, creates `OUT / SALE` movements, and updates Delivery/Order status in one transaction. Failure, retry, and concurrency behavior still need regression testing.
- The Delivery UI currently supports one product line when creating a delivery, although the backend supports multiple delivery items.

## Follow-up work

The detailed, prioritized list of technical follow-ups and candidate features is maintained in [the backlog](backlog.md). Keep this status document focused on the current implementation and verification state; do not duplicate the backlog here.

## Scope and verification record

The source baseline for this snapshot is `main` commit `f239ed9` (2026-11-17). The findings above come from source inspection and previously recorded, separately scoped manual test evidence; they are not a claim that the entire application was executed or regression-tested on this commit. Local frontend/backend builds, automated tests, full API security tests, and end-to-end regression were not run as part of this documentation audit.

For each future status change, record what changed, the exact branch/commit, workflow and scenarios tested, commands and outcomes, what remains untested, and the related pull request. Do not mark a feature verified solely because it compiles.
