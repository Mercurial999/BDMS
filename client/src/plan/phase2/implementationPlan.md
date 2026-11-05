# BDMS Phase 2 Backlog Plan

**Status:** DEFERRED — NOT ACTIVE  
**Current active development phase:** Phase 1 — IN DEVELOPMENT  
**Repository:** `Mercurial999/BDMS`  
**Backlog tracker:** [Phase 2 Progress Tracker](./progress-tracker.md)  
**Purpose:** Preserve Phase 2 analysis, proposed features, risks, and design decisions for future use. This document is not authorization to begin Phase 2 implementation.

> **Important:** Phase 1 is still being developed. Some parts of BDMS are working, but the user does not consider Phase 1 complete. Do not start Supplier, Purchase Receiving, Stock Adjustments, Returns, Delivery Receipt, Audit Log, or other Phase 2 implementation work unless the user explicitly reactivates Phase 2.

## 1. Current planning decision

The previous version of this document said that Phase 2 feature work could proceed after the source review. That instruction is superseded.

- Phase 1 remains the active development focus.
- Phase 2 features remain in this document as future backlog.
- The earlier Step 0 source review and Step 1 focused Product → Inventory → Stock-In check are historical evidence only. They do not mean Phase 1 is complete or that Phase 2 can begin.
- Do not use the existence of a feature branch named `feature/phase-2-suppliers` as proof that Supplier implementation has started or is approved.
- When Phase 2 is eventually reactivated, inspect the latest repository state again. Do not rely on old source observations as current implementation facts.

## 2. Repository review basis and limitations

The planning review compared the roadmap, order-to-completed-delivery process, frontend plan, inventory plans, Phase 2 plan/tracker, and selected source files in the repository branch reviewed on 2026-10-29.

Selected source-level observations:
- Frontend routes exist for Dashboard, Users, Roles, Products, Inventory, Customers, Deliveries, Sales, and Reports.
- The backend has an Orders feature and order API routes, but the inspected frontend route list did not contain an Orders page/route.
- Sales and Reports pages and their corresponding backend endpoints exist.
- The Prisma schema contains User/Role/Permission, Customer, Product, Inventory, StockMovement, Order, OrderItem, Delivery, and DeliveryItem models.
- The reviewed schema did not contain Supplier, Receiving, Return, or Audit Log models.
- Existing code and planning notes identify inventory mutation and validation risks that must be reviewed before adding new stock-changing workflows.

These are source-level observations from the reviewed repository snapshot, not runtime test results. Reinspect the latest code, schema, API contracts, and database before any future implementation.

## 3. Non-negotiable business and data-integrity rules

### Product is not Inventory
- Product describes what the business sells.
- Inventory stores available quantity and minimum-stock threshold.
- Product creation must not invent stock or a purchase movement.
- Do not confuse Product IDs and Inventory IDs.
- Inventory initialization must follow an explicitly approved opening-stock rule.

### Stock movement is the stock ledger
- Every physical stock change must have a corresponding movement.
- Stock quantity and movement history must be committed or rolled back together.
- The frontend must not calculate or save authoritative stock balances.
- Stock-in, delivery stock-out, adjustment, and return behavior must use explicit server-side business rules.

### Existing Order-to-Delivery workflow
The documented workflow is:

```text
Create Order (PENDING)
  -> Confirm Order (CONFIRMED)
  -> Create Delivery (DRAFT)
  -> Complete Delivery
  -> Validate and deduct inventory
  -> Create OUT / SALE stock movement
  -> Update delivery/order completion state
  -> Sales and reports reflect completed delivery
```

Preserve these rules:
- Order creation/confirmation does not deduct stock.
- Only a confirmed order can be converted into a delivery.
- An order must not create duplicate deliveries.
- Delivery completion is the stock deduction point in the documented workflow.
- Repeated completion must not deduct stock twice.
- Sales are derived from completed deliveries in the current design; do not create a duplicate sales-entry workflow without explicit approval.
- Operational quantities are positive whole numbers.
- Customers are business records, not login accounts in the current internal system.

## 4. Known risks to revisit before future stock-changing work

The earlier source review recorded these issues. Recheck them against the latest code before acting:

1. **Direct inventory quantity update:** the reviewed `PUT /api/inventory/:id` accepted a quantity update without creating a matching stock movement. Do not use this path for physical stock corrections unless it has since been redesigned and tested.
2. **Ambiguous ADJUSTMENT semantics:** the reviewed generic stock movement service set inventory quantity to the movement quantity for ADJUSTMENT rather than applying a clearly documented delta. Do not build adjustment functionality on top of this behavior without re-review.
3. **Whole-number validation:** the reviewed inventory and stock-movement validation did not consistently enforce integer quantities, even though the business rule is whole-number operational quantities.
4. **Route authorization:** the reviewed Customer routes did not show the same authentication/permission middleware pattern as the Inventory routes. Recheck route protection as part of active Phase 1 security work.
5. **Orders UI gap:** the backend Orders feature existed, but the inspected frontend route list had no Orders page. Treat the order UI as an active Phase 1 integration concern, not a finished end-to-end feature.
6. **Verification gap:** previous notes did not evidence full Phase 1 regression, backend build, migration status, or verified backup/restore. Do not claim these checks passed without fresh results.

## 5. Future Phase 2 feature backlog

All items below are **NOT STARTED / DEFERRED** unless new evidence is recorded after Phase 2 is explicitly reactivated.

### 5.1 Suppliers — master data only

**Business outcome:** Staff can maintain supplier records.

Possible fields:
- Supplier ID and name.
- Contact person.
- Phone and email.
- Address.
- ACTIVE/INACTIVE status.
- Created/updated timestamps.

Rules:
- Follow the existing feature-module architecture and validation/error patterns.
- Supplier create/update/deactivate must not change inventory.
- Prefer deactivation over deletion once transaction history exists.
- Confirm whether supplier names must be unique before adding a constraint.
- Protect endpoints with backend authentication and authorization.

Potential endpoints (proposals only):
- `GET /api/suppliers`
- `GET /api/suppliers/:id`
- `POST /api/suppliers`
- `PATCH /api/suppliers/:id`
- `PATCH /api/suppliers/:id/deactivate`

### 5.2 Purchase Receiving / Stock-In

**Business outcome:** Record where received stock came from and increase inventory exactly once.

Possible records:
- Receiving header: supplier, reference number, received date, status, notes, creator, timestamps.
- Receiving items: product, whole-number received quantity, and optional unit cost if the business requires it.

Proposed workflow:

```text
Create draft receipt
  -> Add and validate items
  -> Review
  -> Post receipt once
  -> One database transaction:
       lock receipt and inventory rows
       validate supplier/products/quantities
       update inventory
       create IN / PURCHASE movements
       mark receipt posted
  -> Commit
```

Decisions needed:
- Can receiving create a missing Inventory record?
- Can one receipt contain multiple products?
- How should duplicate product lines be handled?
- Is purchase unit cost required now?
- What reference/receipt number format is required?
- Can posted receipts be edited? Recommended: no; use a correction/reversal record.

Tests should cover valid receipts, invalid/inactive supplier/product, invalid quantities, duplicate references, repeated/concurrent posting, transaction rollback, and ledger reconciliation.

### 5.3 Stock Adjustments

**Business outcome:** Correct discrepancies with a reason and traceable history.

Decisions needed:
- Who may create/approve adjustments?
- Which reasons are allowed?
- Does staff enter a counted/target quantity or a delta?
- Is approval required?

Design guidance:
- Calculate the resulting difference on the server after locking the inventory row.
- Do not trust a client-provided previous quantity.
- Prevent negative stock.
- Commit the inventory change, stock movement, and required audit event together.
- Use an explicit adjustment operation if existing generic movement semantics remain ambiguous.

### 5.4 Customer Returns

**Business outcome:** Record returned goods without inflating sellable stock.

Rules:
- Link a return to an original completed delivery.
- Returned product must exist on that delivery.
- Cumulative returned quantity must not exceed the delivered quantity.
- Only accepted, resellable items increase available inventory.
- Damaged/expired goods are recorded but not automatically restocked as sellable.
- Restock and matching `IN / RETURN` movement must be one transaction.
- Never edit the original delivery or remove its `OUT / SALE` movement.
- Define gross/returns/net reporting before changing sales calculations.

### 5.5 Delivery Status improvements (conditional)

Only add statuses if the business workflow requires them.

Before implementation, define:
- Allowed status transitions.
- Roles allowed to perform each transition.
- Which transition, if any, changes inventory.
- Cancellation rules after dispatch or completion.
- Partial delivery behavior.

Do not conflate a customer return with a delivery status without a clear business reason. Preserve exactly-once stock deduction.

### 5.6 Audit Logs

Start with a focused append-only audit log.

Potential fields:
- Actor user ID.
- Action and entity type/ID.
- Timestamp.
- Reference/correlation ID.
- Carefully selected structured metadata.

Potential actions:
- Supplier create/update/deactivate.
- Receipt create/post/reversal.
- Stock adjustment.
- Return receive/accept/reject.
- Delivery completion/cancellation.
- User, role, and permission changes.

Never log passwords, password hashes, JWTs, authorization headers, or unnecessary personal information. Protect audit history from ordinary edit/delete operations.

### 5.7 Improved Reports and reconciliation

Extend existing report behavior rather than replacing current report APIs.

Potential reports:
- Supplier receiving history.
- Stock-in by date, supplier, product, and reference.
- Adjustments by reason, actor, and date range.
- Returns by delivery, product, reason, disposition, and period.
- Stock reconciliation/ledger view.
- Restricted audit history.
- Delivery status summaries if new statuses are approved.

Rules:
- Keep existing Phase 1 report contracts stable.
- Define how returns affect sales before adding net-sales figures.
- Validate date filters and use consistent date boundaries.
- Reconcile report totals to source transactions and stock movements.
- Enforce backend permissions for sensitive reports.

### 5.8 Delivery Receipt (DR) generation and printing

**Business outcome:** Produce a printable delivery document using actual delivery data.

Rules and decisions:
- Generate from the Delivery record and linked Order/Customer details where available.
- Show actual delivered quantities, not just requested quantities.
- Confirm paper size (including long-bond if required), margins, copies, required fields, numbering, and reprint rules with the business.
- Decide whether historical reprints use a saved snapshot.
- Preview/printing must not deduct stock, create movements, or change statuses.
- Do not represent the DR as a BIR-compliant invoice or official receipt without accountant confirmation.

### 5.9 Stronger Permissions

Use the existing role/permission foundation.
- Inspect current permission names and role assignments before adding new permissions.
- Confirm the role matrix with the business.
- Make seed changes idempotent.
- Protect every backend write route and sensitive report.
- Test 401 unauthenticated, 403 forbidden, and authorized success paths.
- Frontend button visibility is not a security boundary.

## 6. Future Phase 2 reactivation checklist

Phase 2 remains deferred until the user explicitly asks to activate it. When that happens:

1. Re-read the current roadmap and tracker.
2. Inspect the latest branch, working tree, code, API contracts, and Prisma schema.
3. Reconfirm which Phase 1 workflows are currently working and what needs regression.
4. Reconfirm business rules and unresolved decisions for the selected Phase 2 feature.
5. Verify a backup and restore to a separate test database before schema-changing or stock-mutating work.
6. Choose one feature only and define its acceptance tests.
7. Keep the existing Phase 1 workflows protected with regression tests.
8. Update this backlog and tracker with actual implementation/test evidence.

## 7. Development workflow when Phase 2 is eventually approved

Use the existing architecture:

```text
Frontend page
  -> existing API helper/service
  -> authenticated route
  -> validation
  -> controller
  -> business service
  -> repository/Prisma
```

Proceed incrementally:
1. Explain the business rule and example.
2. Inspect current code and API contracts read-only.
3. Agree on data model and edge cases.
4. Make the smallest authorized backend/schema change.
5. Add validation, service logic, transaction, and authorization.
6. Test the API.
7. Add frontend types/service/page if needed.
8. Run the complete feature workflow and Phase 1 regression.
9. Review the diff and update documentation in the same commit.

Use the existing native-fetch API helper. Do not add Axios. The frontend collects input and displays backend results; it must not own stock calculations or state-transition rules.

---

**Change policy:** This document is a future backlog. Do not convert its items to IN PROGRESS or COMPLETE until Phase 2 is explicitly reactivated and fresh evidence is recorded.
