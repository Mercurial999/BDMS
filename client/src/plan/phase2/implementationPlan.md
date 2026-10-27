# BDMS Phase 2 Implementation Plan

**Status:** Step 0 baseline/source review complete; Phase 2 feature work may proceed with per-feature safety gates  
**Review date:** 2026-10-27  
**Repository:** `Mercurial999/BDMS`
**Development branch:** `phase-2-development` (keep `main` as the stable Phase 1 baseline)  
**Progress tracker:** [Phase 2 Progress Tracker](./progress-tracker.md) — update it only when work and verification evidence justify a status change.  
**Scope:** Phase 2 operations upgrade while protecting the existing Phase 1 workflows. Proceed one lesson/feature at a time. Inspect the current implementation before coding; make only the changes required for the active step.  
**Review boundary:** Step 0 is closed for planning/source-baseline purposes so independent Phase 2 work can proceed. This does not claim runtime, migration, backup/restore, or full regression checks passed. Inspect the exact code and API contracts before each feature; establish a verified backup and separate test database before schema-changing or stock-mutating work. No feature should be marked complete until its acceptance criteria and relevant tests have passed.

## 1. Executive recommendation

Do not build every Phase 2 feature together. Protect Phase 1 by separating two different goals:

1. **Finish the existing Phase 1 inventory user workflow** using the already-existing backend APIs, where possible. The inventory/add-quantity plan explicitly says the backend is read-only for that frontend task.
2. **Add genuinely new Phase 2 business capabilities** (suppliers, purchase receiving, adjustments, returns, audit logs, and new reports) only when the required business rules are agreed and backend changes are explicitly authorized.

Recommended sequence:

1. Phase 1 baseline and regression checklist.
2. Inventory/Product workflow review: make sure every active product has a clear, safe path to an inventory record and stock-in. Prefer existing API behavior; do not add quantity to Product creation.
3. Stock-integrity investigation: inspect and resolve the known direct inventory-update and ambiguous adjustment paths, and define the approved server-side stock-mutation approach before implementing any new stock-changing workflow. This prerequisite review is not the same as delivering the full adjustment feature.
4. Supplier master data.
5. Purchase receiving / stock-in as the first new backend workflow, after the stock-mutation risks above are understood and made safe.
6. Stock adjustments as a dedicated, separately tested feature.
7. Customer returns.
8. Audit logs, introduced alongside critical operations rather than postponed until they become impossible to reconstruct.
9. Phase 2 reports and reconciliation.
10. Delivery status changes only if the real business workflow requires them.
11. Delivery Receipt (DR) generation and printing, generated from the actual delivery record and using linked order/customer details where available.
12. Permission hardening as a cross-cutting, explicitly tested task. Review authorization before exposing each new write endpoint.

**Key recommendation:** First complete the safety baseline and verify the existing Product → Inventory → Stock-In workflow. Then investigate and make the stock-mutation paths safe before implementing purchase receiving or any other new stock-changing workflow. Supplier master data can be built independently of receiving. Purchase receiving should be the first new stock-affecting business workflow once those risks are addressed; the full stock-adjustment feature follows as a separate, reviewed feature. The existing inventory UI task and the supplier-linked receiving workflow are related but distinct: the first should consume existing backend functionality without changing it, while the second may require new backend models and APIs. Keep them separate.

## 2. Markdown documents reviewed

The plan was compared against these Markdown documents currently visible on GitHub:

- [Phasing plan](../phasing%20plan.md)
- [Add quantity plan](../add%20quantity%20plan.md)
- [Inventory product visibility analysis prompt](../inventory%20product%20visibility%20analysis%20prompt.md)
- [Order-to-completed-delivery process](../order-to-completed-delivery-process.md)
- [Frontend plan](../frontend%20plan.md)
- [Frontend recommendations](../frontend%20recommendations.md)
- [Frontend sales and reports plan](../frontend%20sales%20and%20reports%20plan.md)

The `phase2` folder currently contains this implementation plan. No additional Phase 2 Markdown requirement file was listed in that folder during this review.

**Important limitation:** The source code has since been inspected read-only for key request paths, authentication, Orders, Product/Inventory routes, and the Prisma schema. The focused findings and remaining risks are recorded in `progress-tracker.md` and `ARCHITECTURE.md`. This is not a substitute for inspecting the exact files for each feature before editing, and it does not prove runtime behavior.

## 3. Combined business model and non-negotiable invariants

### Product is not Inventory

A Product describes what the business sells (name, unit, selling price, description, status). Inventory records how much of that product is available (quantity and minimum-stock threshold).

- Do not add current quantity to the Add Product form.
- Product creation must not invent a purchase or stock movement.
- If an active product lacks an inventory record, show a clear setup path. First determine whether the existing backend creates inventory automatically or exposes an inventory-creation endpoint.
- If an inventory record is initialized, use zero stock unless the business has a documented opening-balance process. Initial stock must not be silently fabricated.
- Do not treat Product ID and Inventory ID as interchangeable.

### Stock movement is the stock ledger

Physical stock changes must have a matching stock movement. A frontend must not calculate and save a new quantity itself.

- Stock-in increases inventory through the approved backend operation.
- Delivery completion remains the existing stock-out point.
- Creating or confirming an order must not deduct stock.
- Delivery completion must not be duplicated or double-deduct inventory.
- Stock quantity and its ledger entry must succeed or fail together.
- Every stock change should be traceable to a reason and reference.

### Existing order-to-delivery workflow must remain intact

The Markdown describes this existing flow:

```text
Staff login
  -> Create order (PENDING)
  -> Confirm order (CONFIRMED)
  -> Create delivery (DRAFT)
  -> Complete delivery
  -> Inventory deduction
  -> OUT / SALE stock movement
  -> Delivery and related order become completed
  -> Sales and reports reflect completed delivery
```

Preserve these rules:

- Operational quantities are positive whole numbers; partial sacks/units are not supported.
- Only a confirmed order can become a delivery.
- An order should not create multiple deliveries.
- Stock is deducted at the existing delivery-completion point, not when an order is created or confirmed.
- The frontend triggers the completion endpoint; it does not separately deduct stock, create a sale, or create a stock movement.
- Sales are derived from completed deliveries. Do not introduce a separate Sale model or duplicate sales-entry process.
- Bakery stores are Customer records, not login accounts in this phase.
- Customer login accounts, customer portal, online ordering, multiple warehouses, and large-scale analytics remain deferred unless separately approved.
- Delivery Receipt (DR) generation/printing is now in Phase 2 scope. A DR documents the goods actually delivered; it is not automatically a BIR-compliant sales invoice or official receipt.

## 4. Main risk findings and recommendations

### Risk A — The current inventory input plan and Phase 2 receiving can be confused

The Add Quantity plan describes a stock-in operation using existing backend functionality and says not to modify backend code for that task. The Phase 2 roadmap describes supplier-linked purchase receiving, which may require new backend models, lifecycle rules, and APIs.

**Recommendation:** Keep two tickets/phases:
- **Inventory workflow completion (frontend-only if possible):** use the existing stock/inventory API, show clear errors, and ensure stock-in creates the correct movement.
- **Supplier-linked purchase receiving (Phase 2):** design and implement a new auditable receiving workflow only after approval to change the backend.

Do not quietly turn a frontend-only task into a schema/API change. If the current backend cannot support a safe stock-in, stop and document the gap instead of bypassing it.

### Risk B — Missing inventory records may explain product visibility issues

The inventory visibility prompt correctly identifies several possibilities: Product creation may not create an Inventory row; Inventory may list only existing Inventory rows; an inventory-creation endpoint may be required; a permission/API error may be hidden; or the frontend may be confusing product IDs and inventory IDs.

**Recommendation:** Diagnose the existing behavior before changing it. Consider these alternatives in order:
1. Use existing backend behavior if Product creation already initializes inventory.
2. If an existing inventory-create endpoint exists, provide a clear “Set up inventory” action that creates a real Inventory record with zero quantity.
3. If neither behavior is supported, document that as a backend gap and ask for explicit approval before changing backend code.

Do not create client-only inventory rows, add stock to the Product form, or create fake `IN / PURCHASE` movements.

### Risk C — Quantity semantics and inventory writes must be consistent

The planning docs require whole-number quantities and say the backend is the source of truth. The current code's exact stock movement semantics must be verified before implementation.

**Recommendation:** Establish one approved server-side stock mutation path. Do not silently change an existing endpoint's meaning. Keep minimum-stock changes distinct from physical stock changes. A quantity correction should capture the counted quantity or delta unambiguously and preserve the stock ledger.

### Risk D — Receiving must be safe against repeated and concurrent requests

A supplier receipt must not add stock twice when a user double-clicks, retries after a timeout, or two requests arrive together.

**Recommendation:** Use a controlled draft-to-received/posting lifecycle. In one database transaction, lock the receipt and affected inventory rows, validate the input, update stock, create corresponding stock movements, and mark the receipt as posted. Enforce the posted state in the database/service so a second request cannot post it again.

### Risk E — Return records must not rewrite completed deliveries

Returns are a new business event, not a way to edit the original delivery or delete its stock-out movement.

**Recommendation:** Link each return to the original completed delivery and its delivered items. Limit cumulative returns to the quantity originally delivered. Only accepted, resellable items should return to sellable inventory. Record damaged/expired goods without automatically adding them to available stock. Decide how returns are presented in sales reporting before calculating net sales.

### Risk F — Delivery status expansion can affect stock timing

The roadmap lists possible statuses such as PENDING, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, and RETURNED, but the actual business workflow has not yet been confirmed.

**Recommendation:** Do not add statuses merely because they are listed. First define allowed transitions and exactly one stock-affecting transition. Preserve current status values and compatibility. Treat customer returns separately from delivery status unless the business has a clear reason to combine them.

### Risk G — Permissions must be enforced by the backend

The Markdown plans mention roles and permissions, but a visible/hidden frontend button is not security.

**Recommendation:** Before each new feature is exposed, inspect the actual route-level and global middleware behavior. Define a small permission matrix for the current roles, seed new permissions idempotently, and test unauthenticated, forbidden, and authorized requests. Do not refactor every permission in the same commit as receiving.

### Risk H — Historical transactions should remain auditable

Posted receipts, stock adjustments, returns, completed deliveries, and their stock movements are business history.

**Recommendation:** Do not allow normal users to delete or silently edit posted records. Correct mistakes with a reversal/correction record and a reason. Audit critical stock-changing actions, ideally in the same transaction when the log must prove that the business change committed.

## 5. Implementation roadmap

## Step 0 — Establish the Phase 1 baseline

**Purpose:** Confirm the current system is stable before any Phase 2 change.

Tasks:
- Create a dedicated Phase 2 feature branch and record the current commit.
- Confirm the working tree is clean.
- Back up the database and verify restore to a separate test database.
- Check migration status; never reset the working database.
- Run backend build, frontend lint, and frontend build.
- Capture known-good responses for login, products, inventory, stock movements, customers, orders, deliveries, sales, dashboard, and reports.
- Record starting quantities and stock-movement history for selected products.
- Test the full order-to-completed-delivery workflow.
- Test insufficient stock, repeated completion, and failed transaction behavior.

**Acceptance criteria:** The baseline builds; the end-to-end workflow works in a test database; failed completion leaves inventory and statuses unchanged; repeated completion does not deduct stock again.

Do not proceed until this baseline can be repeated.

## Step 1 — Resolve the existing Product-to-Inventory-to-Stock-In workflow

**Scope:** First inspect and, if possible, complete the frontend using existing backend APIs. Do not modify backend code for this step without separate approval.

Checklist:
1. Confirm whether Product creation automatically creates an Inventory record.
2. Confirm whether Inventory returns only existing inventory records or all products.
3. Confirm whether the existing backend supports creating an inventory record.
4. Confirm the stock-in endpoint, accepted reasons, request shape, permission requirement, and response.
5. Confirm that Add Stock selects an Inventory ID, not a Product ID.
6. Ensure integer validation, loading/error/success states, and data refresh after a successful stock-in.
7. Ensure stock-in calls the backend stock movement flow and never directly edits the database from the browser.
8. Ensure Product creation does not create fake stock or a fake purchase movement.

**Preferred behavior:** A newly created active Product has a clear path to an Inventory record with zero quantity; actual stock arrives through a stock-in operation. Whether inventory is auto-initialized or explicitly created must follow verified existing backend behavior.

**Acceptance criteria:** Staff can understand the difference between Product and Inventory; a product without an inventory record has a clear state; stock-in changes quantity through the server and records the corresponding movement; no backend changes are made as part of this frontend-only step.

### Step 1 verification record (2026-10-22)

A focused manual workflow check was completed:
- Created test product `Phase 2 Test Flour`.
- Confirmed it appeared in the inventory setup list.
- Initialized its Inventory record at quantity `0`.
- Added `5` units through the existing stock-in workflow with reference `PHASE2-TEST`.
- Confirmed the resulting inventory quantity was `5` and a matching `IN / PURCHASE` stock movement existed.
- Frontend production build passed with `npm run build`.

**Limitations:** This was not a full Phase 1 regression. Backup/restore, complete authorization/error-path tests, and the full order-to-delivery workflow remain unverified. The direct inventory quantity-update path and `ADJUSTMENT` semantics remain known stock-integrity risks. Step 1's focused workflow check is complete; Step 0 safety checks remain in progress. See the progress tracker for the recorded evidence.

## Step 2 — Suppliers (master data only)

**Business outcome:** Staff can maintain records for the companies that supply ingredients.

Proposed fields, to confirm with the business:
- ID and supplier name.
- Contact person, phone, email, and address (optional as appropriate).
- ACTIVE/INACTIVE status.
- Created/updated timestamps.

Rules:
- Use the existing feature-module architecture and error/validation patterns.
- Do not store stock quantity on Supplier or Product.
- Supplier create/update/deactivate must not change inventory.
- Prefer deactivation instead of deletion after the supplier has transaction history.
- Decide whether supplier names must be unique; do not impose a constraint without confirming business expectations.
- Apply backend authentication and authorization.

Potential endpoint names (proposals, not claims about existing routes):
- `GET /api/suppliers`
- `GET /api/suppliers/:id`
- `POST /api/suppliers`
- `PATCH /api/suppliers/:id`
- `PATCH /api/suppliers/:id/deactivate`

**Acceptance criteria:** Supplier records can be maintained without changing Phase 1 inventory, orders, deliveries, sales, or reports.

## Step 3 — Purchase Receiving / Stock-In

**Business outcome:** Record where stock came from and increase inventory exactly once.

Proposed records:
- Receiving header: supplier, receipt/reference number, received date, status, notes, creator, timestamps.
- Receiving items: product, whole-number received quantity, and optional unit cost if purchase-cost reporting is needed.
- Stable unique reference/idempotency protection to prevent accidental duplicate posting.

Proposed workflow:

```text
Create draft receipt
  -> Add and validate items
  -> Review
  -> Receive/Post once
  -> Transaction:
       lock receipt and affected inventory rows
       validate supplier, products, and quantities
       resolve missing inventory only under an approved rule
       update inventory
       create IN / PURCHASE stock movements linked to receipt
       mark receipt as received/posted
  -> Commit
```

Decisions required first:
- May receiving create the first Inventory record, or must it already exist?
- Can a receipt contain multiple products? Recommendation: yes.
- Should duplicate product lines be rejected or combined? Recommendation: normalize to one line per product.
- Is unit cost needed now? If not, defer it rather than guessing.
- What receipt number/reference format is required?
- Can a posted receipt be edited? Recommendation: no; correct it with a reversal/correction.

Rules:
- Use positive whole-number quantities.
- Update stock and movement records in the same transaction.
- Protect against duplicate/concurrent posting.
- Never use a frontend sequence of separate API calls to simulate a database transaction.
- Do not repurpose the existing generic stock-movement endpoint until its semantics and permissions have been verified.

**Tests:** Valid one-item and multi-item receipts; inactive/missing supplier; inactive/missing product; invalid quantities; duplicate reference; repeated and concurrent post; rollback; correct movement reference; stock-ledger reconciliation.

**Acceptance criteria:** A successful receipt adds stock exactly once and produces matching `IN / PURCHASE` movements. A failed or repeated request creates no partial or duplicate stock changes.

## Step 4 — Stock Adjustments

**Business outcome:** Correct discrepancies with a reason and a traceable history.

Before coding, define who may adjust stock, whether approval is needed, allowed reasons, and whether the user enters a counted/target quantity or a delta.

Recommended design:
- Record inventory/product, previous quantity, counted quantity, computed difference, resulting quantity, reason, notes, actor, timestamp, and reference.
- Calculate the difference on the server after locking the inventory row; do not trust a client-provided previous quantity.
- Prevent stock from becoming negative.
- Require a reason and backend permission.
- Commit inventory update, movement, and critical audit event atomically.
- Preserve existing endpoint semantics; use a dedicated adjustment operation if the current generic endpoint is ambiguous.

**Acceptance criteria:** Every correction is explainable, concurrency-safe, and consistent with the stock ledger.

## Step 5 — Customer Returns

**Business outcome:** Track goods returned from a customer without inflating sellable stock.

Proposed return header/items should link to the original completed delivery, customer, delivered item/product, quantity, reason, condition/disposition, status, actor, and timestamps.

Rules:
- Only returns against a valid completed delivery.
- Returned product must be part of that delivery.
- Total accepted and pending returns cannot exceed the quantity delivered; enforce this under concurrency.
- Only accepted, resellable goods increase available inventory.
- Damaged/expired goods must be recorded but not automatically restocked as sellable.
- Accepted restock and `IN / RETURN` movement must be one transaction.
- Never edit the original delivery or remove its `OUT / SALE` movement.
- Decide whether reports show gross sales and returns separately or apply a defined net-sales rule.

**Acceptance criteria:** Over-returns are rejected, stock only increases for approved resellable items, and original sales/delivery history stays intact.

## Step 6 — Audit Logs

Start with a focused append-only audit log, not a complex event platform.

Suggested fields:
- Actor user ID, action, entity type/ID, timestamp, reference/correlation ID, and carefully selected structured metadata.
- Before/after summaries only where useful and safe.

Initially record:
- Supplier create/update/deactivate.
- Receipt create/post/reversal.
- Stock adjustment.
- Return receive/accept/reject.
- Delivery completion/cancellation.
- User, role, and permission changes.

Never log passwords, password hashes, JWTs, authorization headers, or unnecessary personal information. Ordinary endpoints should not allow audit records to be edited/deleted. For stock-critical events, record the audit event transactionally with the business operation where appropriate.

**Acceptance criteria:** Critical operations can be traced to an actor and reference without leaking secrets.

## Step 7 — Phase 2 reports and reconciliation

Extend the existing reports module; do not replace current report APIs.

Recommended reports:
1. Supplier receiving history.
2. Stock-in by date, supplier, product, and receipt reference.
3. Adjustments by reason, actor, and date range.
4. Returns by original delivery, product, reason, disposition, and period.
5. Authorized audit history.
6. Stock reconciliation/ledger view.
7. Delivery status summary only if delivery statuses are approved.

Rules:
- Keep existing Phase 1 report response contracts stable.
- Validate date filters and use consistent date boundaries.
- Do not invent fields or calculate authoritative totals in the frontend.
- Define how returns affect sales before adding net-sales figures.
- Add pagination/filtering where data volume requires it.
- Restrict sensitive reports by backend permission.

**Acceptance criteria:** Report values reconcile to source transactions and stock movements; existing reports remain compatible.

## Step 8 — Delivery status changes (conditional)

Do this only if staff confirm that current `DRAFT`, `COMPLETED`, and `CANCELLED` states do not represent their actual workflow.

Before coding, document:
- Every allowed transition.
- Which roles can perform it.
- Whether inventory changes.
- Whether cancellation is permitted after dispatch/completion.
- How partial deliveries and returns work.

Do not conflate a customer return with a delivery status unless there is a clear business reason. Add enum changes through a new reviewed migration; never rewrite an already-applied migration. Preserve exactly-once stock deduction at the approved fulfillment transition.

**Acceptance criteria:** Invalid transitions are rejected, status-only changes do not change stock, and stock-affecting transitions are transactional and idempotent.

## Step 9 — Delivery Receipt (DR) generation and printing

**Business outcome:** Staff can produce a printable Delivery Receipt from a delivery record without re-entering customer and order details.

**Relationship to existing workflows:**
- Keep Orders and Deliveries as separate records: an Order records what the customer requested; a Delivery records what was actually sent.
- Generate the DR from the Delivery record. When the delivery originated from an Order, use the linked order and customer data to prefill relevant details.
- The DR item lines must show the actual quantities on that Delivery, not blindly copy the originally ordered quantities. Staff must be able to verify delivered quantities before completing the delivery under the existing workflow.
- Preserve the current inventory rule: stock is deducted only by the existing delivery-completion operation. Printing or previewing a DR must not change inventory, create a second stock movement, or mark a delivery complete.
- Do not require customer login accounts; the existing Customer record is sufficient for customer details.

**Proposed DR contents (confirm with the business before implementation):**
- Unique DR number and delivery date.
- Business name and contact details.
- Customer name and delivery address/contact details available in the Customer record.
- Related order number/reference, when applicable.
- Product descriptions, units, and actual delivered quantities.
- Prepared by / delivered by fields if required by the business.
- Customer acknowledgment and signature area.
- Any agreed notes or terms.

**Design and safety decisions required before coding:**
- Confirm the required paper size/layout (including whether long-bond paper is mandatory), margins, copies, and printer expectations.
- Confirm the DR number format and whether numbers are allocated when a draft is created or when a delivery is completed. Numbers must not collide.
- Confirm which customer/business fields must be printed and which are optional.
- Decide whether the printed DR is a live view or a saved document snapshot. If delivery/customer details can later change, define how historical reprints remain accurate.
- Define whether a DR can be previewed/printed for a DRAFT delivery and what is allowed after cancellation/completion.
- Confirm whether staff may correct delivery items before completion and how a corrected/reprinted DR is identified.
- Keep the DR distinct from a sales invoice or official receipt. Do not label it BIR-compliant or use it as a substitute for a legally required tax document without the business's accountant confirming the applicable requirements.

**Implementation guidance:**
1. Inspect current Order–Delivery relations, customer fields, delivery item fields, and status transitions read-only.
2. Agree on the DR template and numbering rules before choosing a PDF/print implementation.
3. Reuse the existing delivery/customer/order data; avoid duplicate customer or order entry.
4. Add backend fields/tables only if the agreed numbering, snapshot, or audit requirements need them. Review any migration as additive and test it against a separate database.
5. Ensure the document uses actual delivery quantities and does not mutate business data merely by rendering or printing.
6. Test Order-linked and non-order deliveries if the current system permits both, long names/addresses, multiple items, page breaks, reprints, and unauthorized access.

**Acceptance criteria:** Staff can preview and print a DR with correct customer/order context and actual delivery item quantities; the DR has a non-colliding reference and agreed paper layout; preview/printing does not change stock or statuses; completed delivery and stock-movement behavior remains unchanged; the document is not misrepresented as a BIR invoice/official receipt.

## Step 10 — Permission hardening

Use the existing role/permission foundation rather than inventing a second authorization system.

Possible permission families (names must match existing conventions):
- `suppliers.read/create/update`
- `purchases.read/create/receive`
- `inventory.adjust`
- `returns.read/create/receive`
- `audit.read`

Before adding permissions:
- Inspect existing permission definitions and role assignments.
- Decide the role matrix with the business owner.
- Make seed changes idempotent.
- Protect every backend route; frontend navigation filtering is only a usability feature.
- Test 401 unauthenticated, 403 authenticated-but-forbidden, and successful authorized requests.
- Prefer user deactivation for ordinary offboarding.

**Acceptance criteria:** Every new write operation and sensitive report has tested server-side authorization.

## 6. Database and migration safety

- Use a backup and a separate development/test database.
- Prefer additive migrations and new tables/columns.
- Never reset the shared database to apply Phase 2.
- Never edit an already-applied migration; create a new migration.
- Review generated SQL, constraints, indexes, enum changes, and defaults.
- Apply migrations to a copy of the current Phase 1 database and verify existing records/relationships.
- Document recovery steps because migrations are not automatically reversible.
- Avoid broad decimal-to-integer conversions. Inspect stored values and business requirements first; if conversion is ever needed, handle it as a separate reviewed migration with a preflight check and recovery plan.
- Do not add every possible future model at once.

Possible future entities include Supplier, Receiving header/items, Stock Adjustment (if a distinct document is justified), Customer Return header/items, and Audit Log. Finalize each design only when its step begins.

## 7. Frontend and backend implementation pattern

Follow the existing architecture rather than restructuring the application:

```text
Frontend page
  -> existing API helper/service
  -> authenticated route
  -> validation
  -> controller
  -> business service
  -> repository/Prisma
```

For each approved feature, proceed incrementally:
1. Explain the business rule and example.
2. Inspect the current code and API contract read-only.
3. Agree on data model and edge cases.
4. Make the smallest backend/schema change needed, if authorized.
5. Add validation, service logic, transaction, and authorization.
6. Build and test the API with Postman.
7. Add frontend types/service/page.
8. Run the complete workflow and Phase 1 regression tests.
9. Review the diff and commit only related changes.

Use the existing native-fetch API helper. Do not add Axios. The frontend should collect input and display backend results; it must not own stock calculations or state-transition rules.

## 8. Verification checklist

### Build and migration
- [ ] Backend build passes.
- [ ] Frontend lint and build pass.
- [ ] Prisma client generation uses the repository's existing command.
- [ ] Migration status is expected.
- [ ] Migration SQL has been reviewed and tested against a database copy.

### Phase 1 regression
- [ ] Login works; inactive users cannot log in.
- [ ] Product and customer workflows still work.
- [ ] Product/Inventory distinction is maintained.
- [ ] Existing inventory and stock movements remain readable.
- [ ] Orders use positive integer quantities and can be confirmed.
- [ ] Only confirmed orders can create deliveries.
- [ ] An order cannot create duplicate deliveries.
- [ ] Completing a delivery deducts stock once and creates matching `OUT / SALE`.
- [ ] Insufficient stock rolls back the completion.
- [ ] Repeated completion does not deduct stock twice.
- [ ] Related order/delivery statuses remain correct.
- [ ] Sales, dashboard, and existing reports remain compatible.

### Phase 2 stock integrity and security
- [ ] Receipt, adjustment, accepted return, inventory update, and movement entries are atomic.
- [ ] Duplicate/repeated posts cannot mutate stock twice.
- [ ] Concurrent operations cannot over-return or double-post.
- [ ] Stock cannot become negative.
- [ ] Posted history cannot be silently edited/deleted.
- [ ] Every stock change has the required reason/reference/actor/timestamp.
- [ ] Unauthorized requests do not mutate data.
- [ ] Reports reconcile to source records and stock movements.

### Release
- [ ] Each feature is on its own branch/commit.
- [ ] No unrelated refactor is included.
- [ ] Backup restoration was verified.
- [ ] Regression results are recorded before merge.

## 9. Git workflow

**Project-specific workflow decision (2026-10-27):** The user wants completed Phase 2 features committed directly to `phase-2-development`, with the relevant Markdown tracker/plan updated in the same feature commit. Do not switch to `main` or create a separate feature branch unless the user changes this preference. Keep commits small, inspect `git status` and diffs first, and never discard unrelated or untracked work. A multi-file documentation update should be one commit containing both the tracker and plan.

Use small feature branches only if the user later approves that workflow, for example:

```text
feature/phase2-inventory-workflow
feature/phase2-suppliers
feature/phase2-purchase-receiving
feature/phase2-stock-adjustments
feature/phase2-returns
feature/phase2-audit-logs
feature/phase2-reports
feature/phase2-permissions
```

Before work:
```powershell
git status
git branch --show-current
git pull
```

Before commit:
```powershell
git diff --check
git diff --stat
```

Do not put the whole Phase 2 roadmap in one large commit. Run relevant builds and tests before merging. Keep `main` as a known-good Phase 1 baseline.

## 10. Decisions to confirm before implementation

1. **Inventory initialization:** Should every active product get an inventory record with quantity zero automatically, or should staff use an explicit setup action? First verify current behavior.
2. **Receiving:** May a receipt create the initial inventory record, or must it already exist?
3. **Supplier/product relationship:** Does the business need a preferred-supplier or supplier-product list, or is supplier selection on each receipt enough for now?
4. **Purchase cost:** Is unit cost needed in Phase 2? If yes, confirm whether it is for purchase history only or future costing/accounting.
5. **Receipt correction:** Should posted receipts be reversed with a reason rather than edited? Recommended: yes.
6. **Adjustment approval:** Which role may create and approve adjustments?
7. **Return disposition:** Which returned goods can be restocked, and how should damaged/expired goods be tracked?
8. **Sales treatment:** Should returns be shown separately from gross sales, or is a formally defined net-sales report required?
9. **Delivery statuses:** Which states do staff actually use and at what point should inventory leave stock?
10. **Audit access/retention:** Who may view audit history and how long must it be retained?
11. **Role matrix:** Which current roles may receive stock, adjust stock, accept returns, and manage suppliers?
12. **Frontend-only constraint:** For the existing Add Quantity task, confirm that backend changes remain out of scope unless inspection proves no safe existing API can support it.
13. **Delivery Receipt:** Confirm paper size/layout, required printed fields, DR numbering and allocation timing, draft/completed/cancelled printing rules, reprint/history behavior, and whether a saved snapshot is required. Keep the DR separate from BIR sales invoices/official receipts unless accounting requirements are independently confirmed.

Do not guess these business decisions in code. Record the decision before implementing the related feature.

## 11. Future suggestions (not Phase 2 blockers)

These are recommendations for later, not features to build now:

- **Opening stock procedure:** Provide a documented, authorized opening-balance process for initial inventory, separate from supplier purchases, so migration or setup stock is not misreported as a purchase.
- **Product units and packaging:** Keep whole-number operational quantities for now. If the business later needs conversions (e.g., bag vs. kilogram), design explicit base units and conversion rules rather than allowing arbitrary decimals.
- **Supplier-product history:** Consider preferred suppliers and last purchase cost only after receiving data is reliable.
- **Damaged/expired stock:** If the volume warrants it, add a separate non-sellable/quarantine stock state or location. Do not mix it with sellable stock.
- **Reorder support:** Use minimum-stock thresholds to flag low stock first. Automated purchase suggestions can follow once supplier and receiving history is trustworthy.
- **Export and BIR reports:** Ask the business/accountant for the exact required fields, periods, and definitions before designing compliance reports. Do not label a report BIR-compliant without validation.
- **Backups and operations:** Document backup schedule, restore drills, environment variables, migration deployment, and how to recover from a failed release.
- **Operational monitoring:** Add structured server logs and request IDs without exposing credentials or customer-sensitive information.
- **Browser smoke tests:** Add repeatable checks for login, stock-in, order creation/confirmation, delivery completion, and reports after the core workflow is stable.
- **Multi-warehouse support:** Defer until the business actually operates multiple stock locations; this would require inventory per location, not just a warehouse dropdown.
- **Customer portal/mobile app:** Keep deferred to Phase 3+; internal staff workflow and inventory integrity take priority.

## 12. Definition of Phase 2 complete

Phase 2 is complete when:
- Supplier and receiving history are traceable.
- Stock-in, adjustments, returns, and delivery completion keep stock and movement history consistent.
- Critical operations are transactional, protected against duplicate/concurrent requests, permission-checked, and auditable.
- New reports reconcile to source records.
- Existing Phase 1 order-to-delivery and sales/report behavior still passes regression tests.
- Database migrations are reviewed and applied without data loss.
- Frontend workflows consume the backend source of truth and do not duplicate business logic.
- Delivery Receipts can be generated/printed from delivery records with correct actual quantities and agreed customer/order details, without changing stock when printed.
- Builds, tests, and release notes are complete.

**Final recommendation (updated 2026-10-27):** Step 0 source/planning review and Step 1 focused manual workflow review are documented as complete; runtime/release checks remain outstanding and must not be reported as passed. Next inspect and implement Suppliers as an independent feature on `phase-2-development`, updating the tracker and plan with verified evidence in the same commit. Before Purchase Receiving or other stock-mutating/schema-changing work, verify database backup/restore and a separate test database, and resolve the documented stock-mutation risks. Do not start returns, delivery-status expansion, or a broad permission refactor until the core stock-in path is proven safe and the relevant business decisions are confirmed.
