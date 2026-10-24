# BDMS Repository Architecture

**Repository:** `Mercurial999/BDMS`  
**Branch reviewed:** `phase-2-development`  
**Reviewed:** 2026-10-24  
**Purpose:** A durable reference for the repository layout, application boundaries, request flow, data model, and safe development conventions. Update this document when the architecture materially changes.

> **Scope note:** This document is based on files currently committed to `phase-2-development` and the source files inspected for this review. It does not automatically include uncommitted changes on a developer's local computer. Re-check the branch after those changes are committed and pushed.

## 1. System overview

BDMS is a web-based Bakery Distribution Management System with a React/TypeScript client, an Express/TypeScript API, and PostgreSQL persistence through Prisma.

| Layer | Technology / responsibility |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS v4 |
| HTTP communication | Native `fetch` through the shared `client/src/lib/api.ts` helper |
| Backend | Node.js, Express 5, TypeScript, ES modules |
| Validation | Zod schemas applied by Express validation middleware |
| Authentication | JWT bearer tokens, password verification with bcrypt, active-account checks |
| Authorization | Role/permission data in PostgreSQL; permission middleware on protected feature routes |
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
- `src/plan/phase2/` — Phase 2 planning, branching, and progress-tracking documents. These are project documentation, not runtime code.

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
- `dist/` — compiled JavaScript output produced by the TypeScript build. Prefer changing `src/` and rebuilding instead of editing generated output manually.

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

The Phase 2 tracker records known inventory integrity risks and verification tasks. Read it before implementing receiving, adjustments, returns, or other stock-changing features.

## 6. Authentication and permissions

- Login is handled by the auth feature.
- Passwords are compared with bcrypt.
- Successful login returns a JWT and a user object without the password field.
- Protected requests use the `Authorization: Bearer <token>` header.
- The authentication middleware verifies the token, checks the user still exists, rejects inactive accounts, and attaches user identity/role information to the request.
- The client stores the token under `bdms_token` and asks the backend for the current user's permission names.
- Backend authorization must be enforced on the API. Hiding a button or route in the frontend is not sufficient protection.

**Security review reminder:** inspect every write endpoint and sensitive read/report endpoint for both authentication and the intended permission. Test unauthenticated (401), authenticated-but-forbidden (403), and authorized success cases. The exact current middleware coverage can change as Phase 2 work is merged.

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

The repository uses Docker/Compose for a frontend, backend, and PostgreSQL development runtime. Check the actual Compose file and environment variables before changing service names, host ports, database URLs, or build contexts. Rebuild images after source/configuration changes when testing the containerized app; a running container does not automatically contain new local source code unless a configured bind mount provides it.

## 8. Phase 2 documentation and workflow

Phase 2 work belongs on `phase-2-development`; keep `main` as the stable Phase 1 baseline unless the project owner explicitly changes that policy.

Before a feature:
1. Read `client/src/plan/phase2/implementationPlan.md` and `progress-tracker.md`.
2. Inspect the existing route, service, repository, validation, Prisma schema, and UI/service flow relevant to the feature.
3. Check the current branch and working tree; preserve uncommitted changes.
4. Confirm business decisions and data-safety requirements before schema or stock-flow changes.
5. Implement the smallest feature-scoped change.
6. Run relevant builds, lint/tests, and regression checks.
7. Update the implementation plan and progress tracker with evidence, limitations, and commit/PR reference.

Do not mark a step complete just because code compiles. Keep Phase 1 behavior stable, avoid unrelated refactors, and do not run destructive database or Git commands as a shortcut.

## 9. Known verification gaps

These are review prompts, not claims that every issue is currently present:

- Confirm all Orders endpoints have the intended authentication and permission middleware after local Phase 2 changes are merged.
- Verify stock movements and inventory balances remain consistent for every stock-changing path.
- Confirm integer-quantity validation is consistent across inventory and stock-movement endpoints if whole-number quantities are the business rule.
- Confirm Prisma migration and backup/restore workflows against a separate test database before schema changes.
- Confirm frontend lint/build, backend build, and Phase 1 order-to-delivery regression checks in the local environment.
- Revisit this document after significant folder, API, database, authentication, or deployment changes.

## 10. Architecture change log

| Date | Change |
|---|---|
| 2026-10-24 | Initial architecture reference created from the committed `phase-2-development` source and Phase 2 project context. |
