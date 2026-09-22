# Product and Stock Movement Dashboard Suggestions

## Purpose

This document evaluates whether Inventory should continue showing stock movements or whether stock movements should become a separate operational page as the system grows.

No frontend or backend code should be changed until this design decision is reviewed.

## Current Situation

The Inventory page currently contains two responsibilities:

1. Current inventory levels
2. Recent stock movement history

Inventory shows:

- Product
- Quantity left
- Minimum stock
- Stock status

Stock movements show:

- Product
- Movement type
- Reason
- Quantity
- Date

This is convenient for a small dataset, but the two sections represent different operational questions.

## Business Distinction

Inventory answers:

> How much stock do we have right now?

Stock Movements answer:

> What happened to stock over time?

These should remain separate concepts even though they are related.

```text
Inventory
    Current state
    Quantity remaining
    Minimum stock
    Low-stock status

Stock Movements
    Historical events
    Stock in
    Stock out
    Adjustments
    Purchase, sale, damage, return
    Reference and notes
    Date and audit history
```

## Direct Recommendation

Create a separate `Stock Movements` page.

Do not keep the complete stock movement table inside Inventory. As the number of products and movement records grows, combining both tables will make Inventory crowded, slower to scan, and harder to use for its primary purpose: checking current stock.

Inventory should focus on the current state of products. Stock Movements should be a separate history and audit page.

The recommended structure is:

```text
Inventory page
    Current inventory table
    Add Stock action
    Optional latest 5 to 10 movement preview
    View all Stock Movements link

Stock Movements page
    Complete movement history
    Filters
    Pagination
    CSV/PDF export later
```

Recommended Inventory layout:

```text
Inventory

Current stock table
- Product
- Quantity left
- Minimum stock
- Status
- Add stock

Recent activity preview
- Show the latest 5 to 10 movements only
- Link to View all stock movements
```

Recommended Stock Movements layout:

```text
Stock Movements

Filters:
- Date from
- Date to
- Product
- Movement type
- Reason

Table:
- Date
- Product
- Type
- Reason
- Quantity
- Reference
- Notes
```

## Why This Scales Better

### 1. Clear responsibilities

Inventory remains focused on current stock and stock actions. Stock Movements becomes the place for history and auditing.

### 2. Better performance

Inventory does not need to render a growing movement history every time it loads. A dedicated page can later support pagination or server-side filtering.

### 3. Easier daily use

Staff can quickly check current stock without scrolling through historical activity.

### 4. Better auditing

Managers can search and review stock changes without mixing current quantities with historical records.

### 5. Safer future expansion

A dedicated page can later support:

- Pagination
- Date filters
- Product filters
- Movement type filters
- Reason filters
- CSV export
- PDF or print reports
- Detail views
- Audit references

## Should Stock Movements Be Added to the Dashboard?

Do not place the complete stock movement table on the Dashboard.

The Dashboard should remain a summary workspace. A small activity widget may be appropriate:

```text
Recent stock activity

IN       Flour       +50      PURCHASE
OUT      Sugar       -10      SALE
```

The widget should show only a small number of recent records and link to the full Stock Movements page. It should not be required for the first version if the Dashboard is already busy.

The Dashboard should not:

- Load the complete movement history
- Replace the Inventory page
- Replace the Stock Movements page
- Include large filters and audit tables
- Calculate inventory totals independently

## Recommended Navigation

```text
Dashboard
Products
Inventory
Stock Movements
Customers
Deliveries
Sales
Reports
Users
Roles
```

The exact order can follow the user's operational workflow, but Stock Movements should be visibly separate from Inventory once the data grows.

## Options

### Option A: Keep everything on Inventory

Advantages:

- Smallest immediate change
- Simple for very small datasets
- No additional navigation item

Risks:

- Inventory becomes crowded
- Movement history increases page size
- Harder to audit and filter
- Staff may confuse current quantity with historical movement

### Option B: Separate Stock Movements page

Advantages:

- Clear business responsibility
- Better scalability
- Easier filtering and pagination
- Better audit workflow

Risks:

- Adds one navigation item
- Requires a dedicated page and route
- Requires deciding how much recent activity remains on Inventory

### Option C: Separate page plus Dashboard preview

Advantages:

- Fast visibility for recent activity
- Full history remains organized
- Best balance for operations and management

Risks:

- Adds a small amount of duplicated presentation
- Requires limiting the Dashboard query or response size

## Final Choice

Choose **Option B first**, with a limited preview added later if it proves useful:

1. Add a dedicated Stock Movements page and navigation item.
2. Keep current stock, minimum stock, status, and Add Stock on Inventory.
3. Remove the full movement history table from Inventory.
4. Optionally show only the latest 5 to 10 movements on Inventory with a `View all` link.
5. Do not load the complete movement history on the Dashboard.
6. Add pagination and filters to the dedicated page when the backend supports them.
7. Keep the backend as the source of truth.

This gives staff a clean Inventory page now and leaves room for a proper movement history workflow later.

## Backend Contract Questions Before Implementation

Before coding, inspect and confirm:

- Whether `GET /api/stock-movements` supports pagination.
- Whether it supports `from` and `to` date filters.
- Whether it supports product, type, and reason filters.
- Whether a limit parameter is available for a Dashboard preview.
- Which permission controls stock movement reads.
- Whether the response includes product details, units, references, notes, and timestamps.
- Whether the endpoint returns all rows and therefore needs frontend limiting temporarily.

Do not modify backend behavior to make the first frontend version easier.

## Suggested Future Implementation Sequence

1. Confirm the current stock movement API response and permissions.
2. Add a dedicated frontend route and navigation item for Stock Movements.
3. Move the complete movement table from Inventory to the new page.
4. Keep only a limited recent-activity preview on Inventory, or omit it initially.
5. Add loading, error, and empty states.
6. Add pagination or server-side limits when supported.
7. Add date, product, type, and reason filters.
8. Add CSV export after the table shape is confirmed.
9. Add browser-level tests for filtering, empty results, and permission errors.

## Acceptance Criteria

A future implementation should satisfy:

- Inventory remains focused on current stock.
- Stock Movements has its own clear page.
- The Dashboard does not load an unbounded movement history.
- Recent activity is limited to a small, readable preview.
- Complete history supports pagination when the API allows it.
- Movement types and reasons display actual backend values.
- No duplicate stock movement business logic is created in the frontend.
- No backend files are modified without explicit approval.
- Inventory quantities continue to come from the backend.
- Delivery completion remains responsible for stock-out and sales behavior.
