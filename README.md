# Bakery Distribution Management System (BDMS)

BDMS is an internal operations system for a bakery-ingredient distribution business. Staff use it to manage products, customers, orders, deliveries, inventory, stock movements, sales, and operational reports.

## Repository structure

- `client/` — React, TypeScript, and Vite frontend.
- `server/` — Express, TypeScript, Prisma, and PostgreSQL backend.
- `docs/` — project guides, architecture, feature status, workflows, prompts, and historical references.
- `ARCHITECTURE.md` — technical architecture and application boundaries.
- `compose.yaml` — current Docker Compose runtime.

## Start here

| Need | Read |
|---|---|
| Understand the project and development workflow | [Development guide](docs/development-guide.md) |
| Understand the frontend/backend architecture | [Architecture](ARCHITECTURE.md) |
| Run BDMS locally or with Docker | [Local development guide](docs/local-development.md) |
| Check feature implementation status and verification gaps | [Feature status](docs/feature-status.md) |
| Review proposed work and unresolved decisions | [Backlog](docs/backlog.md) |
| Understand the documented order-to-delivery workflow | [Order-to-delivery workflow](docs/workflows/order-to-delivery.md) |
| Understand inventory and stock-movement boundaries | [Inventory and stock workflow](docs/workflows/inventory-and-stock.md) |
| Find reusable ChatGPT task prompts | [Prompts](docs/prompts/README.md) |
| Read historical planning context | [Documentation archive](docs/archive/README.md) |

## Development direction

BDMS uses ongoing feature-based development. There are no active Phase 1 or Phase 2 completion gates. Work is selected by business priority, defects, feature gaps, operational risk, and verification needs.

The current branch or feature name does not, by itself, prove that a feature is implemented or verified. Use the feature-status document for the latest evidence-based snapshot and inspect the current source before making implementation decisions.

## Core business rules

- Bakery customers are business records, not BDMS login accounts.
- One Admin account manages staff accounts; inactive staff must not be able to log in.
- Product information and inventory quantity are separate concerns.
- Operational product quantities are whole numbers.
- Creating or confirming an order does not deduct stock.
- Delivery completion is the documented stock-deduction point.
- Inventory changes and matching stock movements must remain consistent and transactional.
- Sales are derived from completed deliveries in the current design.
- Delivery receipt printing remains deferred until the business confirms its requirements.

See [Architecture](ARCHITECTURE.md) and the [development guide](docs/development-guide.md) before changing these rules or workflows.

## Technology overview

- Frontend: React 19, TypeScript, Vite, React Router, Tailwind CSS v4, shadcn/ui.
- Backend: Node.js, Express 5, TypeScript, Zod.
- Database: PostgreSQL with Prisma.
- API communication: native `fetch` through the shared frontend API helper.
- Runtime: native local development and the repository's Docker Compose configuration.

## Safety

- Keep credentials in ignored environment files; never commit secrets.
- Confirm the target database before running migrations or data-changing commands.
- Use a separate test database for risky schema or stock-mutation testing.
- Do not run `docker compose down -v`, remove the PostgreSQL volume, or reset a database containing data you need.
- Inspect the current branch and working tree before changing files.
