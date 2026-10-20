# BDMS Phase 2 Implementation Plan

**Status:** Planning only — no application code or database changes authorized yet  
**Baseline reviewed:** GitHub `main` branch as of 2026-10-20  
**Scope:** Phase 2 operations upgrade for the existing Bakery Distribution Management System (BDMS)  
**Primary rule:** Preserve Phase 1 workflows and existing business data. Implement one small, testable feature at a time.

> Repository inspection note: the GitHub `main` branch currently contains planning documents under `client/src/plan/`, but it does not contain a `phase2/` folder or Phase 2-specific files. This document is therefore based on the available roadmap and current tracked source files. If the local `phase2` folder contains additional requirements, compare those files with this plan before implementation.

---

## 1. Executive recommendation

Do **not** implement all Phase 2 features in one large change. The safest order is:

1. **Phase 1 safety baseline and regression tests**
2. **Supplier records**
3. **Purchase receiving / stock-in**
4. **Controlled stock adjustments**
5. **Returns**
6. **Audit logs**
7. **Reports for the new operations**
8. **Delivery workflow/status improvements, only after confirming the real business process**
9. **Role/permission hardening, coordinated with route security**

This order builds on the existing products, inventory, stock movements, customers, orders, deliveries, reports, and role/permission modules. Supplier receiving and stock adjustments depend on reliable inventory transactions, so they must not be implemented as simple direct quantity edits.

### Non-negotiable safety rules

- Do not replace or rewrite the existing backend architecture.
- Do not reset, drop, truncate, or reseed the existing database to deploy Phase 2.
- Do not edit an already-applied Prisma migration. Add a new migration for any schema change.
- Do not change the current delivery-completion inventory deduction flow while adding stock-in.
- Never update inventory quantity in one database operation and write its stock movement separately. Both must commit or roll back together.
- Do not make the frontend responsible for inventory, totals, permissions, or state-transition business rules.
- Keep the current API contracts working unless a deliberate, versioned-compatible change is approved.
- Build, test, and review each feature before starting the next one.

---

## 2. Current Phase 1 baseline found in the repository

### Stack and architecture

- Backend: Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL.
- Backend organization: feature modules with routes, controllers, services, and repositories.
- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS v4, shadcn/Base UI conventions, and a centralized native-fetch API helper.
- Existing errors include validation, conflict, not-found, and application errors.
- Database changes are tracked in Prisma migrations.

### Existing domain models

The current Prisma schema contains:

- Users, roles, permissions, and role-permission assignments.
- Customers (the bakery-store/business records; they are not system login accounts).
- Products and one inventory record per product.
- Stock movements with types `IN`, `OUT`, `ADJUSTMENT`.
- Stock movement reasons `PURCHASE`, `SALE`, `DAMAGE`, `RETURN`, `MANUAL_ADJUSTMENT`.
- Orders and order items.
- Deliveries and delivery items.

There are **no Supplier, Purchase Receipt/Receiving, Return, or Audit Log models** in the reviewed schema.

### Existing order-to-delivery workflow

The reviewed implementation follows this broad flow:

```text
Staff -> Customer -> Order (PENDING)
      -> Confirm order (CONFIRMED)
      -> Create delivery (DRAFT)
      -> Complete delivery
      -> Deduct inventory and write OUT / SALE stock movement
      -> Mark delivery COMPLETED
      -> Mark related order COMPLETED
      -> Sales and reports read completed-delivery data
```

Important existing invariants to preserve:

- Orders and delivery items use positive whole-number quantities.
- A confirmed order is required before creating its delivery.
- One order can be linked to at most one delivery.
- Inventory is deducted when a delivery is completed, not when an order is merely created or confirmed.
- Delivery completion runs in a database transaction and locks the delivery and inventory rows before stock deduction.
- Sales reports derive sales from completed deliveries; there is no separate Sale model in the schema.
- Bakery customers remain customer records. Do not introduce customer login or online ordering as part of Phase 2.

### Existing API areas

The current app registers routes for authentication/users/roles/permissions/sales/reports, products, inventory, stock movements, customers, orders, deliveries, and dashboard.

Current report endpoints cover sales summary/details/products/customers, inventory, stock movements, and deliveries. These should be extended for Phase 2 reporting rather than replaced.

---

## 3. Findings and risks to resolve before expanding inventory features

These are observations from reading the current tracked code, not changes made to it.

### Risk A — Inventory has more than one mutation path

The stock-movement service updates inventory and creates a movement in one transaction, but the inventory service also exposes a direct quantity update path. That can change stock without a matching ledger entry if used for quantity changes.

**Plan:** Before implementing receiving or adjustments, establish one approved stock-mutation path. Keep minimum-stock maintenance separate from physical quantity changes. Receiving, adjustments, returns, and delivery completion must all produce consistent ledger entries. Do not simply route every operation through the current generic stock-movement endpoint until its semantics and authorization have been reviewed.

### Risk B — `ADJUSTMENT` semantics need clarification

The current stock-movement service treats an `ADJUSTMENT` quantity as the new absolute inventory quantity, while movement quantity is otherwise naturally interpreted as a movement amount. The schema and validation also permit several type/reason combinations without a clearly enforced business matrix.

**Plan:** Define and document the meaning of adjustment before building the UI. Prefer recording the counted quantity, previous quantity, signed difference, reason, and resulting quantity explicitly (or an equivalent auditable design). Do not silently change the meaning of the existing endpoint; preserve it for existing clients and introduce a deliberate compatible service/API design if required.

### Risk C — Quantity representation is inconsistent at the schema level

Order and delivery item quantities are integers, matching the business rule that products are sold in whole units. Inventory and stock-movement quantities are PostgreSQL decimal fields in the current Prisma schema.

**Plan:** Do not perform a broad decimal-to-integer migration as a prerequisite for Phase 2. First inspect existing stored values and production requirements. Keep new operational validations to positive integers where appropriate. If a type migration is eventually required, make it a separate, explicitly reviewed migration with a preflight query, backup, handling for fractional existing values, rollback strategy, and tests.

### Risk D — Route authentication and permission coverage is inconsistent

The stock-movement routes explicitly use authentication and permission middleware. The reviewed order and delivery route files do not show the same middleware on their handlers, and the report routes also do not show it in their route file.

**Plan:** Before adding more write endpoints, inventory every route and decide the required permission for each read/write action. Confirm whether authentication is applied globally elsewhere before concluding a route is publicly reachable. Add/adjust guards in a dedicated security step and test both authorized and unauthorized requests. Do not rely on hiding buttons in the frontend.

### Risk E — Existing user lifecycle and permissions require care

The schema has ACTIVE/INACTIVE user status and login rejects inactive users. The user service also has a hard-delete operation. The role/permission framework already exists.

**Plan:** Prefer deactivation for normal staff offboarding and retain historical references. Do not introduce multi-admin rules or broad user-management changes unless explicitly approved. Audit logging and permission hardening should capture who performed a privileged action.

### Risk F — Existing delivery status is deliberately small

The current delivery enum is `DRAFT`, `COMPLETED`, and `CANCELLED`. Completion is a stock-affecting transition. Adding logistics states carelessly could accidentally deduct inventory too early or permit duplicate completion.

**Plan:** Do not expand the enum until the actual operational states and their stock effects are agreed. Model non-stock-affecting preparation/dispatch states separately from the single transition that commits inventory deduction. Define allowed transitions and cancellation/return behavior before writing code.

### Risk G — Receiving, returns, and audit data must not be editable history

A purchase receipt or customer return changes stock and must remain traceable. Updating or deleting a posted record could make the current quantity disagree with the ledger.

**Plan:** Use a controlled draft-to-posted/received transition. Posted transactions should be immutable for ordinary users; corrections should be represented by a reversal/correction transaction and a reason, not by deleting history.

---

## 4. Phase 2 scope and implementation sequence

## Step 0 — Establish a safe Phase 1 baseline

**Purpose:** Prove that Phase 1 works before introducing new schema or stock behavior.

Tasks:

- Create a feature branch specifically for Phase 2.
- Record the current commit and confirm the working tree is clean.
- Back up the database and verify that the backup can be restored to a separate test database.
- Verify Prisma migration status; do not reset the database.
- Run backend `npm run build`.
- Run frontend `npm run lint` and `npm run build`.
- Capture known-good API responses for login, products, inventory, stock movements, customers, orders, deliveries, dashboard, and reports.
- Record inventory quantity and stock movement history for a small set of test products.
- Run regression tests for creating an order, confirming it, creating a draft delivery, completing it, and checking the exact inventory/movement/order/delivery changes.

**Acceptance criteria:** The baseline build passes; the existing workflow can be repeated in a test database; a failed completion due to insufficient stock changes neither inventory nor delivery/order status; completing a delivery twice does not deduct stock twice.

**Do not proceed** until this baseline is repeatable.

## Step 1 — Suppliers (read/write master data only)

**Business outcome:** Staff can record who supplies ingredients before receiving inventory from them.

Proposed model fields (confirm with the business before implementation):

- ID
- Supplier name
- Contact person (optional)
- Phone/email (optional)
- Address (optional)
- Status: ACTIVE/INACTIVE
- Created/updated timestamps

Design notes:

- Add a dedicated Supplier model and feature module using the existing feature-based pattern.
- Add uniqueness rules only after deciding whether supplier names must be unique; consider normalized comparisons to prevent accidental duplicates.
- Do not add stock quantities to the Supplier or Product model.
- Do not create inventory changes from supplier CRUD.
- Prefer deactivation rather than deletion when a supplier has receiving history.
- Require authentication and the agreed supplier permissions on all endpoints.

Likely API surface (names are proposals, not existing endpoints):

- `GET /api/suppliers`
- `GET /api/suppliers/:id`
- `POST /api/suppliers`
- `PATCH /api/suppliers/:id`
- `PATCH /api/suppliers/:id/deactivate` (or a status update following the existing project convention)

Tests: duplicate/invalid data, inactive supplier selection, missing supplier, unauthorized requests, and preserving historical supplier references.

**Acceptance criteria:** Supplier records can be maintained without affecting inventory, deliveries, orders, or reports.

## Step 2 — Purchase receiving / stock-in

**Business outcome:** Record what arrived from a supplier and increase stock exactly once.

Proposed entities:

- Purchase receipt/header: supplier, receipt/reference number, received date, status, notes, creator, timestamps.
- Receipt items: product, integer received quantity, and optional unit cost if the business needs purchasing cost reporting.
- A stable unique reference/number to prevent accidental duplicate posting.

Proposed lifecycle:

```text
Create draft receipt -> Add/validate items -> Review
  -> Post/Receive once
  -> One database transaction:
       lock receipt and affected inventory rows
       validate supplier/products/quantities
       create missing inventory records only under an explicit rule
       increase inventory
       create IN / PURCHASE stock movements linked to receipt
       mark receipt received
  -> Commit all changes together
```

Critical design choices to decide first:

- Can receiving create the first inventory record for a product, or must inventory already exist?
- Can one receipt contain multiple products? Recommended: yes.
- Can the same product appear more than once in one receipt? Recommended: combine/validate unique product items.
- Is unit cost needed now? If yes, decide whether it is an actual receipt cost, not a replacement for the product selling price.
- Can a received receipt be edited? Recommended: no; use a reversal/correction.
- What is the approved reference format?

Implementation rules:

- Never increment stock directly from the frontend.
- The backend must enforce positive whole-number quantities.
- Use row locks and a transaction consistent with delivery completion.
- Posting must be idempotent: two concurrent/repeated requests must not post the same receipt twice.
- Do not use the current generic stock-movement endpoint as a shortcut without validating its semantics, permission guard, and duplicate-posting behavior.

Tests: valid receipt, multiple items, missing/inactive supplier, inactive product, zero/negative/decimal quantity, insufficient/invalid inventory conditions, duplicate reference, repeated post, concurrent post, transaction rollback, and ledger reconciliation.

**Acceptance criteria:** A successful receipt increases each product's stock exactly once and creates matching `IN / PURCHASE` movements. A failed or repeated post never creates partial or duplicate stock changes.

## Step 3 — Stock adjustments

**Business outcome:** Authorized staff can correct a real discrepancy with a documented reason.

Before coding, define:

- Who may create an adjustment and who may approve it.
- Whether one-person approval is sufficient for this business.
- Which reasons are allowed (e.g. damage, expiry, count correction, missing stock).
- Whether a negative adjustment may take stock below zero (recommended: never).
- Whether the UI records counted quantity or adjustment delta.

Recommended first implementation:

- A dedicated adjustment workflow or a clearly typed operation with strict backend validation.
- Record product/inventory, previous quantity, counted/target quantity, computed difference, reason, notes, actor, timestamp, and reference.
- Lock inventory and calculate the difference on the server; never trust a client-provided previous quantity.
- Store the resulting inventory change and movement/audit record in one transaction.
- Require a reason and enforce permission on the server.
- Avoid changing the semantics of the existing `POST /api/stock-movements` endpoint without a compatibility plan.

Tests: positive and negative adjustments, zero difference, stock below zero, stale counts/concurrent changes, missing reason, inactive product, unauthorized user, and transaction rollback.

**Acceptance criteria:** Every quantity correction can be explained from its history, and inventory plus movement records remain consistent.

## Step 4 — Customer returns

**Business outcome:** Record goods returned by a bakery customer without accidentally restocking damaged or unsellable items.

Recommended model concepts:

- Return header linked to the original completed delivery and customer.
- Return items linked to original delivered product/item, quantity returned, reason, condition/disposition, and notes.
- Status such as DRAFT and RECEIVED/ACCEPTED, with exact states agreed before coding.
- Creator and timestamps.

Rules to settle:

- Return quantity must be positive and cannot exceed the unreturned quantity from the original delivery.
- A return must reference a real completed delivery and a product that was included in it.
- Prevent duplicate/concurrent returns from exceeding the delivered quantity.
- Only accepted, resellable items increase available stock.
- Damaged/expired items should be recorded but not automatically returned to sellable inventory unless the business explicitly requires a separate quarantine/damaged-stock location.
- Restock and create `IN / RETURN` movement in one transaction; record non-restocked items with an auditable reason.
- Do not edit the original delivery or delete its original `OUT / SALE` movement.
- Define how the return affects sales reports. Do not silently rewrite the original sale; report gross deliveries and accepted returns separately unless accounting requirements specify another treatment.

Tests: valid partial return, full return, over-return, wrong delivery/product, non-completed delivery, damaged disposition, repeated submission, concurrent returns, and rollback.

**Acceptance criteria:** Returned quantities never exceed delivered quantities, stock increases only for approved resellable goods, and the original delivery remains unchanged.

## Step 5 — Audit logs

**Business outcome:** Management can determine who performed sensitive operations and when.

Start with a focused append-only audit log, not a generic event platform.

Potential fields:

- ID, actor user ID (nullable only if a documented system action requires it), action name, entity type, entity ID, timestamp.
- Carefully selected before/after summaries or structured metadata.
- Request/correlation ID where available.

Initially log security- and stock-critical events:

- Login failures/successes only if implemented without storing secrets.
- Supplier create/update/deactivate.
- Receipt created/posted/reversed.
- Stock adjustment created/approved.
- Return accepted/rejected/received.
- Delivery completed/cancelled.
- User/role/permission changes.

Security rules:

- Never log passwords, password hashes, JWTs, authorization headers, or unnecessary personal data.
- Audit records must not be editable/deletable through normal application endpoints.
- Write the audit event in the same transaction as the stock/business mutation when it is necessary to prove that the action committed.
- Define retention and who can read logs.

**Acceptance criteria:** Every critical stock change and privileged state transition can be traced to an actor and business reference.

## Step 6 — Improved reports

Extend the current reports module and report UI; do not replace current report endpoints.

Recommended reports:

1. Supplier receiving history and received quantities.
2. Stock-in by date, supplier, product, and reference.
3. Stock adjustments by reason, actor, and period.
4. Customer returns by delivery, product, reason, disposition, and period.
5. Audit history for authorized management users.
6. Stock ledger/reconciliation view that compares opening balance + IN - OUT +/- adjustments with current stock, using clearly defined adjustment semantics.
7. Delivery status summary only after the delivery workflow is approved.

Rules:

- Keep existing sales, inventory, stock movement, and delivery report response contracts stable.
- Use the database as the source of truth; do not fabricate totals in the UI.
- Apply date validation and consistent inclusive date boundaries.
- Use pagination/filters if data volume requires it.
- Restrict sensitive reports by permission.
- Define whether returns affect net sales before adding net-sales figures.

**Acceptance criteria:** Each report can be reconciled to source records and filters behave consistently.

## Step 7 — Delivery status improvement (conditional)

This is not automatically required just because it appears on the roadmap. First confirm the actual statuses staff use.

If needed, define a transition table before changing the Prisma enum. Example states to discuss: DRAFT, PREPARING, OUT_FOR_DELIVERY, COMPLETED, CANCELLED. The exact list must match the real workflow.

For every transition, specify:

- Who can perform it.
- Previous states allowed.
- Next state.
- Whether inventory changes.
- Whether cancellation is allowed.
- What happens if a delivery is partially delivered or returned.

Preserve the rule that stock deduction occurs exactly once at the agreed fulfillment point. A logistics status must not cause duplicate deductions. Use a transaction and concurrency protection around the stock-affecting transition.

Changing a PostgreSQL enum requires a new migration and tests against a copy of the existing database. Do not rename or remove existing statuses casually.

**Acceptance criteria:** Invalid transitions are rejected; status-only transitions do not mutate stock; the stock-affecting transition is idempotent and transactional.

## Step 8 — Stronger role-based permissions

The project already has Role, Permission, and RolePermission tables and an authorization middleware. Extend that foundation rather than creating a parallel permissions system.

Proposed permission names (final names should follow the existing naming convention):

- `suppliers.read`, `suppliers.create`, `suppliers.update`
- `purchases.read`, `purchases.create`, `purchases.receive`
- `inventory.adjust`
- `returns.read`, `returns.create`, `returns.receive`
- `audit.read`
- Existing product, inventory, customer, order, delivery, and report permissions as appropriate.

Implementation rules:

- Inspect current seeded permissions and role assignments before adding new permission records.
- Seed new permission definitions idempotently; do not duplicate them on repeated seed runs.
- Decide which existing roles receive each permission with the business owner.
- Protect every backend route; frontend visibility is not authorization.
- Test 401 unauthenticated, 403 authenticated-but-forbidden, and success for allowed roles.
- Review the user-management routes and prefer deactivation over deletion for routine offboarding.
- Avoid multi-admin safeguards and other extra complexity unless explicitly requested.

**Acceptance criteria:** New features and existing sensitive endpoints enforce server-side authorization consistently, with documented role matrices.

---

## 5. Prisma/database migration strategy

Any new persistent feature should use additive migrations first.

1. Take a verified backup and use a separate development/test database.
2. Review the proposed schema diff before generating a migration.
3. Generate a new migration; never edit a migration that has already run in a shared environment.
4. Review generated SQL, especially foreign keys, unique constraints, indexes, enum changes, and defaults.
5. Apply the migration to a copy of the current Phase 1 database.
6. Verify existing rows and relationships are preserved.
7. Test rollback/recovery procedures. Prisma migrations are not automatically reversible; document the recovery path for each migration.
8. Deploy application code and migration in a planned order so old code does not break while new tables/enums are introduced.
9. Keep a migration log and mark the exact commit deployed.

Prefer nullable/new tables and additive columns when they allow compatibility. Avoid destructive column/table renames in the same release as new business logic.

### Proposed future schema concepts (not finalized)

- `Supplier` and optional supplier/product association if the business needs to record which suppliers sell which products.
- `PurchaseReceipt` and `PurchaseReceiptItem`.
- `StockAdjustment` only if a separate adjustment document provides more clarity than a constrained stock movement.
- `CustomerReturn` and `CustomerReturnItem`.
- `AuditLog`.

Do not add every proposed model at once. Finalize each model when its implementation step begins and after confirming actual business rules.

---

## 6. API compatibility and frontend integration

For each feature, follow the existing project pattern:

```text
route -> authentication/authorization -> validation
      -> controller -> service -> repository -> Prisma
```

- Keep controllers thin and business rules in services.
- Keep database queries in repositories where consistent with the existing modules.
- Validate request bodies and query parameters with the project's existing Zod-based approach.
- Use the existing error response convention.
- Use the central frontend API helper and existing auth token handling.
- Add types in the existing frontend types folder and requests in the services folder.
- Add loading, error, empty, success, and confirmation states.
- Do not add Axios or bypass the API helper.
- Never make a frontend sequence of separate requests substitute for a backend transaction.

Suggested feature order for each module:

1. Business rules and examples.
2. Prisma model and migration (only if required).
3. Repository.
4. Service and validation.
5. Controller and authenticated/authorized routes.
6. Backend build and API/Postman tests.
7. Frontend types and service.
8. Frontend page/forms.
9. Full workflow regression test.
10. Commit and document.

---

## 7. Regression and verification checklist

Run this checklist after every feature and before merging:

### Build checks

- [ ] Backend `npm run build` succeeds.
- [ ] Frontend `npm run lint` succeeds.
- [ ] Frontend `npm run build` succeeds.
- [ ] Prisma client is generated using the repository's documented command.
- [ ] Migration status is clean and expected.

### Phase 1 regression

- [ ] Login works; inactive users cannot log in.
- [ ] Products and customer CRUD still work.
- [ ] Inventory and stock movement history remain readable.
- [ ] Orders can be created and confirmed using positive integer quantities.
- [ ] Only a confirmed order can become a delivery.
- [ ] A single order cannot create duplicate deliveries.
- [ ] Completing a delivery deducts inventory exactly once.
- [ ] A matching `OUT / SALE` stock movement is created.
- [ ] The related order and delivery reach their expected completed states.
- [ ] Insufficient inventory rolls back the entire completion.
- [ ] Existing sales, dashboard, and report endpoints still return their established response shape.

### Phase 2 stock integrity

- [ ] Every receipt/adjustment/accepted return writes its inventory update and stock movement atomically.
- [ ] Repeated requests cannot post a transaction twice.
- [ ] Concurrent requests cannot over-receive, over-return, or overspend stock.
- [ ] Stock never becomes negative.
- [ ] Posted business records cannot be silently edited or deleted.
- [ ] Every stock change has a reason, reference, actor, and timestamp as defined by the final design.
- [ ] Unauthorized actions return 401/403 and do not change data.
- [ ] Reports reconcile to transaction and movement records.

### Release safety

- [ ] Changes are on a Phase 2 feature branch.
- [ ] Diff contains no unrelated refactors.
- [ ] Database backup and restore were verified.
- [ ] Migration SQL was reviewed.
- [ ] Tests were run against a database copy, not only the developer's sole working database.
- [ ] Phase 1 regression evidence is recorded before merge.

---

## 8. Git and delivery workflow

Use a dedicated branch, for example:

```text
feature/phase2-suppliers
feature/phase2-purchase-receiving
feature/phase2-stock-adjustments
feature/phase2-returns
feature/phase2-audit-logs
feature/phase2-reports
feature/phase2-permissions
```

Do not make one enormous Phase 2 commit. Keep each feature small and reviewable. Merge only after its build, API tests, migration checks, and Phase 1 regression tests pass.

Before starting a feature:

```powershell
git status
git branch --show-current
git pull
```

Before committing:

```powershell
git diff --check
git diff --stat
```

Run the backend/frontend checks from their respective directories. Use the repository's existing branch and PR conventions; do not merge directly into `main` without review.

---

## 9. Decisions required from the business owner

Confirm these before implementing the relevant step:

1. **Receiving:** Can stock receiving create the initial inventory row, or must the product already have inventory?
2. **Receiving cost:** Is supplier unit cost needed for purchase reporting now?
3. **Adjustment approval:** Can one authorized staff member post an adjustment, or should a manager approve it?
4. **Returns:** Which conditions can be restocked? How are damaged/expired returns recorded?
5. **Sales accounting:** Should reports show gross completed deliveries and returns separately, or is a specific net-sales definition required?
6. **Delivery statuses:** Which real statuses are used by staff, and at exactly what point should stock leave inventory?
7. **Audit access:** Which role may view audit history, and how long should it be retained?
8. **Role matrix:** Which existing roles may receive stock, adjust stock, accept returns, and manage suppliers?
9. **Existing local Phase 2 folder:** Are there requirements in local `plan/phase2` files that have not been pushed to GitHub? Review them before treating this plan as final.

Do not guess these decisions in code.

---

## 10. Definition of Phase 2 complete

Phase 2 is complete only when:

- Suppliers and receiving records have traceable history.
- Stock-in, adjustments, returns, and delivery completion preserve inventory/ledger consistency.
- Critical operations are atomic, idempotent, permission-checked, and auditable.
- Reports reconcile to the underlying records.
- Existing Phase 1 order-to-delivery behavior still passes regression tests.
- Database migrations have been reviewed and applied without data loss.
- The frontend exposes the new workflows without duplicating backend business logic.
- The project builds cleanly and the release is documented.

**Final recommendation:** Start with Step 0, then implement Suppliers, then Purchase Receiving. Do not start returns, delivery-status expansion, or a broad permission refactor before the stock-in path is proven safe.
