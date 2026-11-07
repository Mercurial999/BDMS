# Inventory and Stock Workflow

This document records the current domain boundaries and the safe workflow principles for inventory-related development. It does not replace inspection of the current API, database schema, or implementation.

## 1. Product, inventory, and stock movement are different records

- **Product** describes an item the business sells: name, unit, price, description, and status.
- **Inventory** represents the current stock balance and minimum-stock information for a product.
- **Stock Movement** records a stock change and its reason/reference.

A Product ID and an Inventory ID are not interchangeable. Product creation does not automatically mean stock exists. Do not invent opening stock or create a fake purchase movement when creating a product.

The current documented model allows a Product to exist without an Inventory row. Inventory initialization is a separate operation. Confirm the current API and UI behavior before changing that rule.

## 2. Intended stock-in and stock-out behavior

### Stock-in

For a physical stock receipt, use the approved backend stock-in workflow. The operation should:
1. Identify the actual Inventory record.
2. Validate a positive whole-number quantity.
3. Record the source/reference and reason.
4. Increase the inventory balance.
5. Create the matching `IN` stock movement.
6. Commit the balance and movement together.

Do not update the inventory balance directly from the frontend. Do not create a stock movement from the client independently of the balance update.

### Delivery stock-out

The documented order-to-delivery workflow is:
1. Staff records an order.
2. The order is reviewed/confirmed.
3. A delivery is prepared.
4. Delivery completion validates stock.
5. The backend deducts inventory and creates the corresponding `OUT / SALE` movement in one transaction.
6. Sales and reports reflect completed deliveries in the current design.

Creating or confirming an order does not deduct stock. Repeated delivery completion must not deduct stock twice. A failed operation must not leave partial delivery, inventory, or movement changes.

## 3. Quantity rules

The business decision is to use whole-number operational quantities; fractional sacks or units such as `0.5` are not supported.

Validate quantity at the API and service boundaries, and review database constraints separately. Do not assume a TypeScript/API check means the database itself enforces whole numbers. Inspect the current Prisma schema and migrations before changing column types or constraints.

## 4. Inventory initialization and product visibility

The historical UI analysis considered this preferred direction:

```text
Create Product
    -> Initialize an Inventory record at quantity 0
    -> Show the product in Inventory
    -> Use the stock-in workflow when physical stock arrives
```

This is a design direction, not an automatic implementation requirement. The current business rule is that Product and Inventory are separate. Before changing product creation or inventory visibility, inspect:
- Product creation service and endpoint.
- Inventory creation endpoint and validation.
- Inventory list endpoint and response shape.
- Stock movement endpoint and accepted reasons.
- Frontend Product and Inventory pages/services.
- Permissions for product creation, inventory initialization, and stock-in.
- Existing active products that do not yet have an Inventory row.

Decide whether initialization should be automatic or an explicit staff action. Do not create fake purchase movements or fabricate client-side Inventory rows.

## 5. Adjustment semantics

Do not assume an `ADJUSTMENT` quantity is a delta. Historical source reviews observed a path where the submitted quantity was treated as the new counted balance. Reinspect the current service before relying on it.

Before implementing adjustments, confirm:
- Whether staff enter a counted final quantity or a positive/negative delta.
- Which roles may create or approve adjustments.
- Required reasons and references.
- Whether negative inventory is prohibited.
- How before/after values and actor/time are recorded.

The backend should read/lock the current balance, calculate the resulting change, and atomically persist the balance and movement. Do not trust a client-supplied previous balance.

## 6. Returns and receiving

These are separate future workflows and require confirmed business rules:
- Receiving should identify the supplier/source and post stock exactly once.
- Posted receiving records should not be silently edited; define correction/reversal behavior.
- Returns should link to their original completed delivery.
- Only approved resalable returned goods should increase sellable stock.
- Damaged/expired goods should not automatically be added to available inventory.
- Original delivery and stock-out history must remain intact.

See [the historical planning archive](../archive/phase-based-planning.md) for the former detailed proposals and open business decisions. Current implementation priorities belong in [the backlog](../backlog.md).

## 7. Verification checklist for stock-changing work

- [ ] Confirm the active branch and clean/understood working tree.
- [ ] Use a separate test database and verify backup/restore before risky schema or stock changes.
- [ ] Inspect the current schema, migrations, endpoint, validation, service, transaction, and permissions.
- [ ] Test valid and invalid quantities, including fractional values.
- [ ] Test unauthenticated, forbidden, and authorized access.
- [ ] Test duplicate/retry and concurrency behavior where applicable.
- [ ] Verify the inventory balance matches the corresponding movement ledger.
- [ ] Verify rollback leaves no partial records.
- [ ] Re-test the affected order-to-delivery workflow.
- [ ] Record exact commands, results, limitations, and commit in the development log.
