# BDMS Phase 2 Progress Tracker

**Current branch:** `phase-2-development`  
**Overall status:** IN PROGRESS — Step 0 baseline/source review complete; Step 1 focused workflow verification complete  
**Last updated:** 2026-10-27  
**Rule:** Mark a task COMPLETE only after its acceptance criteria and relevant tests have passed. A code change or successful build alone does not complete a feature.

## Status key

- [ ] **NOT STARTED** — work has not begun.
- [~] **IN PROGRESS** — currently being investigated or implemented.
- [!] **BLOCKED** — waiting for a business decision, environment fix, or prerequisite.
- [x] **COMPLETE** — acceptance criteria verified; evidence/results recorded below.

When a step is completed, update this file and the relevant feature plan in the same documentation commit. Record the date, commit/PR, tests run, and any known limitations. Do not mark a step complete based on memory alone.

## Overall roadmap

| Step | Work item | Status | Completion condition |
|---|---|---|---|
| 0 | Phase 1 baseline review and safety boundaries | COMPLETE — REVIEW SCOPE ONLY | Source/planning baseline and known risks documented; outstanding runtime, backup/restore, build and regression checks remain required under Step 11 and each feature's verification gate |
| 1 | Product → Inventory → existing Stock-In workflow review | COMPLETE | Actual API and UI behavior verified; safe existing stock-in path documented; frontend-only unless a backend gap is separately approved |
| 2 | Suppliers master data | NOT STARTED | Supplier CRUD/deactivation, validation, authorization, UI and tests verified |
| 3 | Purchase receiving / Stock-In | NOT STARTED | Receiving posts stock exactly once, with matching stock movements in one transaction |
| 4 | Inventory controls and stock adjustments | NOT STARTED | Adjustment rules approved; stock and ledger remain consistent; authorization and tests pass |
| 5 | Delivery and order workflow review | NOT STARTED | Existing workflows inspected; any delivery-status change requires a documented business decision before implementation |
| 6 | Customer returns | NOT STARTED | Returns link to completed deliveries; quantities are bounded; only approved resellable items are restocked |
| 7 | Delivery Receipt (DR) generation and printing | NOT STARTED | DR uses actual delivery quantities and linked order/customer details; layout and numbering agreed; printing does not mutate stock or status |
| 8 | Audit logs | NOT STARTED | Critical actions are traceable without logging secrets; access and integrity are tested |
| 9 | Reports and operational dashboard | NOT STARTED — INSPECT EXISTING FEATURES FIRST | Existing reports and dashboard are assessed before changes; only confirmed gaps are improved; results reconcile to source transactions |
| 10 | Permission hardening (cross-cutting) | NOT STARTED | Every new write endpoint and sensitive report has backend authorization and 401/403/success tests |
| 11 | Regression and release readiness | NOT STARTED | Builds, tests, migration review, backup/restore check, Docker smoke tests, and release notes recorded |
## Step 0 — Phase 1 baseline review and safety boundaries

**Status: COMPLETE — REVIEW SCOPE ONLY (2026-10-27)**

The user chose to close the planning/source-review checkpoint so independent Phase 2 work can proceed. This does **not** mean that unperformed runtime checks passed. Outstanding build, migration, backup/restore and full regression checks remain mandatory before release. Verify a backup and a separate test database before schema-changing or stock-mutating work is tested.

### Review checklist
- [x] Confirmed the intended branch is `phase-2-development` from the user's local Git output.
- [x] Confirmed the Phase 2 tracker and implementation plan exist under `client/src/plan/phase2/`.
- [x] Reviewed the Phase 2 roadmap and documented the focused Product → Inventory → Stock-In manual workflow as Step 1.
- [x] Documented known stock-integrity risks and the need to avoid unsafe inventory mutation paths.
- [x] Separated source/planning review completion from runtime and release verification.

### Outstanding runtime and release checks — NOT YET VERIFIED

| Item | Result / evidence |
|---|---|
| Baseline commit | `cbfc570` reported by the user on 2026-10-27; recheck locally before the next commit/push |
| Backend build | Not run / not evidenced in this review |
| Frontend lint/build | Focused frontend build passed during Step 1; full current lint/build not evidenced here |
| Migration status | Not checked / not evidenced here |
| Backup and restore verification | Not checked; verify against a separate test database before risky database work |
| Full Phase 1 workflow regression | Not run / not evidenced here |
| Order-to-delivery duplicate/insufficient-stock tests | Not run / not evidenced here |

**Gate for upcoming work:** Supplier master data can proceed independently after inspecting current authorization and data conventions. Do not implement or test schema-changing/stock-mutating features against the only working database; establish and verify a backup plus a separate test database first. Complete all outstanding checks in Step 11 before release.

## Initial read-only source inspection (not runtime verification)

The following observations are from reading the repository source on `phase-2-development`. They are **not** proof that the local environment, database, or live API has passed testing.

- [x] Confirmed Product creation does not create an Inventory row automatically.
- [x] Confirmed the backend has an explicit inventory-create endpoint and the Inventory UI has a zero-quantity setup action for active products without inventory.
- [x] Confirmed the Inventory UI sends stock-in through the stock-movement API using `IN / PURCHASE`.
- [!] **Stock integrity risk:** `PUT /api/inventory/:id` accepts a `quantity` field and updates it directly without creating a stock movement. Do not use that endpoint to change physical stock.
- [!] **Stock integrity risk:** the current generic stock-movement service handles `ADJUSTMENT` by setting inventory quantity equal to the movement quantity, rather than applying a documented delta. Do not implement Phase 2 adjustments by blindly reusing this behavior.
- [!] **Validation gap to verify:** the current inventory and stock-movement schemas validate non-negative/positive numbers but do not enforce integer quantities consistently. The business rule remains whole-number quantities; test and address this deliberately in the appropriate approved feature rather than making an unrelated schema change now.
- **Prerequisite before new stock-changing features:** review and resolve the direct inventory-update and ambiguous adjustment paths, and define the approved server-side stock-mutation approach before implementing purchase receiving. This investigation does not mark the full Step 4 inventory-adjustment feature complete.
- [x] Closed the source/planning review on 2026-10-27; runtime checks remain unverified and are tracked above and under Step 11.

## Per-feature completion checklist

Copy this checklist into the relevant feature section or feature plan:

- [ ] Business rules confirmed; unresolved decisions recorded.
- [ ] Existing implementation and API contracts inspected before changing code.
- [ ] Database/schema/migration reviewed (if applicable); migration is additive and tested against a separate database.
- [ ] Backend validation, service logic, transactions and authorization implemented (if applicable).
- [ ] API tests cover success, validation errors, unauthorized/forbidden access, duplicate/retry behavior and rollback where relevant.
- [ ] Frontend uses the existing API helper and backend as source of truth (if applicable).
- [ ] Relevant frontend/backend builds pass.
- [ ] Phase 1 regression checks pass.
- [ ] Diff reviewed; no secrets, unrelated refactors or generated artifacts included.
- [ ] Feature branch merged into `phase-2-development` only after review/tests.
- [ ] This tracker updated with date, commit/PR and test evidence.

## Step 1 — Product → Inventory → existing Stock-In workflow review

**Status: COMPLETE for the documented manual workflow check; this does not complete Step 0 baseline/regression safety checks.**

### Verified workflow
- [x] Manually created a test product named `Phase 2 Test Flour`.
- [x] Confirmed the product appeared in the inventory setup list.
- [x] Initialized its inventory record at quantity `0`.
- [x] Used the existing stock-in workflow to add `5` units with reference `PHASE2-TEST`.
- [x] Confirmed inventory quantity became `5`.
- [x] Confirmed a corresponding `IN / PURCHASE` stock movement was recorded.
- [x] Frontend production build passed with `npm run build`.

### Limitations and follow-up
- This was a focused manual UI check, not a full Phase 1 regression test.
- Database backup/restore, complete authorization/error-path tests, and end-to-end regression remain unverified.
- The direct inventory quantity-update path and current `ADJUSTMENT` semantics remain known stock-integrity risks; do not rely on them for Phase 2 stock adjustments without a reviewed fix and tests.
- Keep product creation, inventory initialization, and stock-in as separate operations. Use the existing stock-movement workflow to record stock-in.

### Evidence
| Evidence | Result |
|---|---|
| Manual UI workflow | Developer-confirmed on 2026-10-22 |
| Frontend build | Passed `npm run build` |
| Commit/test log | Not recorded |
| Full Phase 1 regression | Not run |
| Backup/restore verification | Not checked |

## Step 7 — Delivery Receipt (DR) generation and printing

**Status: NOT STARTED — requirements/design decisions needed**

This feature is newly added to Phase 2 scope. No code, schema, or runtime work has been performed for it yet.

### Intended workflow
- [ ] Keep the Order as the record of what the customer requested.
- [ ] Generate the DR from the Delivery record, using linked Order and Customer details where available.
- [ ] Display actual delivered quantities from the Delivery items, not the original requested quantities by default.
- [ ] Confirm delivered items/quantities using the existing delivery workflow; preserve the current completion endpoint as the only inventory-deduction point.
- [ ] Ensure previewing/printing a DR does not deduct inventory, create stock movements, or change delivery/order status.
- [ ] Do not introduce customer login accounts as a dependency.

### Requirements to confirm before implementation
- [ ] Paper size and print layout (including whether long-bond paper is required), margins, and number of copies.
- [ ] Required business and customer details, including delivery address/contact fields.
- [ ] DR number format, uniqueness, and when a number is allocated.
- [ ] Whether draft deliveries can be previewed/printed and what happens after completion/cancellation.
- [ ] Whether the DR is rendered from live data or stored as a snapshot so historical reprints remain accurate.
- [ ] How corrections and reprints are identified and audited.
- [ ] Confirm with the business/accountant that the DR is a delivery document and not a substitute for a BIR-compliant sales invoice or official receipt.

### Verification required
- [ ] Order-linked delivery shows the correct customer and order reference.
- [ ] DR line items match actual delivery quantities.
- [ ] Long customer/product names and multiple items print cleanly across pages.
- [ ] Reprints use the agreed numbering/history behavior.
- [ ] Unauthorized users cannot access protected delivery documents.
- [ ] Printing/preview does not change inventory, stock movements, or statuses.
- [ ] Relevant builds and Phase 1 order-to-delivery regression checks pass.

## Decision log

Record decisions here before implementing behavior that depends on them.

| Date | Feature | Decision / question | Outcome | Status |
|---|---|---|---|---|
| 2026-10-20 | Inventory | How are inventory records initialized for new products? | Inspect current code/API first; do not assume | OPEN |
| 2026-10-20 | Receiving | May receiving create a missing inventory record? | Decide after reviewing existing inventory behavior | OPEN |
| 2026-10-20 | Receiving | Is purchase unit cost required in Phase 2? | Confirm with business before adding cost fields | OPEN |
| 2026-10-20 | Adjustments | Counted quantity or delta input; who can adjust/approve? | Confirm before design | OPEN |
| 2026-10-20 | Returns | Which conditions can be restocked? | Confirm before implementation | OPEN |
| 2026-10-20 | Reports | How should returns be represented alongside sales? | Define gross/returns/net reporting before implementation | OPEN |
| 2026-10-20 | Delivery statuses | Are current DRAFT/COMPLETED/CANCELLED statuses insufficient? | Conditional; do not add statuses without business need | OPEN |
| 2026-10-20 | Permissions | Which roles may receive, adjust, accept returns and read audit logs? | Inspect current roles/permissions and confirm matrix | OPEN |
| 2026-10-23 | Delivery Receipt | What paper layout, required fields, numbering timing, and historical reprint behavior are required? | Add DR generation/printing to Phase 2; confirm detailed rules with the business before implementation. DR must reflect actual delivered quantities and must not alter stock when printed. | OPEN |

## Change history

| Date | Update |
|---|---|
| 2026-10-20 | Initial tracker created. Step 0 is in progress; no implementation task is marked complete. |
| 2026-10-23 | Added Delivery Receipt generation/printing as Phase 2 Step 9; implementation remains not started pending layout, numbering, and document-history decisions. |
| 2026-10-24 | Recorded the focused manual Product → Inventory → Stock-In verification and frontend build result as Step 1 COMPLETE. |
| 2026-10-27 | Closed Step 0 as baseline/source-review complete at the user's direction. Outstanding runtime, migration, backup/restore and full regression checks remain unverified; no results were fabricated. |
