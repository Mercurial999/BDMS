# Bakery Distribution Management System (BDMS)
## Development Roadmap — Phase 1 Active Development, Future Backlog

**Current development phase:** PHASE 1 — ACTIVE / IN DEVELOPMENT  
**Phase 2 status:** DEFERRED — FUTURE BACKLOG ONLY  
**Roadmap policy:** Phase 1 remains active while the system is being developed, improved, corrected, and verified. A working feature does not mean the whole phase or system is complete. Phase 2 does not start automatically.

---

## 1. Project direction

BDMS is an internal bakery distribution management system for managing staff, products, inventory, customers, orders, deliveries, sales, and operational reports.

The system is being developed incrementally. We will continue working on Phase 1 even when some modules are already usable. We may revisit a module when testing, business feedback, integration work, or a newly discovered issue requires it.

**Important:** Do not mark Phase 1 complete merely because the application runs or the main screens are usable. Do not move the project into Phase 2 just because a feature works. The user decides when the project is ready to begin Phase 2.

## 2. Important business decisions

### 2.1 Customers are business records, not system users

Bakery stores are represented by **Customers** in BDMS. They do not have login accounts in the current internal system.

- Staff members are the people who log in and operate BDMS.
- Customers represent bakeries/businesses that place orders and receive deliveries.
- Customer login, customer roles, and a customer portal are not part of the current Phase 1 scope.

### 2.2 Product and Inventory are separate

- Product stores product information such as name, unit, price, description, and status.
- Inventory stores current quantity and minimum-stock information.
- Creating a product must not silently invent opening stock or a purchase.
- Physical stock changes must use an approved backend operation and must be traceable through stock movements.

### 2.3 Operational quantities

The business rule is to use positive whole-number quantities for operational product/order/delivery quantities. Partial sacks or units such as 0.5 are not supported. Existing database fields and validation must be checked and aligned carefully; do not assume every current inventory field already enforces this rule.

### 2.4 Order, Delivery, Inventory, and Sales responsibilities

The intended workflow is:

```text
Staff login
  -> Customer and product selection
  -> Order
  -> Confirmed order
  -> Draft delivery
  -> Complete delivery
  -> Inventory deduction
  -> OUT / SALE stock movement
  -> Sales and reports reflect completed delivery
```

Important rules:
- Creating or confirming an order does not deduct inventory.
- Delivery completion is the stock-out point in the documented workflow.
- Inventory deduction and the corresponding stock movement must be handled by the backend transaction.
- The frontend must not separately deduct inventory or create a duplicate stock movement.
- Sales are derived from completed deliveries in the current design; do not introduce a second sales-entry process without an approved business reason.

---

## 3. Phase 1 — Active internal system development

<badge>ACTIVE — IN DEVELOPMENT</badge>

**Goal:** Continue building and improving the internal BDMS workflows until the user decides that it is appropriate to begin the future Phase 2 backlog.

Phase 1 is not being declared complete in this document. It is the current working phase and may include repeated improvements to existing modules.

### 3.1 Phase 1 modules and current source-level observations

The following statuses describe what was found in the reviewed repository source. They are not claims that the modules have passed complete runtime, business, security, or regression testing.

| Area | Repository evidence | Planning status |
|---|---|---|
| Authentication | Login/auth routes and protected frontend routes exist | Implemented; continue verification |
| Users and Roles | User and role pages, backend features, and permission middleware exist | Implemented; continue verification |
| Products | Product page and backend feature exist | Implemented; continue verification |
| Inventory | Inventory page, backend feature, and inventory schema exist | Working; known integrity/validation issues need review |
| Stock Movements | Frontend/backend support and movement history exist | Working; verify all stock-change paths |
| Customers | Customer page and backend feature exist | Implemented; continue authorization and workflow review |
| Orders | Backend Orders feature and documented API workflow exist; current frontend route list does not include an Orders page | Backend exists; frontend workflow/integration remains to be addressed |
| Deliveries | Delivery page, backend feature, and completion workflow exist | Working; continue end-to-end and failure-path testing |
| Sales | Sales page and backend summary endpoint exist; current design derives sales from completed deliveries | Implemented; verify calculations and reconciliation |
| Dashboard | Dashboard page and backend endpoint exist | Implemented; verify displayed values against source records |
| Reports | Reports page and backend endpoints exist for sales, products, customers, inventory, stock movements, and deliveries | Implemented; continue reconciliation and export testing |
| Docker / local operations | Docker Compose configuration exists | Continue environment, migration, backup, and restore checks |

### 3.2 Active Phase 1 development work

Work should be selected based on the actual issue or improvement being handled. The following are known areas to keep visible:

1. **Orders frontend workflow**
   - Review the existing backend Orders API and the current Deliveries page.
   - Decide how staff should create, review, confirm, and track orders in the UI.
   - Do not duplicate order creation inside multiple screens without a clear workflow.
   - Keep the documented rule that stock is deducted only when the delivery is completed.

2. **Inventory integrity**
   - Review the direct inventory update endpoint that can change quantity without a corresponding movement.
   - Review the current generic ADJUSTMENT movement semantics before relying on them.
   - Enforce whole-number operational quantities consistently where required.
   - Ensure every physical stock change has a clear reason/reference and a matching ledger entry.
   - Preserve transaction safety and prevent duplicate stock deductions.

3. **Authentication, authorization, and access**
   - Verify protected routes and permissions on the backend, not only frontend visibility.
   - Review customer and other route protection consistently.
   - Verify inactive users cannot log in and that role/permission behavior matches the intended business rules.

4. **Delivery and order workflow**
   - Test order creation, confirmation, delivery creation, and delivery completion.
   - Test insufficient stock, duplicate requests, repeated completion, invalid input, and transaction rollback.
   - Confirm that related order/delivery statuses, inventory, and stock movements remain consistent.

5. **Sales, dashboard, and reports**
   - Reconcile totals to completed delivery records and their items.
   - Verify date filters, customer/product groupings, inventory reports, and stock movement reports.
   - Test CSV/PDF/print behavior where provided.
   - Do not assume that a displayed report is correct solely because it loads.

6. **General quality and operations**
   - Run relevant frontend/backend builds and lint checks.
   - Review API validation and error handling.
   - Verify migrations against a separate test database.
   - Verify backup and restore without risking the working database.
   - Test Docker startup and service connectivity.
   - Keep documentation aligned with the code and record evidence for important checks.

### 3.3 How to record progress in Phase 1

Use statuses that distinguish implementation from verification:

- **NOT STARTED** — work has not begun.
- **IN PROGRESS** — currently being investigated or implemented.
- **WORKING — VERIFICATION PENDING** — the feature can be used, but relevant tests or edge cases remain.
- **PARTIALLY VERIFIED** — some stated scenarios passed; remaining scenarios are listed.
- **BLOCKED** — waiting for a decision, dependency, or environment fix.
- **VERIFIED FOR SCOPE** — the defined scope and tests passed; this does not declare all of Phase 1 complete.

A feature can move between these statuses as new issues or requirements are discovered. Do not use a feature's status to declare the entire Phase 1 complete.

### 3.4 Phase 1 development rules

1. Keep working on Phase 1 whenever existing workflows need improvement.
2. Do not begin Phase 2 merely because Phase 1 modules are usable.
3. Do not label a module complete without recording what was tested.
4. Inspect the existing implementation before changing it.
5. Preserve working business workflows and avoid unrelated refactoring.
6. Keep inventory as the source of truth for available stock.
7. Put validation, permissions, and business rules on the backend.
8. Use the existing architecture and API helper; do not introduce unnecessary dependencies.
9. Update the relevant plan/tracker when scope or evidence changes.
10. Explain the business reason and inspect first; implement one focused task at a time.

---

## 4. Phase 2 — Operations upgrade (future backlog)

<badge color="warning">DEFERRED — NOT ACTIVE</badge>

**Purpose:** Retain future operational improvements without treating them as current development tasks.

Nothing in this section is authorized to begin just because it appears in the backlog. Before starting Phase 2, the user must explicitly decide that the project is ready to move beyond the current Phase 1 development cycle.

### 4.1 Suppliers

- Supplier records and contact information.
- Supplier status (active/inactive).
- Optional supplier-product relationships, if the business needs them.
- Supplier maintenance must not directly change inventory.

### 4.2 Purchase Receiving / Stock-In

- Record supplier, reference, received date, products, and quantities.
- Post received quantities to inventory through a controlled backend transaction.
- Create matching IN / PURCHASE stock movements.
- Prevent duplicate or concurrent posting.
- Decide whether unit cost and supplier-linked product lists are required.

### 4.3 Stock Adjustments

- Record stock discrepancies such as damage, expiry, counting errors, or missing stock.
- Require a reason, actor, and reference.
- Define whether users enter a counted quantity or a delta.
- Preserve stock ledger consistency and enforce permissions.

### 4.4 Customer Returns

- Link returns to the original completed delivery.
- Track returned quantities, reasons, and item condition.
- Only approved resellable items may increase sellable inventory.
- Keep original delivery and stock-out history intact.
- Define how returns affect sales reports.

### 4.5 Delivery Status improvements

- Consider additional statuses only if the actual business workflow requires them.
- Define allowed transitions and the exact point at which stock changes.
- Do not add statuses only for the sake of having more statuses.

### 4.6 Audit Logs

- Record important actions such as supplier changes, receiving, adjustments, returns, delivery completion, and permission changes.
- Record actor, action, entity, timestamp, and safe reference metadata.
- Never log passwords, tokens, or other secrets.

### 4.7 Improved Reports

- Supplier receiving history.
- Stock-in reports.
- Adjustment reports.
- Returns reports.
- Stock reconciliation.
- Audit history with restricted access.
- Additional operational summaries after source-data rules are defined.

### 4.8 Delivery Receipt (DR) generation and printing

- Generate the document from the actual Delivery record.
- Use actual delivered quantities, not merely the originally ordered quantities.
- Confirm paper size/layout, numbering, copies, and historical reprint behavior with the business.
- Previewing or printing must not change inventory, stock movements, or delivery status.
- Do not represent a DR as a BIR-compliant sales invoice or official receipt without confirmation from the business's accountant.

### 4.9 Stronger permissions

- Review role/permission matrix for new operational actions.
- Enforce authorization in backend routes.
- Test unauthorized, forbidden, and authorized requests.
- Do not rely on hiding frontend buttons as security.

**Phase 2 safety note:** Before any schema-changing or stock-mutating Phase 2 feature, inspect the current implementation, confirm business rules, verify backup/restore to a separate test database, and test migrations and stock behavior without risking the working database.

---

## 5. Phase 3 — Customer ordering (longer-term)

Only consider this after the internal staff workflow is stable and the user explicitly prioritizes customer-facing ordering.

Potential features:
- Customer accounts and login.
- Customer portal/dashboard.
- Online order submission.
- Customer order history and status.
- Staff review and approval.
- Order-to-delivery integration.

Customer accounts are not part of the current internal Phase 1 system.

## 6. Phase 4 — Business scale (longer-term)

Potential future capabilities:
- Advanced management analytics.
- More detailed operational and BIR-oriented reports based on actual business/accounting requirements.
- Multiple warehouses or distribution locations.
- Advanced inventory planning and product-demand analysis.

Do not guess BIR requirements or build multi-warehouse support before the business needs it.

## 7. Phase 5 — Multi-platform system (long-term vision)

Potential future platforms:
- Staff web portal.
- Customer web portal.
- Delivery staff mobile app.
- Delivery tracking and notifications.
- Mobile workflows where there is a real operational need.

This is a long-term direction, not a current implementation commitment.

---

## 8. Current development direction

The current direction is deliberately simple:

```text
PHASE 1 — ACTIVE / IN DEVELOPMENT
  -> Continue improving existing modules
  -> Complete missing UI/backend integration
  -> Fix data-integrity and authorization gaps
  -> Test end-to-end business workflows
  -> Reconcile sales, dashboard, and reports
  -> Improve deployment and operational safety

PHASE 2 — DEFERRED BACKLOG
  -> Do not start until the user explicitly decides to move forward
```

There is no automatic Phase 1 completion date or automatic Phase 2 start. The roadmap is allowed to remain in Phase 1 for as long as the system needs development.

## 9. Handoff instruction for future work

When continuing BDMS work, use this direction:

"We are continuing the Bakery Distribution Management System (BDMS). Phase 1 is still ACTIVE / IN DEVELOPMENT. The system is already working in some areas, but it is not declared complete. Do not move to Phase 2 or implement Phase 2 backlog features unless I explicitly ask to begin them. First inspect the current repository, identify the specific Phase 1 task, review existing architecture and code, and guide me step by step. Distinguish working features from features that are verified for a defined scope. Preserve existing workflows, avoid unrelated changes, and update the relevant plan/tracker with evidence."

---

**Roadmap maintenance rule:** Update this document when business decisions or actual implementation status change. Never rewrite the status to "Phase 1 complete" simply to advance the phase number.
