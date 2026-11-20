# BDMS Repository Architecture

**Repository:** `Mercurial999/BDMS`
**Source baseline:** `origin/main` at commit `f239ed9`
**Reviewed:** 2026-11-19
**Purpose:** A durable reference for the repository layout, application boundaries, request flow, data model, and safe development conventions. Update this document when the architecture materially changes.

> **Scope note:** This document describes the repository state at `origin/main` commit `f239ed9`, based on source files inspected during the documentation audit on 2026-11-19. It does not describe uncommitted changes or work on separate feature branches. Re-check the source when `main` changes.

## 1. System overview

BDMS is a web-based Bakery Distribution Management System with a React/TypeScript client, an Express/TypeScript API, and PostgreSQL persistence through Prisma.

| Layer | Technology / responsibility |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS v4 |
| HTTP communication | Native `fetch` through the shared `client/src/lib/api.ts` helper |
| Backend | Node.js, Express 5, TypeScript, ES modules |
| Validation | Zod schemas applied by Express validation middleware |
| Authentication | JWT bearer tokens, password verification with bcrypt, active-account checks |
| Authorization | Role/permission data in PostgreSQL; middleware is applied to selected feature routes, not all API groups |
| Database | PostgreSQL with Prisma ORM and the PostgreSQL adapter |
| Deployment/development | Docker/Compose configuration at the repository root and service-specific Dockerfiles |

The backend's HTTP entry point is `server/src/index.ts`, which imports `server/src/app.ts` and listens on `PORT` (default `5000`) on `0.0.0.0`.

## 2. Repository layout

### Root

- `client/` — frontend application.
- `server/` — API, database schema/migrations, seed logic, and generated Prisma client/build output.
- Root-level Docker Compose and environment/configuration files — local multi-service runtime configuration. Keep secrets in ignored environment files; never commit credentials.

### Frontend: `client/`

- `src/main.tsx` — React root; imports global CSS and wraps the app in `AuthProvider`.
- `src/App.tsx` — small app entry component that renders `AppRoutes`.
- `src/routes/` — route definitions and page routing (including `AppRoutes`).
- `src/pages/` — route-level screens.
- `src/components/` — reusable UI and domain components.
- `src/layouts/` — shared page/layout shells.
- `src/context/` — React contexts/providers, including authentication state.
- `src/services/` — domain-specific API calls, such as authentication and feature services.
- `src/lib/` — shared helpers. `src/lib/api.ts` defines `apiRequest<T>()`; it reads `VITE_API_URL`, adds JSON headers and a bearer token when present, parses the JSON response, and throws an error for non-2xx responses.
- `src/types/` — shared TypeScript types.
- `src/assets/` — static assets.
- `src/index.css` — global styles.
- Project documentation lives under repository-root `docs/`; it is not frontend runtime code. See `docs/development-guide.md` for the current feature-based workflow.

**Frontend request flow**

1. `main.tsx` mounts React and `AuthProvider`.
2. `App.tsx` renders `AppRoutes`.
3. A route/page uses a feature service.
4. The service calls the shared API helper or uses the established service conventions.
5. `apiRequest` sends requests to `VITE_API_URL`, attaches the stored `bdms_token` as `Authorization: Bearer ...` when available, and reports API errors to callers.

Keep HTTP details centralized; do not introduce a second HTTP client or duplicate token/header logic without an explicit architectural decision.

### Backend: `server/`

- `src/index.ts` — process entry point and listener.
- `src/app.ts` — creates the Express app, configures CORS and JSON parsing, mounts API routers, and registers the error middleware.
- `src/routes/index.ts` — mounts grouped routes for users, roles, authentication, permissions, sales, and reports under `/api`.
- `src/features/<feature>/` — feature-oriented modules. Common files include routes, controller, service, repository, validation, and types. A feature may omit a layer when it is not needed; follow the neighboring implementation rather than creating empty layers.
- `src/middleware/` — cross-cutting request middleware such as authentication, permission checks, request validation, query validation, and error handling.
- `src/config/` — configuration such as JWT settings.
- `src/database/` — Prisma/database client setup.
- `src/shared/` — shared errors and other cross-feature primitives.
- `prisma/schema.prisma` — relational schema and enums.
- `prisma/migrations/` — versioned database changes.
- `prisma/seed.ts` — initial/reference data such as roles and permissions.
- `src/generated/prisma/` — generated Prisma client output.
- `dist/` — compiled JavaScript output produced by the TypeScript build. Prefer changing `src/` and rebuilding instead of editing generated output manually. Some compiled output may already be tracked in repository history; do not assume generated files are untracked or remove them wholesale. Review generated-file diffs separately and follow the current integration scope.

**Backend request flow**

1. Express receives the request in `app.ts`.
2. A route mounted under `/api` or a feature prefix selects the handler.
3. Authentication middleware validates the bearer JWT and reloads the user; inactive or missing users are rejected.
4. Permission middleware checks the required permission for protected actions where applied.
5. Validation middleware parses request bodies/queries using the feature's Zod schema.
6. The controller translates the HTTP request into a service call.
7. The service enforces business rules and coordinates repositories.
8. The repository uses Prisma to read/write data.
9. Errors flow to the shared error middleware, which formats API error responses.

Not every endpoint necessarily has every middleware layer. Confirm route protection in the actual route file before assuming an endpoint is authenticated or permission-checked.

## 3. Feature-oriented backend conventions

The preferred dependency direction is:

`route → middleware/validation → controller → service → repository → Prisma/database`

- **Routes** declare HTTP methods, URL paths, middleware order, and controller handlers.
- **Controllers** should stay focused on HTTP inputs/outputs.
- **Services** contain business rules, cross-repository coordination, and transaction decisions.
- **Repositories** encapsulate database queries and persistence operations.
- **Validation schemas** define accepted request shapes; business invariants still belong in service/database logic as appropriate.
- **Shared errors** should be used consistently so the error middleware can produce predictable responses.

Avoid circular dependencies between features. A service may call another feature's repository/service when necessary, but keep cross-feature dependencies deliberate and small.

## 4. Domain model and relationships

The Prisma schema currently defines these main areas:

- **Access control:** `Role`, `Permission`, `RolePermission`, and `User`. Users belong to roles; roles receive permissions through the join table.
- **Catalog:** `Product` stores product name, description, unit, price, and status.
- **Stock:** `Inventory` is associated one-to-one with a product through unique `productId`. `StockMovement` records inventory-linked movement type, reason, quantity, reference, notes, and timestamp.
- **Customers:** `Customer` holds customer identity/contact data and relates to orders and deliveries.
- **Orders:** `Order` belongs to a customer and contains `OrderItem` rows. Order items retain quantity, unit price, and subtotal.
- **Deliveries:** `Delivery` belongs to a customer, may be linked to one order, and contains `DeliveryItem` rows for delivered products and quantities.

Important schema details:
- Order and delivery item quantities are integers.
- Prices/subtotals use PostgreSQL decimal columns.
- Inventory and stock-movement quantities are currently declared as decimals in the committed schema; do not assume they enforce the business rule of whole-number quantities.
- A product can exist without an inventory row; inventory initialization is a separate operation.
- Order status values include `PENDING`, `CONFIRMED`, `COMPLETED`, and `CANCELLED`.
- Delivery status values include `DRAFT`, `COMPLETED`, and `CANCELLED`.

## 5. Inventory integrity rules

Inventory and stock movements are related but serve different purposes:

- `Inventory.quantity` represents the current quantity.
- `StockMovement` is the ledger/history of stock changes.
- A stock-changing workflow should keep the inventory balance and movement ledger consistent, ideally within a transaction.
- Product creation and inventory creation are separate.
- Use the established stock-movement workflow for stock-in/out rather than directly changing the inventory quantity.
- Treat adjustment behavior as a business rule requiring explicit definition; do not assume that an `ADJUSTMENT` quantity is a delta versus a counted final balance without checking the service implementation and approved requirements.
- Delivery completion is a sensitive stock-changing action. Verify transaction behavior, duplicate/retry behavior, insufficient-stock handling, and rollback before modifying it.

The feature-status tracker and backlog record known inventory integrity risks and verification tasks. Review them before implementing receiving, adjustments, returns, or other stock-changing features.

## 6. Authentication and permissions

- Login is handled by the auth feature.
- Passwords are compared with bcrypt.
- Successful login returns a JWT and a user object without the password field.
- Protected requests use the `Authorization: Bearer <token>` header.
- The authentication middleware verifies the token, checks the user still exists, rejects inactive accounts, and attaches user identity/role information to the request.
- The client stores the token under `bdms_token` and asks the backend for the current user's permission names.
- Backend authorization must be enforced on the API. Hiding a button or route in the frontend is not sufficient protection.
- In the reviewed `main` baseline, the Customers, Orders, Deliveries, Sales, Reports, and Dashboard route groups do not apply `authenticate` or `authorize` middleware. See Section 9; this is a known security gap, not merely a general reminder.

**Security review reminder:** inspect every write endpoint and sensitive read/report endpoint for both authentication and the intended permission. Test unauthenticated (401), authenticated-but-forbidden (403), and authorized success cases. The exact current middleware coverage can change as features and fixes are merged.

## 7. Environment, build, and generated files

### Frontend scripts

Run from `client/`:

- `npm run dev` — Vite development server.
- `npm run build` — TypeScript project build followed by Vite production build.
- `npm run lint` — ESLint.
- `npm run preview` — preview the production build.

The frontend requires `VITE_API_URL` to be configured; `src/lib/api.ts` throws if it is missing.

### Backend scripts

Run from `server/`:

- `npm run dev` — run `src/index.ts` with `tsx watch`.
- `npm run build` — compile TypeScript with `tsc`.
- `npm start` — run `dist/index.js`.
- `npm run prisma:seed` — execute the Prisma seed script with `tsx`.

The backend uses Prisma's generated client under `src/generated/prisma`; regenerate it using the repository's configured Prisma workflow after schema changes.

### Docker

The current root `compose.yaml` runs PostgreSQL, a production-built backend image, and an Nginx-served frontend image. It is a containerized integration/runtime workflow, not a hot-reload Compose development stack. Native local development uses the frontend/backend development servers with a separately running PostgreSQL service. A future production deployment configuration should be kept separate and created only when the hosting target and operational requirements are known. See `docs/local-development.md`.

## 8. Current development workflow

BDMS uses ongoing feature-based development rather than mandatory Phase 1 / Phase 2 completion gates. Features may be implemented, improved, corrected, integrated, or redesigned as business priorities require.

Use `docs/development-guide.md` for the workflow, `docs/feature-status.md` for the latest evidence-based status snapshot, and `docs/backlog.md` for prioritized follow-up work. Historical phase-planning context is consolidated under `docs/archive/` and is not active instruction.

Before changing a feature:
1. Inspect the current branch and working tree; preserve uncommitted changes.
2. Read the relevant frontend page/service/types, backend feature layers, route middleware, Prisma schema, and related documentation.
3. Confirm business rules, authorization, data integrity, and unresolved decisions.
4. Implement the smallest safe feature-scoped change.
5. Run relevant tests, builds, lint checks, and regression workflows.
6. Review the diff for secrets, generated files, and unrelated changes.
7. Update feature status and development notes with exact verification evidence.

Do not claim a feature is complete solely because it compiles. Do not run destructive database or Git commands as a shortcut.

## 9. Known implementation and verification gaps

The following findings describe the reviewed `origin/main` baseline at commit `f239ed9` (2026-11-19). Re-check them against the source before treating them as current after later changes.

### API authentication and authorization

- The Customers, Orders, Deliveries, Sales, Reports, and Dashboard route groups do not apply the backend `authenticate` or `authorize` middleware in the reviewed baseline.
- Inventory and Stock Movement routes do apply authentication and permission checks. Do not assume that frontend route guards protect an API endpoint; verify the backend route middleware.

### Inventory and stock-movement integrity

- `PUT /api/inventory/:id` can update an inventory quantity directly without creating a corresponding Stock Movement record. This can make the inventory balance and movement history inconsistent.
- The generic Stock Movement creation endpoint supports `IN / PURCHASE` and updates the balance and movement in one transaction, but it is not a supplier-linked Purchase Receiving workflow.
- Stock Movement creation updates the inventory balance and creates the movement in one database transaction. However, `ADJUSTMENT` currently treats the supplied quantity as the replacement balance (an absolute count), not as a signed change or delta.
- Inventory and Stock Movement quantities use Decimal database columns. Their reviewed Zod schemas validate numeric ranges but do not require integers, so fractional quantities can pass validation despite the whole-number business rule. Order and Delivery item quantities use integers.

### Order-to-delivery stock behavior

- Creating or confirming an Order does not reserve or deduct inventory. Confirmation changes the Order status but does not revalidate stock availability.
- Completing a Delivery is the stock-deduction point. The reviewed service performs the stock deduction, creates an `OUT` / `SALE` Stock Movement, and updates Delivery and Order status in one transaction.
- The current frontend Delivery flow supports entering one product line when creating a Delivery, although the backend data model and service support multiple items.

### Verification still required

- Re-check API authentication and permission coverage after route changes, especially for Customers, Orders, Deliveries, Sales, Reports, and Dashboard.
- Resolve the direct inventory-update path and define the intended `ADJUSTMENT` quantity semantics before changing stock workflows.
- Align database types and request validation with the whole-number quantity rule through a separately reviewed schema and migration plan.
- Run relevant backend and frontend builds, lint checks, automated tests, and order-to-delivery regression checks in the current working environment.
- Verify migration and backup/restore procedures against a separate test database before schema changes.

## 10. Architecture change log

| Date | Change |
|---|---|
| 2026-10-24 | Initial architecture reference created from the committed `phase-2-development` source and Phase 2 project context. |
| 2026-11-05 | Refreshed repository branch/date, clarified feature-based development, and distinguished native development from the current Compose runtime and future deployment setup. |
| 2026-11-07 | Consolidated project documentation under `docs/`; the root README is the entry point and this file remains the technical architecture reference. |
| 2026-11-19 | Audited this architecture reference against `origin/main` at `f239ed9`; clarified API authorization coverage and documented inventory and stock-workflow gaps. |
