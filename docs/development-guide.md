# BDMS Project Development Guide

## 1. Project direction

BDMS is an ongoing Bakery Distribution Management System for a bakery-ingredient distribution business. Development is organized around individual features, business workflows, defects, improvements, and verification—not rigid phase-completion gates.

A feature that is usable today may still need refinement, security review, testing, or integration work later. Work can move between features when business priorities require it. Preserve stable workflows and make changes incrementally.

## 2. Architecture principles

- The frontend uses a **pages-based structure**: route-level screens live in `client/src/pages/`; shared UI belongs in `components/`, layouts in `layouts/`, API calls in `services/`, and shared helpers in `lib/`.
- The backend uses a **feature-oriented structure**: business modules live in `server/src/features/<feature>/`. Use only the layers a feature needs; do not create empty files to satisfy a template.
- Frontend and backend folder structures do not need to mirror each other. They serve different responsibilities.
- Keep API communication on the existing native-fetch helper. Do not add Axios or duplicate token/header handling without an explicit decision.
- Business rules, authorization, stock calculations, and state transitions belong on the backend—not only in the UI.
- Keep database schema changes in Prisma schema/migrations and regenerate the Prisma client through the established project workflow.
- Keep secrets in ignored environment files. Never commit passwords, JWT secrets, database credentials, tokens, or real customer-sensitive data.

See the repository-root `ARCHITECTURE.md` for the technical reference and folder map.

## 3. Feature-based workflow

For each requested feature or improvement:

1. **Clarify the outcome.** Explain the business problem and expected behavior in plain language.
2. **Inspect before editing.** Check the current branch and working tree, then read the relevant frontend page/service/types, backend routes/controller/service/repository/validation, Prisma schema, and related tests/docs.
3. **Confirm business rules.** Identify permissions, status transitions, quantity rules, edge cases, and data-integrity effects. Ask before deciding unresolved business behavior.
4. **Plan the smallest safe change.** State which files and layers need changes and which should remain untouched.
5. **Implement incrementally.** Avoid unrelated refactors and preserve existing conventions.
6. **Verify the feature.** Run relevant tests, API checks, frontend/backend builds and lint commands as applicable. Test error paths and regression-sensitive workflows.
7. **Review the diff.** Check for accidental changes, generated files, secrets, and unrelated formatting.
8. **Document evidence.** Update `feature-status.md`, the relevant feature note, and `development-log.md` when appropriate.
9. **Commit and push when the user is ready.** Do not assume local changes are committed or that the local working tree is clean.

Use descriptive feature/fix/docs branch names without phase prefixes. Confirm the intended base/integration branch before branching or merging; do not assume old phase-specific branching instructions remain active.

Do not mark a feature as verified solely because it compiles. Record exactly what was tested and what remains unverified.

## 4. Feature status vocabulary

Use these labels consistently in `feature-status.md`:

- **Working — needs ongoing verification:** usable behavior is present, but this is not a claim of complete release testing.
- **In progress:** active implementation or integration work is underway.
- **Needs improvement:** the feature exists but has known gaps or planned refinements.
- **Needs verification:** code or historical evidence exists, but current end-to-end behavior has not been freshly confirmed.
- **Planned:** not yet implemented or not yet started.
- **Blocked / decision needed:** work depends on a business or technical decision.

Statuses describe the evidence available at the last review. Recheck the current branch and local changes before relying on them.

## 5. Business rules to preserve

- BDMS is an internal staff system. Bakery customers are business records, not login accounts.
- There is one Admin account. The Admin can create and deactivate staff; inactive staff must not log in. Do not add multi-admin/last-admin/self-deactivation complexity unless requirements change.
- Products and Inventory are separate concepts.
- Operational product quantities are whole numbers. Validate this consistently at API and database boundaries where applicable.
- Creating or confirming an order does not deduct inventory.
- Completing a delivery is the stock-deduction point in the documented workflow. Inventory changes and matching stock movements must be atomic and protected against duplicate completion.
- Sales are derived from completed deliveries in the current design. Do not create a second manual sales-entry workflow without explicit approval.
- Reports draw from Sales, Products, Inventory, Stock Movements, Customers, and Deliveries.
- Delivery Receipt generation/printing was previously deferred. Reconfirm business requirements before starting it.

These rules are project decisions, not a substitute for inspecting the current implementation before changing it.

## 6. Documentation map

- Repository-root `README.md` — repository entry point and links to the main guides.
- Repository-root `ARCHITECTURE.md` — technical architecture, folder map, request flow, and application boundaries.
- `feature-status.md` — evidence-based feature status and verification gaps.
- `backlog.md` — proposed work, priorities, and unresolved business decisions.
- `development-log.md` — dated decisions, implementation notes, commits, and verification evidence.
- `local-development.md` — native development, Docker Compose, ports, environment configuration, and database safety.
- `frontend-design-guidelines.md` — approved frontend visual, responsive, and interaction conventions.
- `workflows/` — durable descriptions of important business workflows, including order-to-delivery and inventory/stock.
- `features/` — focused feature notes when a feature needs durable requirements or implementation decisions.
- `prompts/` — reusable prompts for feature work and repository maintenance.
- `archive/` — historical planning context only; never use archived phase labels or branch instructions as current guidance.

The project no longer uses Phase 1, Phase 2, or numbered phase-completion gates. Choose work by business priority, defects, feature gaps, and verification needs. Use feature-oriented branch names such as `feature/suppliers`, `fix/customer-route-security`, or `docs/development-guide`. Inspect the current branch strategy before choosing a base branch.

## 7. Updating documentation

Update documentation when a business rule, API contract, architecture boundary, feature status, Docker workflow, or verification result materially changes. Prefer concise, evidence-based notes. Distinguish current facts from historical observations and proposed future work.
