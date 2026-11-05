# BDMS System Structure

This document describes the structure observed in the repository branch reviewed on 2026-11-05. Recheck the branch before treating it as a complete description of local uncommitted work.

## 1. Repository overview

```text
BDMS/
├── client/                 # React frontend
├── server/                 # Express API and Prisma database layer
├── compose.yaml            # Current multi-container Compose setup
├── ARCHITECTURE.md         # Technical architecture reference
└── client/src/plan/        # Development documentation
```

## 2. Frontend — pages-based structure

The frontend organizes route-level screens under `client/src/pages/`. This is intentional and does not need to be converted into a `features/` directory.

Observed structure:

```text
client/src/
├── assets/       # Static assets
├── components/   # Reusable UI and domain components
├── context/      # React context/providers, including authentication
├── layouts/      # Shared application/page layouts
├── lib/          # Shared helpers, including the API request helper
├── pages/        # Route-level screens
├── plan/         # Project planning and development documentation
├── routes/       # Route definitions and AppRoutes
├── services/     # Frontend API/service functions
├── types/        # Shared TypeScript types
├── App.tsx
└── main.tsx
```

Typical frontend flow:

```text
main.tsx
  -> AuthProvider / App.tsx
  -> routes/AppRoutes.tsx
  -> pages/<Screen>
  -> services/<feature>Service
  -> lib/api.ts
  -> Backend API
```

Use `pages/` for screens and route-level composition. Put reusable UI in `components/`; avoid putting every screen's one-off code into a global feature abstraction.

## 3. Backend — feature-oriented structure

The backend groups code by business capability:

```text
server/src/
├── config/       # Runtime configuration
├── database/     # Prisma/database setup
├── features/
│   ├── auth/
│   ├── customers/
│   ├── dashboard/
│   ├── deliveries/
│   ├── inventory/
│   ├── orders/
│   ├── permissions/
│   ├── products/
│   ├── reports/
│   ├── roles/
│   ├── sales/
│   ├── stock-movements/
│   └── users/
├── middleware/   # Authentication, authorization, validation, errors
├── routes/       # API route composition
├── shared/       # Cross-feature shared code
├── types/        # Shared request/application types
├── app.ts        # Express application setup
└── index.ts      # Process entry point
```

A feature may use routes, controller, service, repository, validation, and types as appropriate. Not every feature needs every layer. Follow the established neighboring pattern and keep business rules in services rather than HTTP controllers.

Typical backend flow:

```text
app.ts / routes
  -> feature route
  -> authentication / permission / validation middleware
  -> controller
  -> service
  -> repository
  -> Prisma
  -> PostgreSQL
```

The exact middleware applied differs by endpoint. Inspect the route before assuming it is protected.

## 4. Database and generated output

- Prisma schema: `server/prisma/schema.prisma`
- Migrations: `server/prisma/migrations/`
- Seed: `server/prisma/seed.ts`
- Generated Prisma client: `server/src/generated/prisma/`
- TypeScript build output: `server/dist/`

Edit source schema/code and use the established generation/build commands. Do not hand-edit generated Prisma output or compiled `dist/` files.

## 5. Frontend/backend boundary

The frontend is responsible for screens, interaction, client-side presentation, and calling API services. The backend is responsible for authentication, authorization, validation, business rules, transactions, and persistence.

The frontend and backend do not need matching directory names or identical module boundaries. The frontend's pages-based organization and backend's feature-based organization are both valid.

## 6. Current feature coverage note

The backend source tree contains an Orders feature. The previously inspected frontend route list did not show an Orders page/route. Treat this as an integration item to verify against the current branch and business priorities, not as proof of the current local working tree.

For implementation conventions and request-flow details, see root `ARCHITECTURE.md`.
