# BDMS Backlog

This is a flexible list of proposed work, technical follow-ups, and unresolved business decisions. It is not a phase plan or mandatory sequence. Priorities may change whenever business needs change.

## Current technical follow-ups

| Priority | Item | Reason / acceptance direction |
|---|---|---|
| Critical | Backend API authentication and authorization | Add and verify authentication plus least-privilege permissions for Customer, Orders, Deliveries, Sales, Reports, and Dashboard routes. Test unauthenticated (401), authenticated-but-forbidden (403), and authorized requests for every endpoint. Do not rely on frontend route guards. |
| High | Remove or constrain direct inventory quantity updates | Ensure ordinary stock changes cannot bypass the Stock Movement ledger. Define a safe adjustment/count workflow and preserve atomic balance-to-ledger updates. |
| High | Enforce whole-number stock quantities | Align Inventory and Stock Movement API validation and database constraints with the confirmed whole-number business rule; inspect existing data and migration impact first. |
| High | Clarify ADJUSTMENT semantics | The reviewed implementation sets an absolute counted balance, not a delta. Confirm the intended user input and audit behavior before changing the API contract. |
| High | Suppliers frontend and integration | After the separate Supplier backend work is reviewed and integrated into `main`, build list/edit forms, status filtering, activate/deactivate actions, navigation, loading/error states, and permission-aware controls against the integrated API. |
| High | Supplier automated tests | Add automated coverage for validation, authorization, duplicate handling, updates, status filtering, and soft-deactivation. Manual API checks and a successful TypeScript build are not substitutes for automated tests. |
| Medium | Supplier name uniqueness | In the separately developed Supplier implementation, the service pre-check is case-insensitive but the database unique index is case-sensitive, leaving a concurrent differently-cased insert race. Reassess the implementation and decide on database-enforced case-insensitive uniqueness during integration review. |
| High | Orders frontend workflow | Decide whether staff need a dedicated Orders page; if yes, connect it to the existing Orders API without duplicating delivery logic. |
| High | Inventory/ledger reconciliation | Confirm every stock-changing path updates inventory and movement history consistently and atomically. |
| High | Core workflow regression | Test order → delivery → stock deduction → sales/reporting, including insufficient stock and repeated completion. |
| Medium | Database quantity constraints | Evaluate enforcing whole-number inventory/movement quantities at the database layer; review existing data and migrations first. |
| Medium | Operational safety | Verify migration status and backup/restore against a separate test database. |

## Candidate business features

| Feature | Direction | Decisions to confirm |
|---|---|---|
| Suppliers master data — backend | Implemented on a separate branch; not present in the reviewed `main` baseline | Review and integrate the schema, migration, API, permissions, and tests through a focused pull request. Recorded manual API verification and backend build results are branch-specific; frontend integration and automated tests remain. |
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
