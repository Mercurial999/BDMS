# Historical Phase-Based Planning Notes

> **Historical reference only.** BDMS now uses ongoing feature-based development. Phase 1, Phase 2, and numbered phase-completion gates are retired as active planning instructions. This document consolidates useful context from the former phase roadmap, implementation plan, branching plan, and progress trackers. It is not a current roadmap or authorization to begin any listed feature.

For current direction, use [the development guide](../development-guide.md), [feature status](../feature-status.md), and [backlog](../backlog.md).

## 1. Historical product direction

BDMS was planned as an internal operations system for a bakery-ingredient distribution business. Staff enter and manage operational records. Bakery customers and suppliers are business records, not system login accounts.

The intended staff workflow includes product and customer maintenance, staff-entered orders, deliveries, inventory, stock movements, sales, and operational reporting. Customer accounts, online ordering, and mobile applications were longer-term possibilities, not prerequisites for the internal system.

The intended access model is one Admin account that manages staff accounts and permissions. Deactivated staff must not be able to log in. More complex multi-admin governance was not part of the agreed initial model.

## 2. Business and data-integrity rules retained from the plans

### Products and inventory

- Product describes the item; Inventory represents its current stock balance and minimum-stock information.
- Product creation must not invent opening stock or a purchase.
- Inventory initialization is a separate operation unless the business approves another process.
- Physical stock changes need a clear source/reason and a corresponding stock movement.
- Operational quantities are whole numbers; do not reintroduce fractional quantities without an explicit business requirement.
- Inventory balance and stock-movement history must be updated atomically.
- Do not treat an Inventory ID and Product ID as interchangeable.

### Orders, deliveries, and sales

The historical intended workflow was:

```text
Staff records customer order
  -> Order is reviewed/confirmed
  -> Delivery is prepared
  -> Delivery is completed
  -> Inventory is deducted
  -> OUT / SALE stock movement is recorded
  -> Sales and reports reflect the completed delivery
```

- Creating or confirming an order does not deduct inventory.
- Delivery completion is the documented stock-deduction point.
- The backend owns stock calculations and transaction behavior.
- Repeated delivery completion must not deduct stock twice.
- A failed transaction must not leave partial inventory, delivery, or movement updates.
- Sales are derived from completed deliveries in the current design; do not add a second manual sales-entry process without approval.
- A return must be a separate transaction; it must not erase the original delivery or its stock-out history.

These are retained business rules. Inspect the current implementation before relying on any old source-level observation.

## 3. Historical workflow proposals

The former Phase 2 plan described possible future workflows. They remain design context only; requirements must be reconfirmed before implementation.

### Suppliers

Supplier master data may include name, contact person, phone, email, address, status, and notes where justified. Supplier maintenance must not change inventory. Deactivation should preserve historical references once transaction records exist. Confirm uniqueness rules and required fields with the business.

### Purchase receiving / stock-in

A proposed receiving flow was:

```text
Create draft receipt
  -> Add and validate received items
  -> Review
  -> Post once
  -> Transactionally update inventory
  -> Create matching IN / PURCHASE movements
  -> Mark receipt posted
```

Open decisions included whether a receipt may initialize missing inventory, whether partial receiving is allowed, duplicate reference handling, multiple product lines, purchase unit cost, and whether posted receipts can be edited. The earlier plan recommended correcting posted receipts through a reversal/correction record rather than silently editing posted history.

### Stock adjustments

The proposed design called for authorized adjustments with a reason, actor, timestamp, and traceable before/after quantities. The server should lock and read the current inventory balance, calculate the change itself, prevent negative stock unless explicitly allowed, and atomically record the balance change and movement. The business must decide whether staff enter a counted final quantity or a delta, which reasons are valid, and whether approval is required.

### Customer returns

The earlier plan proposed linking returns to completed deliveries, ensuring cumulative returned quantities do not exceed delivered quantities, and recording item condition/disposition. Only accepted resalable goods should increase sellable stock. Damaged or expired goods should not automatically be restocked. Returns should create their own records and movements and must not delete or rewrite the original delivery or OUT / SALE movement. Gross, return, and net sales treatment must be defined before changing reports.

### Delivery status changes

Additional statuses should be introduced only if the real business workflow requires them. Define allowed transitions, roles, cancellation rules, partial delivery behavior, and exactly when inventory changes. A return is not merely a delivery status.

### Delivery receipt printing

The business previously raised a need for an actual printed receipt, including possible long-bond paper. The feature was deferred. Before implementation, confirm paper size, layout, margins, copies, required fields, numbering policy, when numbers are assigned, snapshot/reprint behavior, and treatment of draft/completed/cancelled deliveries. A printed delivery receipt must reflect actual delivered quantities and must not change inventory or delivery status. Do not describe it as a BIR-compliant invoice or official receipt without confirmation from the business's accountant/adviser.

### Audit logs and reports

The former plan proposed focused append-only audit events for important changes such as account/permission changes, receiving, adjustments, returns, and delivery completion. Logs should identify actor, action, target, timestamp, and safe metadata; never log passwords, tokens, or secrets.

Possible future reports included supplier receiving history, stock-in, adjustments, returns, reconciliation, and restricted audit history. Define filters, date boundaries, source-of-truth records, and permissions before implementation. Reconcile report totals to source transactions and movements.

## 4. Historical technical risks — recheck before acting

The former planning documents recorded the following source-review observations. They are not guaranteed to describe the current branch:

- A reviewed direct inventory update path could change quantity without a corresponding movement.
- A reviewed generic ADJUSTMENT path treated the movement quantity as the new counted balance rather than a delta.
- Whole-number validation was not consistent across all inspected inventory and stock-movement paths.
- Customer route protection was not visible in the route file inspected at that time.
- An Orders backend existed while the inspected frontend route list did not include an Orders page.
- Full regression, migration status, backup/restore, and release checks had not been demonstrated by those source reviews.

Always inspect the latest source, route composition, schema, and tests before changing any of these areas.

## 5. Historical verification evidence and limitations

### Source/planning review — 2026-10-27

A limited source/planning baseline review was recorded as complete for its stated scope. It did **not** prove that the backend build, full frontend lint/build, migration status, backup/restore, complete order-to-delivery regression, insufficient-stock handling, duplicate completion, or transaction rollback had passed.

### Product → Inventory → existing Stock-In manual check — 2026-10-22

The former tracker recorded this focused manual check:

- Created a test product named `Phase 2 Test Flour`.
- Confirmed it appeared in the inventory setup list.
- Initialized its Inventory record at quantity `0`.
- Added `5` units with reference `PHASE2-TEST`.
- Confirmed the inventory quantity became `5`.
- Confirmed a corresponding `IN / PURCHASE` stock movement was recorded.
- The frontend production build passed with `npm run build`.

This was a focused manual UI check, not a full system regression. Backup/restore, complete authorization/error-path testing, and the full order-to-delivery workflow were not verified by this record. Preserve those limitations whenever referring to this test.

## 6. Historical open business decisions

These questions were carried forward from the old plans. Their current state must be checked with the business before implementation:

| Area | Decision to confirm |
|---|---|
| Inventory initialization | Should every active Product automatically receive an Inventory row, or should staff initialize it explicitly? |
| Receiving | May a receiving record create a missing Inventory row? |
| Receiving | Is purchase unit cost required, and what business purpose does it serve? |
| Supplier | Is a supplier-product relationship needed, or is selecting a supplier per receipt sufficient? |
| Adjustments | Counted/target quantity or delta input? Which roles may create or approve adjustments? |
| Returns | Which item conditions may be restocked as sellable inventory? |
| Sales reports | How should returns be represented alongside gross sales and net sales? |
| Delivery statuses | Are DRAFT, COMPLETED, and CANCELLED insufficient for the actual workflow? |
| Permissions | Which roles may receive stock, adjust inventory, accept returns, and read audit history? |
| Delivery receipt | Paper layout, numbering, copies, required fields, and historical snapshot/reprint behavior? |
| Audit logs | Which events need recording, who may read them, and how long should records be retained? |

## 7. Historical branch and sequencing guidance

The old branching plan proposed keeping a stable baseline branch, a phase integration branch, and separate feature branches. Those branch names and phase-specific merge instructions are retired. Use the current feature-based workflow and inspect the repository's actual branch strategy before creating, merging, or renaming branches.

The durable lessons remain:
- Keep changes small and feature-scoped.
- Inspect branch and working-tree state before syncing or merging.
- Branch isolation does not isolate the database; use a separate test database for risky migrations and stock changes.
- Back up important data and verify a restore path before destructive or schema-changing work.
- Review migrations and generated SQL before applying them.
- Test authorization, validation, duplicate/retry behavior, rollback, and affected existing workflows.
- Do not edit generated Prisma output or compiled `server/dist/` files by hand.

## 8. Future ideas that were never commitments

Customer ordering portals, customer accounts, delivery mobile apps/tracking, multiple warehouses, accounting integrations, advanced forecasting, and automated reorder suggestions were long-term ideas only. Do not start them without a demonstrated business need and confirmed scope.
