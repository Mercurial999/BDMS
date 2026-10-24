# Bakery Distribution Management System (BDMS)
## Product Direction and Phased Roadmap

**Status:** Working roadmap for Phase 2 and future development  
**Current focus:** Phase 2 — Operations Upgrade  
**Principle:** Improve the real staff workflow first. Add customer-facing platforms only when the business has a demonstrated need.

This document replaces the older roadmap as the current planning guide. It preserves the original direction—keep the first system practical, protect inventory integrity, and postpone customer accounts and mobile apps—but updates the sequence to reflect the current BDMS implementation. A roadmap item is a proposal until its business requirements and acceptance criteria are confirmed.

---

## 1. Product direction and operating model

BDMS is an internal operations system for a bakery-ingredient distribution business. Staff use the web application to maintain products and customers, record orders and deliveries, manage stock, and review reports.

### Current business rule: staff enter orders

For the current version, **bakery customers do not need BDMS user accounts**. Staff can record a customer's order in the system on the customer's behalf, then use that record to prepare and track fulfillment as the implemented workflow allows.

Keep these concepts separate:

- **System user:** a person who signs in to BDMS, such as the administrator or staff.
- **Customer:** a bakery/store business receiving products. It is a business record, not a login account.
- **Staff-entered order:** an internal operational record entered by authorized staff. It does not imply that a customer submitted the order online.
- **Delivery:** the record of products delivered to a customer. Order and delivery must not be treated as interchangeable; their relationship should follow the existing data model and confirmed business process.

Do not build customer registration, customer login, an online ordering portal, or a customer mobile app in the current scope. Revisit these only when the business explicitly requests them and can define who will manage accounts, order review, pricing, availability, and support.

### Users and access

Keep the current user/role/permission architecture and build on it rather than redesigning it without a demonstrated need. The intended operating model is one Admin account with authority to manage staff accounts and permissions, plus staff accounts with only the access needed for their jobs. Deactivated staff must not be able to log in. Do not add multi-admin governance or complicated account rules unless the business later needs them.

---

## 2. Current implementation and planning rule

Phase 1 is considered functionally complete by the project owner. That does **not** mean every edge case, backup/restore procedure, or release check has been proven. Phase 2 should begin with a limited safety and regression checkpoint, not a rewrite of working modules.

Before each feature:
1. Inspect the current source, Prisma schema, migrations, API routes, frontend services/pages, and permissions.
2. Confirm the business problem and acceptance criteria.
3. Identify effects on inventory, stock movements, orders, deliveries, reports, and existing records.
4. Prefer a small change that fits the existing feature-based architecture.
5. Test the backend and API before integrating the frontend.
6. Run relevant regression tests and update the implementation plan and progress tracker.

Do not assume that the old example folder tree or old module names match the current repository. Extend the actual structure. Avoid editing generated output under `server/dist` directly; change source files and regenerate build output through the normal build process.

---

## 3. Phase 1 — Internal operational foundation

**Status: Completed for project planning; retain regression checks.**

The foundation includes the internal sign-in and access model, products, inventory, stock movements, customers, orders, deliveries, and reports as implemented in the current repository.

The core inventory principle remains mandatory:

- Inventory changes must go through centralized business logic and safe database transactions.
- Delivery completion must validate available stock, deduct the correct quantities, and record the corresponding stock movements atomically.
- A failed operation must not leave inventory, delivery, or movement records partially updated.
- Stock movements are the history of stock changes; do not silently edit historical movements to make balances appear correct.
- Quantities follow the project's current integer-quantity decision. Do not reintroduce fractional quantities without an explicit business requirement.

Phase 2 work must not break existing sign-in, customer management, order entry, delivery completion, inventory, or reports.

---

## 4. Phase 2 — Operations upgrade

**Goal:** Improve traceability, stock control, staff accountability, and reporting for the existing internal workflow. No customer accounts or mobile app are required.

The order below is recommended, but each feature should start only after its dependencies and business rules are confirmed.

### Step 0 — Safety checkpoint and baseline

- Review the current branch, uncommitted changes, and recent commits before merging or syncing work.
- Confirm the database migration status and how to back up and restore the development database.
- Run frontend and backend builds and the existing relevant tests.
- Smoke-test sign-in, products, inventory, stock movements, customers, staff-entered orders, deliveries, and reports.
- Record known gaps and do not claim full regression coverage unless the tests were actually performed.

**Exit criteria:** a documented baseline, a recoverable database, and no known blocking regression in the core workflow.

### Step 1 — Verify the product-to-inventory workflow

Confirm that an active product can be created, inventory can be initialized according to the existing workflow, and stock-in creates the expected inventory balance and movement history. Check validation, permissions, duplicate requests where relevant, and error behavior.

**Status:** A manual smoke test was recorded in the Phase 2 tracker. It is useful evidence, but it is not a substitute for the full safety checkpoint.

### Step 2 — Suppliers

Add supplier records for businesses that provide ingredients. Start with the fields the business actually needs, such as name, contact details, address, status, and notes if justified.

- Supplier records are not supplier login accounts.
- Keep supplier management separate from staff authentication.
- Define what deactivating a supplier means for existing receiving records.
- Avoid supplier-product pricing/history complexity until it is needed for purchasing decisions.

**Exit criteria:** staff can manage and search supplier records; deactivation does not erase historical references.

### Step 3 — Purchase receiving / stock-in

Record incoming stock with its source instead of relying only on unexplained manual stock increases.

Recommended workflow:
Supplier (optional only if business allows an unknown source) → receiving record → received items and integer quantities → validate → transaction-safe inventory increase → stock movement.

Decide before coding:
- Whether partial receiving is allowed.
- Whether a supplier reference or invoice/delivery note number is required.
- Whether a receiving record can be edited or cancelled after posting.
- How duplicate receiving references are handled.
- Whether received unit/cost information is in scope.

Do not implement full purchasing, supplier payment, accounts payable, or purchase-order approval unless the business needs them. Receiving stock and managing supplier payments are separate business processes.

**Exit criteria:** posting a receiving record increases stock exactly once and creates traceable stock movements; failed or repeated requests do not duplicate stock.

### Step 4 — Inventory controls and stock adjustments

Make inventory corrections traceable before building more workflows on top of stock balances.

Recommended requirements:
- Only authorized staff can create adjustments.
- Every adjustment records product, quantity change, reason, timestamp, and actor where supported by the schema.
- Positive and negative adjustments are validated; stock must not become negative unless a future, explicit business rule permits it.
- The inventory balance and stock movement are updated atomically.
- Historical adjustments are not silently overwritten; corrections should be represented by a new auditable transaction.

Before implementation, inspect the existing `ADJUSTMENT` stock-movement behavior and any direct inventory-quantity update paths. Decide whether those paths should be restricted, replaced, or retained for a narrowly defined initialization process.

**Exit criteria:** authorized, reasoned, transaction-safe adjustments with a clear audit trail and tests for insufficient stock and invalid input.

### Step 5 — Delivery and order workflow review

Keep order entry staff-operated. Review the current order and delivery modules together and confirm the business lifecycle before adding more statuses.

- Define what order states mean and which transitions are allowed.
- Define whether orders can be edited or cancelled after confirmation.
- Define when inventory is reserved or deducted; do not change this timing without a clear rule.
- Ensure delivery completion is the only intended point for delivery-related stock deduction, unless the current approved workflow explicitly says otherwise.
- Keep cancellation and return behavior distinct from successful delivery.
- Avoid adding statuses just because they appear in the old plan; each status must correspond to a real operational step.

**Exit criteria:** documented state transitions and tests for valid/invalid transitions, cancellation, insufficient stock, and repeated completion.

### Step 6 — Customer returns

Implement returns only after the business defines how it handles returned goods.

Decisions required:
- Which deliveries/orders may be returned and within what conditions.
- Whether returned products are resalable, damaged, expired, or quarantined.
- Who approves a return.
- Whether accepted goods increase available inventory or go to a separate damaged/quarantine process.
- How the return relates to the original delivery and stock movements.
- How partial returns and duplicate return submissions are handled.

A return must not simply delete or reverse historical delivery data. Record a separate return transaction and the appropriate stock movement(s).

**Exit criteria:** each return is linked to its source where possible, has item-level quantities and reasons, and changes stock only according to the approved disposition.

### Step 7 — Delivery receipt generation and printing

Generate a printable delivery receipt from the actual delivery record. Treat this as an operational document, not automatically as a BIR-compliant sales invoice or official receipt.

Recommended baseline:
- Include a unique receipt/document number if the business approves a numbering policy.
- Include customer/store details, delivery date, delivered items, integer quantities and units, and appropriate sign-off fields.
- Reflect actual delivered quantities, not merely requested order quantities.
- Printing or reprinting must not complete a delivery, change inventory, or create stock movements.
- Keep enough reference information to trace the receipt back to its delivery.

Before implementation, confirm paper size (including whether long bond paper is required), layout/margins, copies, printer workflow, numbering format and when a number is assigned, allowed delivery statuses, corrections/reprints, and whether a receipt should be a live view or a saved snapshot. Confirm invoice/official-receipt requirements with the business's accountant or qualified adviser.

**Exit criteria:** a tested print layout with correct data, repeatable reprints, and no side effects on inventory or delivery status.

### Step 8 — Audit logs

Add focused audit logging for important actions, such as account activation/deactivation, product or customer changes, stock adjustments, receiving posts/cancellations, order state changes, delivery completion/cancellation, returns, and permission changes.

- Record actor, action, timestamp, target record, and relevant before/after details where appropriate.
- Do not store passwords, access tokens, or other secrets in logs.
- Keep logs protected from ordinary editing/deletion.
- Do not attempt to log every harmless read unless a real audit need justifies it.

If an action changes inventory, the stock-movement ledger remains essential; audit logs supplement it rather than replace it.

**Exit criteria:** critical actions are traceable and tests verify that sensitive values are not logged.

### Step 9 — Reports and operational dashboard

Improve reports based on business decisions and the quality of recorded data. Prioritize:
- Current stock and low-stock visibility (once thresholds are defined).
- Stock-in, stock-out, adjustments, and movement history.
- Deliveries by date, status, customer, and product.
- Order-to-delivery status where the data relationship supports it.
- Supplier receiving summaries.
- Returns and damaged stock, once return handling exists.
- Audit activity for authorized reviewers.

Every report should define its date range, filters, totals, and source of truth. Reconcile totals against underlying records. Do not label reports as BIR-compliant until the actual legal/accounting requirements have been confirmed.

**Exit criteria:** report totals can be reconciled to source records and access is permission-controlled.

### Step 10 — Permission hardening

Review backend authorization for every sensitive endpoint, not only whether a frontend button is hidden.

- Apply least privilege to staff actions.
- Protect user administration and permission changes.
- Check that deactivated accounts cannot continue normal authenticated access according to the application's token/session behavior.
- Ensure frontend navigation and backend permissions agree.
- Test unauthorized, unauthenticated, and insufficient-permission responses.

Keep the permission model as simple as the real roles require. Do not add complex approval chains or multi-admin governance without a business reason.

**Exit criteria:** an endpoint-by-endpoint permission matrix is documented and tested.

### Step 11 — Regression and release readiness

- Run frontend lint/build and backend build.
- Run automated tests that exist and manual end-to-end checks for the critical workflows.
- Verify migrations on a clean/test database and document backup/restore steps.
- Review error handling, validation, permissions, and duplicate submissions.
- Confirm Docker Compose deployment/rebuild instructions.
- Update architecture documentation, implementation plan, and progress tracker.

**Exit criteria:** known limitations are documented, critical workflows pass, and the business can recover from a failed deployment or data issue using the documented procedure.

---

## 5. Future phases — only when the business asks for them

### Future Phase A — Customer ordering portal (optional)

This is not part of current Phase 2. Consider it only if staff-entered orders become inefficient and the business wants customers to submit their own orders.

Potential work: customer accounts, secure customer-to-customer data isolation, product availability/pricing rules, order submission, staff review, order status visibility, and order-to-delivery integration. This requires a separate requirements and security review; it is not simply adding a login screen.

### Future Phase B — Mobile access (optional)

Do not build a mobile app merely because the backend can support one. First identify the users and tasks that require mobility (for example, delivery confirmation or proof of delivery), device/connectivity conditions, offline behavior, and maintenance cost. A responsive web experience may be enough initially.

### Future Phase C — Business growth

Only when operational needs justify it, evaluate:
- Multiple warehouses or branches with per-location stock.
- More advanced analytics and demand forecasting.
- Notifications and delivery tracking.
- Integrations with accounting or other business systems.
- Additional controls for larger teams.

Multi-warehouse inventory is a significant data and workflow change; design it from real requirements rather than preemptively complicating the current single-location workflow.

### Future Phase D — Accounting and regulatory reporting

Identify the specific reports and document requirements with the business and its accountant/adviser. Preserve accurate source data and traceability. Do not assume an internal delivery receipt is a tax invoice or official receipt, and do not promise regulatory compliance based only on a dashboard or printed document.

---

## 6. Recommended priority summary

1. Safety checkpoint and regression baseline.
2. Inventory adjustment controls and stock-integrity review.
3. Supplier records.
4. Purchase receiving / stock-in.
5. Order and delivery lifecycle review.
6. Customer returns.
7. Delivery receipt generation/printing.
8. Audit logs.
9. Improved reports and dashboard.
10. Permission hardening and final regression/release readiness.

This order prioritizes inventory integrity and traceability. It may change if the business identifies an urgent operational need, but database or inventory-affecting changes should not skip requirement definition and tests.

---

## 7. Development principles

1. **Protect the working system.** Prefer small, reviewable changes over rewrites.
2. **Build business workflows, not just CRUD screens.** Define what happens to records and stock across the full process.
3. **Keep inventory authoritative and transactional.** Every stock-changing workflow must have a clear source, reason, and movement history.
4. **Separate users from customers and suppliers.** Business records do not require login accounts.
5. **Use the repository's actual architecture.** Follow existing feature boundaries and conventions; don't force an old sample folder tree onto the codebase.
6. **Test before frontend polish.** Verify API behavior and data integrity before wiring up UI flows.
7. **Use evidence in the tracker.** Mark a step complete only when its stated acceptance criteria have been tested; distinguish manual smoke tests from automated and full regression tests.
8. **Avoid premature scope.** Customer accounts, mobile apps, multi-warehouse support, complex approvals, and accounting integrations are future decisions.
9. **Document unresolved decisions.** Do not silently invent business rules for statuses, returns, receipt numbering, pricing, or accounting.
10. **Keep plans synchronized.** When priorities change, update this roadmap, the Phase 2 implementation plan, and the progress tracker together.

## 8. Working handoff for future development sessions

We are continuing BDMS on the Phase 2 Operations Upgrade. The current system is staff-operated: staff enter customer orders and manage deliveries; bakery customers and suppliers are business records, not login accounts. Do not implement customer ordering accounts, an online portal, or a mobile app unless explicitly requested.

Before coding, inspect the current branch and working tree, read `ARCHITECTURE.md`, `client/src/plan/phase2/implementationPlan.md`, and `client/src/plan/phase2/progress-tracker.md`, then inspect the relevant source files. Explain the business reason first, then design, backend, API testing, frontend integration, and regression checks. Preserve working Phase 1 behavior, centralize stock changes, use safe transactions, and update the tracker with tested evidence.
