> **ARCHIVED — 2026-11-07.** This is a historical planning document, not an active roadmap, task tracker, or branching instruction. BDMS now uses ongoing feature-based development; Phase 1 / Phase 2 / numbered phase gates are retired. Use `../project-development-guide.md`, `../feature-status.md`, and `../backlog.md` for current direction. The original content below is preserved for historical context only.

---

# BDMS Phase 2 Backlog Tracker

**Current active phase:** Phase 1 — ACTIVE / IN DEVELOPMENT  
**Phase 2 status:** DEFERRED — NOT ACTIVE  
**Last updated:** 2026-11-05  
**Repository branch reviewed:** `feature/phase-2-suppliers` at `18849b2e5452404468d90d421680839c139e9414`

> This tracker preserves future Phase 2 scope. It is not the active task list. Phase 1 is still being developed; a working application or a completed individual check does not declare Phase 1 complete. Do not begin Phase 2 work unless the user explicitly reactivates it.

## 1. Status key

- **DEFERRED** — retained for future work; do not start now.
- **NOT STARTED** — no implementation work is evidenced.
- **IN PROGRESS** — use only after Phase 2 has been explicitly reactivated.
- **BLOCKED** — waiting for a business decision or prerequisite after reactivation.
- **VERIFIED FOR SCOPE** — acceptance criteria for the explicitly defined feature scope passed; this does not declare all of BDMS or Phase 1 complete.

Do not use a Phase 2 status to describe Phase 1 progress. Track active Phase 1 work in the main roadmap or a dedicated Phase 1 task record.

## 2. Phase 2 backlog overview

| Backlog item | Status | Future acceptance condition |
|---|---|---|
| Suppliers master data | DEFERRED / NOT STARTED | Supplier CRUD/deactivation, validation, backend authorization, UI, and tests verified |
| Purchase receiving / Stock-In | DEFERRED / NOT STARTED | Receipt posts stock exactly once and creates matching movements in one transaction |
| Inventory controls and stock adjustments | DEFERRED / NOT STARTED | Adjustment rules approved; inventory and ledger remain consistent; authorization and tests pass |
| Delivery status improvements | DEFERRED / CONDITIONAL | Business confirms additional statuses are needed; transitions and stock timing are tested |
| Customer returns | DEFERRED / NOT STARTED | Returns link to completed deliveries; quantities are bounded; only approved resellable goods are restocked |
| Delivery Receipt generation/printing | DEFERRED / NOT STARTED | Actual delivered quantities, numbering, layout, historical behavior, and non-mutating print behavior verified |
| Audit logs | DEFERRED / NOT STARTED | Critical actions are traceable without logging secrets; access/integrity are tested |
| Reports and reconciliation upgrades | DEFERRED / NOT STARTED | New report values reconcile to source transactions and movements; existing reports remain compatible |
| Permission hardening for new Phase 2 actions | DEFERRED / NOT STARTED | Backend authorization and 401/403/success tests pass for each new endpoint/report |

## 3. Historical review evidence (not Phase 1 completion)

### Step 0 — Source/planning baseline review

**Historical status:** COMPLETE FOR REVIEW SCOPE ONLY (2026-10-27)

This checkpoint recorded a source/planning review. It did not prove:
- Backend build passed.
- Current frontend lint/build passed as a complete release check.
- Migration status is correct.
- Backup and restore were verified.
- Full Phase 1 regression passed.
- Order-to-delivery duplicate/insufficient-stock tests passed.

These checks remain relevant to active Phase 1 development and operational safety. Do not interpret the historical Step 0 status as permission to begin Phase 2.

### Step 1 — Product → Inventory → existing Stock-In focused manual check

**Historical status:** VERIFIED FOR THE DOCUMENTED MANUAL CHECK ONLY (2026-10-22)

Recorded evidence:
- Created test product `Phase 2 Test Flour`.
- Confirmed it appeared in the inventory setup list.
- Initialized its Inventory record at quantity `0`.
- Added `5` units using reference `PHASE2-TEST`.
- Confirmed inventory quantity became `5`.
- Confirmed a corresponding `IN / PURCHASE` stock movement was recorded.
- Frontend production build passed with `npm run build`.

Limitations:
- This was a focused manual UI check, not a full Phase 1 regression.
- Backup/restore and complete authorization/error-path tests were not verified.
- Full order-to-delivery regression was not run.
- The direct inventory quantity-update path and ambiguous ADJUSTMENT semantics were recorded as risks in the reviewed source snapshot.

This historical check remains useful evidence, but it does not complete Phase 1 and does not activate Phase 2.

## 4. Known technical risks to recheck before future stock-changing features

The following observations were recorded during the earlier source inspection. Recheck them against the latest code before relying on them:

- **Direct inventory update:** the reviewed `PUT /api/inventory/:id` accepted a quantity field and updated it directly without a matching stock movement. Do not use it for physical stock changes unless redesigned and verified.
- **ADJUSTMENT semantics:** the reviewed generic stock movement service set inventory quantity equal to the movement quantity instead of applying a documented delta. Do not build adjustment behavior on it without re-review.
- **Integer validation:** the reviewed inventory and stock-movement schemas did not consistently enforce whole-number quantities, although that is the business rule.
- **Customer route protection:** the reviewed Customer routes did not show the same authentication/permission middleware as Inventory routes. This belongs in active Phase 1 security review.
- **Orders UI integration:** the backend Orders feature exists, but the inspected frontend route list did not include an Orders page. Treat this as a Phase 1 integration concern.
- **Release verification:** full build/lint/regression, migration status, and verified backup/restore were not evidenced in the earlier review.

These are observations from a repository snapshot, not guaranteed descriptions of the latest local working tree. Inspect current code before changing anything.

## 5. Future Phase 2 safety checklist

Only use this checklist after the user explicitly reactivates Phase 2:

- [ ] Confirm the selected feature and business rules.
- [ ] Inspect current implementation and API contracts.
- [ ] Confirm a verified backup and separate test database.
- [ ] Review schema/migration and generated SQL.
- [ ] Define backend validation, authorization, transaction, and rollback behavior.
- [ ] Test success, invalid input, unauthorized/forbidden, duplicate/retry, and concurrency cases where relevant.
- [ ] Verify inventory and stock movement reconciliation for stock-changing work.
- [ ] Verify existing Phase 1 workflows still work.
- [ ] Run relevant backend/frontend build and lint checks.
- [ ] Review the diff; exclude secrets and unrelated/generated changes.
- [ ] Record commit/PR and exact test evidence.
- [ ] Update this tracker and the implementation plan in the same documentation change.

## 6. Open business decisions for future Phase 2 work

| Feature | Decision needed | Status |
|---|---|---|
| Inventory initialization | Should every active Product automatically receive an Inventory row, or should staff explicitly initialize it? | OPEN |
| Receiving | May a receipt create the initial Inventory record? | OPEN |
| Receiving | Is purchase unit cost required, and what is it used for? | OPEN |
| Supplier | Is a supplier-product relationship required, or is selecting a supplier per receipt enough? | OPEN |
| Adjustments | Counted/target quantity or delta input? Which roles may create/approve? | OPEN |
| Returns | Which item conditions can be restocked? | OPEN |
| Reports | How should returns be represented alongside gross sales and net sales? | OPEN |
| Delivery statuses | Are current DRAFT/COMPLETED/CANCELLED statuses insufficient for the real workflow? | OPEN |
| Permissions | Which roles may receive stock, adjust inventory, accept returns, and read audit logs? | OPEN |
| Delivery Receipt | Paper layout, numbering, copies, snapshot/reprint behavior, and required fields? | OPEN |

## 7. Change history

| Date | Update |
|---|---|
| 2026-10-20 | Initial Phase 2 tracker created. |
| 2026-10-22 | Recorded the focused manual Product → Inventory → Stock-In check and frontend build result. |
| 2026-10-23 | Added Delivery Receipt generation/printing to the future scope; detailed requirements remain open. |
| 2026-10-27 | Recorded source/planning review closure for that limited review scope; runtime, migration, backup/restore, and full regression remained unverified. |
| 2026-11-05 | Reclassified Phase 2 as DEFERRED / NOT ACTIVE. Phase 1 remains ACTIVE / IN DEVELOPMENT. Preserved all Phase 2 feature areas as future backlog and clarified that historical review checkpoints do not complete Phase 1. |

---

**Reminder:** Phase 2 remains inactive until the user explicitly asks to begin it. The current development task must continue to come from Phase 1.
