# BDMS Backlog

This is a flexible list of proposed work, technical follow-ups, and unresolved business decisions. It is not a phase plan or mandatory sequence. Priorities may change whenever business needs change.

## Current technical follow-ups

| Priority | Item | Reason / acceptance direction |
|---|---|---|
| High | Suppliers frontend | Build supplier list/detail or edit experience, create/update forms, status filtering, activate/deactivate actions, navigation, loading/error states, and permission-aware controls. Connect to the existing protected Suppliers API. |
| High | Supplier automated tests | Add automated coverage for validation, authorization, duplicate handling, updates, status filtering, and soft-deactivation. Manual API checks and a successful TypeScript build are not substitutes for automated tests. |
| Medium | Supplier name uniqueness | Decide whether to add database-enforced case-insensitive uniqueness. Current service pre-check is case-insensitive, but the database unique index is case-sensitive and does not prevent a concurrent differently-cased insert race. |
| High | Review Customer API security | Confirm authentication and intended permissions on every customer endpoint; test unauthenticated, forbidden, and authorized requests. |
| High | Review Delivery API security | Confirm authentication and intended permissions on every delivery endpoint; test access and stock-changing actions. |
| High | Orders frontend workflow | Decide whether staff need a dedicated Orders page; if yes, connect it to the existing Orders API without duplicating delivery logic. |
| High | Inventory/ledger reconciliation | Confirm every stock-changing path updates inventory and movement history consistently and atomically. |
| High | Core workflow regression | Test order → delivery → stock deduction → sales/reporting, including insufficient stock and repeated completion. |
| Medium | Database quantity constraints | Evaluate enforcing whole-number inventory/movement quantities at the database layer; review existing data and migrations first. |
| Medium | Operational safety | Verify migration status and backup/restore against a separate test database. |

## Candidate business features

| Feature | Direction | Decisions to confirm |
|---|---|---|
| Suppliers master data — backend | Implemented; manual API verification and backend build passed on 2026-11-09 | Frontend integration and automated tests remain. Decide on database-level case-insensitive uniqueness separately. |
| Purchase Receiving / Stock-In | Planned | Supplier requirement, source reference, partial receiving, unit cost, posting/cancellation rules, and exactly-once behavior. This is separate from supplier master data. |
| Stock Adjustments | Needs improvement | Counted balance vs. delta, reasons, permissions, negative-stock policy, and audit requirements. |
| Customer Returns | Planned | Return eligibility, item condition/disposition, restocking rules, and sales-report treatment. |
| Delivery Receipt printing | Planned / decision needed | Paper size/layout, numbering, required fields, copies, and historical reprint behavior. |
| Audit Logs | Planned | Critical events, actor/action details, access restrictions, and retention. |
| Reports and dashboard improvements | As needs arise | Source-of-truth definitions, date filters, reconciliation, and role-based access. |

## Longer-term ideas — not commitments

- Customer ordering portal or customer accounts.
- Delivery staff mobile workflow or tracking.
- Multiple warehouses or branches.
- Accounting integrations and regulatory reports based on requirements confirmed with the business/accountant.
- Advanced purchasing, demand forecasting, or automated reorder suggestions.

Do not implement these ideas without a demonstrated business need and confirmed scope.

## Backlog maintenance

When work is approved, create a focused feature task/branch, update `feature-status.md`, and record implementation and verification in `development-log.md`. Move or remove backlog entries when priorities change. Avoid copying the same task into multiple trackers.
