# Inventory Product Visibility Analysis Prompt

You are working on the frontend of the existing Falcore Consumer Goods Trading distribution system.

## Important Constraint

Do not modify any code yet.

Do not modify the backend, Prisma schema, database models, backend services, repositories, routes, validation, or business logic.

The purpose of this prompt is to analyze the current Product and Inventory behavior first and recommend the correct frontend-only solution.

## Observed Problem

A product can be created successfully from the Products page, but the new product does not appear in the Inventory page.

Example:

1. Staff creates a product named `New Flour` in Products.
2. The product appears in the Products table.
3. Staff opens Inventory.
4. `New Flour` is not listed in the inventory table or the Add Stock product selector.

Determine whether this behavior is expected because Product and Inventory are separate records, or whether the frontend is missing a required inventory setup step.

## Business Model

A Product answers:

> What does the business sell?

A Product contains:

- Name
- Description
- Unit
- Price
- Status

An Inventory record answers:

> How much of this product does the business currently have?

An Inventory record contains:

- Product ID
- Current quantity
- Minimum stock
- Stock status

A product and its inventory record are related, but they are not the same record.

## Stock Rules

- Creating a Product should not silently perform a stock-in operation.
- Stock-in must use the existing backend stock movement workflow.
- Stock-in should create an `IN` movement with a valid reason such as `PURCHASE` or `RETURN`.
- Inventory quantity should increase through the existing backend operation.
- Product creation should not create a fake stock movement.
- Quantity inputs must use whole numbers.
- Completing a Delivery is responsible for stock-out and sales behavior. The frontend must not manually deduct stock when creating a product or adding stock.

## Existing Expected Flow

```text
Create Product
    ↓
Create or initialize the related Inventory record
    ↓
Inventory page can display the product
    ↓
Add Stock creates an IN/PURCHASE movement
    ↓
Inventory quantity increases
```

## Required Investigation

Before proposing code changes, inspect the existing frontend and backend contracts read-only.

Check:

1. How the Products page creates a product.
2. How the Inventory page loads inventory records.
3. Whether the backend automatically creates an Inventory record when a Product is created.
4. Whether the backend exposes `POST /api/inventory` for creating an inventory record.
5. Whether the backend exposes `POST /api/stock-movements` for stock-in operations.
6. Whether the current user has the required permissions for inventory creation and stock updates.
7. Whether existing products already have inventory records.
8. Whether the Inventory endpoint returns only existing inventory rows rather than all active products.
9. Whether the Add Stock selector correctly uses inventory IDs rather than product IDs.
10. Whether an API error or permission error is hidden by the current frontend state handling.

## Important Questions to Answer

- Is every active Product expected to have an Inventory record immediately?
- Should a newly created Product appear in Inventory with quantity `0`?
- Should the Products page offer an explicit `Set up inventory` action after product creation?
- Should the Inventory page offer a `Create inventory` or `Initialize stock` action for active products without inventory?
- Should initial quantity be zero during inventory setup, with later stock added through Stock In?
- What should happen when a product is inactive?
- How should the frontend handle a product whose inventory record is missing?
- Which option best preserves the backend as the source of truth?

## Do Not Assume

Do not assume that:

- Product creation automatically creates inventory.
- A missing inventory row means the product is invalid.
- Updating inventory quantity directly is equivalent to Stock In.
- The frontend can create stock movements without checking the user's permission.
- The Product ID and Inventory ID are interchangeable.
- Every backend response contains fields that have not been inspected.

## Preferred Design Direction

Recommend the smallest design that makes the relationship clear to staff.

The preferred business behavior is usually:

```text
Product creation
    ↓
Create an inventory record with quantity 0 and a chosen minimum stock
    ↓
Show the product in Inventory
    ↓
Use Add Stock for supplier receipts
```

However, do not implement this recommendation until the existing backend behavior, validation rules, permissions, and API response shapes have been confirmed.

If the backend does not support automatic inventory initialization during Product creation, recommend an explicit frontend action that calls the existing inventory creation endpoint.

Do not modify the backend to make the frontend easier.

## Acceptance Criteria for a Future Implementation

The future implementation should satisfy all of the following:

- Creating a Product does not ask for current stock quantity.
- A newly created active Product has a clear path to become visible in Inventory.
- Inventory uses an actual backend Inventory record, not a client-generated row.
- Inventory quantity is displayed accurately from the backend.
- Stock In increases quantity through the existing stock movement endpoint.
- Stock In creates an `IN` movement with a valid reason.
- Product creation does not create a fake purchase movement.
- Missing inventory records produce a clear user-friendly state.
- Permission and validation errors are displayed without exposing stack traces.
- Existing Products, Inventory, Stock Movements, Deliveries, Sales, and Reports behavior remains unchanged.
- No backend files are modified.

## Required Analysis Output

Before coding, provide:

1. The confirmed current data flow.
2. The reason newly created Products do or do not appear in Inventory.
3. The relevant frontend and backend files.
4. The API endpoints and request shapes involved.
5. The permission requirements.
6. At least two possible frontend solutions.
7. The recommended solution and why it is safest.
8. The exact files that would be changed in a later implementation.
9. The tests or checks that would verify the behavior.

Only after this analysis is approved should code changes begin.
