# Historical Frontend Planning Notes

> **Historical reference only.** These notes consolidate the former frontend plans, sales/report suggestions, inventory visibility prompts, and stock-movement dashboard proposals. They describe decisions and ideas from earlier implementation stages; inspect current source before treating any item as an outstanding task.

For current frontend structure, use [the architecture reference](../../ARCHITECTURE.md), [development guide](../development-guide.md), and [frontend design guidelines](../frontend-design-guidelines.md).

## 1. Original frontend direction

The frontend was intended to remain a practical medium-sized React/TypeScript application rather than an over-engineered enterprise structure. The durable decisions were:
- Keep route-level screens under `client/src/pages/`.
- Keep reusable UI in `components/`, shared layout in `layouts/`, API services in `services/`, shared helpers in `lib/`, and shared types in `types/`.
- Use the existing native-fetch API helper; do not add Axios or duplicate token/header handling.
- Keep authentication state in the auth context/provider and API calls in services.
- Let the backend own validation, permissions, inventory calculations, and state transitions.
- Prefer incremental, lesson-style changes and verify meaningful changes with lint/build.

Old path examples and early folder trees are superseded by the current [architecture reference](../../ARCHITECTURE.md).

## 2. Inventory and stock UI proposals

The old Product/Inventory plans emphasized that Product and Inventory are separate records:
- Product holds item identity and commercial details.
- Inventory holds current quantity and minimum stock.
- Product creation must not ask for current stock or create a fake purchase movement.
- Inventory must use a real backend Inventory record.
- Stock-in must use the existing backend operation and create the corresponding movement.
- Delivery completion is responsible for stock-out; the frontend must not deduct stock independently.
- Operational quantities are whole numbers.

The inventory visibility prompt recommended investigating missing Inventory records, API response shapes, permissions, and product-vs-inventory identifiers before changing the UI. Its preferred direction was an explicit inventory initialization step at zero quantity when the backend requires it. The current canonical reference is [Inventory and Stock Workflow](../workflows/inventory-and-stock.md); the exact implementation must be confirmed from current source.

## 3. Sales and reports integration boundaries

The historical Sales/Reports plan documented these boundaries:
- Sales are derived from completed deliveries; there is no separate Sale creation workflow in the current design.
- The frontend consumes existing Sales and Reports endpoints and displays backend-provided totals.
- Date filters use `from` and `to` in `YYYY-MM-DD` format where supported.
- Do not invent report fields or calculate replacement sales totals in the client.
- Empty report data is not an application error.
- Provide loading, error, and empty states.
- Do not create a separate Order Report without an explicit requirement.

The old plan listed seven report endpoints and example response shapes. Treat those examples as historical; inspect the current API before using endpoint or response details.

## 4. Stock movement page and dashboard proposals

An earlier design note recommended separating current inventory from stock-movement history:
- Inventory answers how much stock is available now.
- Stock Movements answers what happened to stock over time.
- A dedicated movement-history page can support filters and pagination as the data grows.
- Inventory may show only a small recent-activity preview.
- The Dashboard should not load an unbounded movement history.

This was a UI recommendation, not a backend contract. Verify the current pages and API capabilities before changing them.

## 5. Earlier report and frontend enhancement ideas

The former notes proposed or recorded the following:
- CSV export for the currently selected report.
- Browser print/PDF export and print-specific styles.
- Consistent date, currency, quantity, and status formatting.
- Tests for date-range construction, currency formatting, empty/error states, and report filters.
- Request cancellation if users frequently switch report tabs during loading.
- Server-side pagination only when data size and API support justify it.
- Browser-level smoke tests for login, customer creation, delivery completion, report loading, filtering, and permission/error states.
- Avoid sortable columns, mobile-specific table redesigns, or shared table abstractions until the current workflow demonstrates a need.

Some items were marked Done or Applied in the old notes. Do not re-add completed work without checking the current implementation.

## 6. Historical status and scope warning

Old documents included early route lists, local URLs, credentials placeholders, package assumptions, and implementation plans. They may no longer match the repository. Do not copy old passwords, email addresses, environment values, endpoint shapes, or folder paths into current documentation without verification.

The current project remains feature-based. Choose frontend work using the current backlog and feature-status evidence, then inspect the actual code before editing.
