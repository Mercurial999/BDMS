# BDMS Phase 2 Progress Tracker

**Current branch:** `phase-2-development`  
**Overall status:** IN PROGRESS — Step 0 baseline preparation  
**Last updated:** 2026-10-20  
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
| 0 | Phase 1 baseline and safety checkpoint | IN PROGRESS | Working tree/branch verified, backup and restore path checked, builds and core regression results recorded |
| 1 | Product → Inventory → existing Stock-In workflow review | NOT STARTED | Actual API and UI behavior verified; safe existing stock-in path documented; frontend-only unless a backend gap is separately approved |
| 2 | Suppliers master data | NOT STARTED | Supplier CRUD/deactivation, validation, authorization, UI and tests verified |
| 3 | Purchase Receiving / Stock-In | NOT STARTED | Receipt posts stock exactly once with matching stock movements in one transaction |
| 4 | Stock Adjustments | NOT STARTED | Adjustment rules approved; stock and ledger remain consistent; authorization and tests pass |
| 5 | Customer Returns | NOT STARTED | Returns link to completed deliveries; quantities are bounded; only approved resellable items are restocked |
| 6 | Audit Logs | NOT STARTED | Critical actions are traceable without logging secrets; access and integrity are tested |
| 7 | Phase 2 Reports and reconciliation | NOT STARTED | New reports reconcile to source transactions and existing Phase 1 reports remain compatible |
| 8 | Delivery status changes (conditional) | NOT STARTED — DECISION REQUIRED | Only undertaken if the business confirms the current statuses are insufficient |
| 9 | Permission hardening (cross-cutting) | NOT STARTED | Every new write endpoint and sensitive report has backend authorization and 401/403/success tests |
| 10 | Final Phase 2 regression and release review | NOT STARTED | Builds, tests, migration review, backup/restore check, Docker smoke tests, and release notes recorded |

## Step 0 — Phase 1 baseline and safety checkpoint

**Status: IN PROGRESS**

### Preparation checklist
- [ ] Confirm local branch is `phase-2-development`.
- [ ] Check `git status --short`; protect all uncommitted work (do not discard changes).
- [ ] Fetch/pull the latest `phase-2-development` documentation and verify this tracker is present locally.
- [ ] Record the baseline commit SHA.
- [ ] Confirm the intended Phase 2 development database is separate from the Phase 1 database.
- [ ] Create a database backup and confirm a safe restore procedure to a separate test database. Do not reset the working database.
- [ ] Check Prisma migration status without applying/resetting migrations.
- [ ] Run backend build.
- [ ] Run frontend lint and build.
- [ ] Record the result of the login, products, inventory, stock movements, customers, orders, deliveries, sales, dashboard and reports checks.
- [ ] Test the order → confirm → draft delivery → complete delivery flow in a safe test database.
- [ ] Verify insufficient stock and repeated completion do not cause partial or duplicate stock deductions.

### Step 0 results

| Item | Result / evidence |
|---|---|
| Baseline commit | Not recorded yet |
| Backend build | Not run yet |
| Frontend lint/build | Not run yet |
| Migration status | Not checked yet |
| Backup and restore verification | Not checked yet |
| Phase 1 workflow regression | Not run yet |
| Notes / blockers | Awaiting local checks |

**Do not start schema-changing work until the database safety and baseline checks are understood.** If backup/restore or Phase 1 regression cannot be verified, mark the relevant item BLOCKED and resolve it first.

## Initial read-only source inspection (not runtime verification)

The following observations are from reading the repository source on `phase-2-development`. They are **not** proof that the local environment, database, or live API has passed testing.

- [x] Confirmed Product creation does not create an Inventory row automatically.
- [x] Confirmed the backend has an explicit inventory-create endpoint and the Inventory UI has a zero-quantity setup action for active products without inventory.
- [x] Confirmed the Inventory UI sends stock-in through the stock-movement API using `IN / PURCHASE`.
- [!] **Stock integrity risk:** `PUT /api/inventory/:id` accepts a `quantity` field and updates it directly without creating a stock movement. Do not use that endpoint to change physical stock.
- [!] **Stock integrity risk:** the current generic stock-movement service handles `ADJUSTMENT` by setting inventory quantity equal to the movement quantity, rather than applying a documented delta. Do not implement Phase 2 adjustments by blindly reusing this behavior.
- [!] **Validation gap to verify:** the current inventory and stock-movement schemas validate non-negative/positive numbers but do not enforce integer quantities consistently. The business rule remains whole-number quantities; test and address this deliberately in the appropriate approved feature rather than making an unrelated schema change now.
- [ ] Run local builds, migration checks, backup/restore checks, and safe Phase 1 regression tests before marking Step 0 complete.

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

## Change history

| Date | Update |
|---|---|
| 2026-10-20 | Initial tracker created. Step 0 is in progress; no implementation task is marked complete. |
