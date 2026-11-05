# BDMS Feature Status

**Repository reviewed:** `Mercurial999/BDMS`  
**Branch reviewed:** `feature/phase-2-suppliers`  
**Branch head at review:** `61787584d63f640f2b8025a2a321d97a762c965f`  
**Review date:** 2026-11-05

> This is a snapshot of available repository evidence, not a live status dashboard. It does not include uncommitted local changes. Statuses must be refreshed after inspecting current code and testing the workflow.

## Status definitions

- **Working — needs ongoing verification:** implementation is present and has been used, but not all release checks are implied.
- **In progress:** active development is underway.
- **Needs improvement:** known gaps or refinements remain.
- **Needs verification:** historical/code evidence exists, but current end-to-end behavior needs a fresh check.
- **Planned:** not yet implemented or not yet started.
- **Decision needed:** blocked on a business decision.

## Feature overview

| Feature | Snapshot status | Notes / next verification |
|---|---|---|
| Authentication | Working — needs ongoing verification | Login and Admin access have been used. Recheck token expiry, inactive-user rejection, and protected API routes when changing auth. |
| Users / Roles / Permissions | Needs verification | User and role modules exist. Verify one-Admin rules, staff activation/deactivation, and endpoint permission coverage. |
| Products | Working — needs ongoing verification | Product screens and backend feature exist. Recheck validation and product/inventory separation. |
| Inventory | Needs improvement | Inventory module exists. Re-verify whole-number enforcement, direct quantity update behavior, and ledger consistency before stock changes. |
| Stock Movements | Needs verification | Feature exists and a historical manual stock-in check was recorded. Recheck IN/OUT/ADJUSTMENT semantics and authorization. |
| Customers | Needs verification | Feature exists. Recheck customer route authentication/permissions and status behavior. |
| Orders | Needs verification | Backend feature exists. Previously inspected frontend route list did not include an Orders screen; verify current UI integration and full workflow. |
| Deliveries | Working — needs ongoing verification | Delivery feature exists. Re-test completion transaction, insufficient stock, duplicate/retry behavior, and matching OUT movement. |
| Sales | Working — needs ongoing verification | Sales module exists and current design derives sales from completed deliveries. Reconcile totals against source deliveries. |
| Dashboard | Needs verification | Dashboard feature and frontend screen exist. Recheck data accuracy and empty/loading/error states. |
| Reports | Needs verification | Reports feature and frontend screen exist. Reconcile report totals with source data and verify permissions. |
| Suppliers | Planned | No implementation is asserted by this documentation review. Confirm requirements before starting. |
| Purchase Receiving / Stock-In enhancements | Planned | Define supplier, reference, quantity, cost, posting, and exactly-once rules before implementation. |
| Customer Returns | Planned | Define disposition and impact on sellable stock and sales reporting. |
| Stock Adjustments | Needs improvement / decision needed | Confirm counted quantity vs delta semantics, roles, and audit requirements before implementation. |
| Delivery Receipt printing | Planned / decision needed | Previously deferred. Confirm paper layout, numbering, required fields, and reprint behavior with the business. |
| Audit Logs | Planned | Define critical events, access, retention, and safe metadata. |
| Docker deployment setup | Planned | Current Compose setup exists; a separate production deployment configuration and operational procedure have not been verified in this review. |

## Cross-feature verification priorities

1. Reconcile inventory balances with stock-movement history for every stock-changing path.
2. Verify whole-number quantity validation consistently.
3. Verify backend authentication and permissions on every protected route.
4. Exercise order → delivery → inventory deduction → sales/reporting as one end-to-end workflow.
5. Verify database migration and backup/restore procedures against a separate test database.
6. Run frontend lint/build and backend build before considering a change ready to merge.

## Updating this tracker

When a feature changes, record the new status only after reviewing the relevant implementation. Include:
- What changed.
- Which workflow was tested.
- Exact commands or manual test evidence.
- What remains untested.
- Related commit or pull request, once available.

Do not use phase completion labels. A feature can be usable and still have future improvements.
