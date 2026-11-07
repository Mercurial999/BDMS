# Order To Completed Delivery Process

## Purpose

This document describes the current BDMS workflow from creating an order to completing a delivery.

The workflow connects:

```text
Staff user
  -> Customer
  -> Product and quantity
  -> Order
  -> Confirmed order
  -> Draft delivery
  -> Completed delivery
  -> Inventory deduction
  -> Stock movement
```

## Important Business Rule

Delivery quantities must be positive whole numbers.

Valid examples:

```text
1 sack
5 sacks
30 sacks
```

Partial quantities such as `0.5` or `2.5` are not allowed by the order validation rules.

## Step 1: Staff Logs In

The staff member opens the login page and submits an email and password.

Frontend request:

```http
POST /api/auth/login
```

The backend validates the credentials and returns:

- JWT token
- Authenticated user
- User role

The frontend stores the token and sends it with later API requests:

```http
Authorization: Bearer <token>
```

## Step 2: Staff Selects A Customer

The delivery page loads active customers from:

```http
GET /api/customers
```

The staff selects the bakery store/customer that will receive the delivery.

Inactive customers cannot be used to create a new order.

## Step 3: Staff Selects A Product And Quantity

The delivery page loads active products from:

```http
GET /api/products
```

The staff selects:

- Product
- Positive whole-number quantity
- Optional delivery notes

The current frontend delivery form supports one product item per new delivery. The backend order model supports multiple items, so the frontend can later be expanded into a multi-item order workspace.

## Step 4: Frontend Creates The Order

The frontend sends:

```http
POST /api/orders
```

Example request:

```json
{
  "customerId": 1,
  "notes": "Deliver before noon",
  "items": [
    {
      "productId": 2,
      "quantity": 5
    }
  ]
}
```

The backend validates that:

- The customer exists.
- The customer is active.
- At least one item exists.
- Product IDs are valid.
- Products exist and are active.
- Quantities are positive integers.
- The same product is not repeated in one order.

A newly created order starts with this status:

```text
PENDING
```

At this stage, inventory has not changed.

## Step 5: Frontend Confirms The Order

After the order is created, the frontend confirms it:

```http
PATCH /api/orders/:id/confirm
```

The order status changes from:

```text
PENDING -> CONFIRMED
```

A confirmed order is eligible to become a delivery.

Inventory is still not deducted at this stage.

## Step 6: Frontend Creates A Draft Delivery

The frontend creates the delivery using the confirmed order:

```http
POST /api/deliveries
```

Example request:

```json
{
  "orderId": 10,
  "deliveryDate": "2026-09-21T10:00:00.000Z",
  "notes": "Deliver before noon"
}
```

The backend checks that:

- The order exists.
- The order status is `CONFIRMED`.
- The order does not already have a delivery.
- The order contains at least one item.
- The customer exists.

The delivery starts with this status:

```text
DRAFT
```

At this point, the delivery is recorded, but inventory has not changed yet.

## Step 7: Staff Completes The Delivery

The staff member clicks the **Complete** action for the draft delivery.

Frontend request:

```http
PATCH /api/deliveries/:id/complete
```

The backend performs the completion inside a database transaction.

## Step 8: Backend Locks The Delivery

The backend locks the delivery record before processing it.

This helps prevent two requests from completing the same delivery at the same time.

The backend checks that the delivery status is still:

```text
DRAFT
```

Only draft deliveries can be completed.

## Step 9: Backend Validates Inventory

For every delivery item, the backend finds and locks the inventory record for the product.

It checks:

```text
available quantity >= requested quantity
```

If there is not enough stock, the transaction fails with an insufficient inventory error.

No partial update should remain after a failed transaction.

## Step 10: Backend Deducts Inventory

For each item, the backend calculates:

```text
new inventory quantity = current quantity - delivery quantity
```

The inventory record is updated inside the same transaction.

The delivery module uses centralized inventory logic and does not perform an unsafe client-side deduction.

## Step 11: Backend Creates A Stock Movement

After deducting inventory, the backend creates a stock movement record.

The delivery completion currently records movements using:

```text
Type: OUT
Reason: SALE
Reference: Delivery #<delivery id>
```

This creates an audit trail for the inventory change.

## Step 12: Backend Marks The Delivery Completed

After all items are validated and processed successfully:

```text
DRAFT -> COMPLETED
```

The related order is also updated to its completed state by the delivery completion workflow.

The transaction commits only after all required operations succeed.

## Final Successful Result

After successful completion:

```text
Order: COMPLETED
Delivery: COMPLETED
Inventory: deducted
Stock movement: recorded
```

The frontend reloads the delivery list so the updated status is visible.

The dashboard and reports can then reflect the completed delivery and updated inventory.

## Failure Cases

### Invalid login

The login request returns an authentication error. No order or delivery is created.

### Inactive customer

The order creation request is rejected.

### Inactive product

The order creation request is rejected.

### Invalid quantity

Zero, negative, decimal, or missing quantities are rejected.

### Unconfirmed order

A delivery cannot be created from an order that is not `CONFIRMED`.

### Duplicate delivery

An order cannot be converted into more than one delivery.

### Insufficient inventory

The delivery cannot be completed. Inventory should remain unchanged because the operation is transactional.

### Already completed delivery

A completed delivery cannot be completed again.

## Current Frontend Sequence

The current delivery page performs this sequence when the staff submits the form:

```text
createOrder()
  -> confirmOrder()
  -> createDelivery()
```

When the staff clicks **Complete**:

```text
completeDelivery()
  -> backend validates stock
  -> backend deducts inventory
  -> backend creates stock movement
  -> backend marks delivery completed
```

## Verification Checklist

Before considering a delivery successful, verify:

- Customer is active.
- Product is active.
- Quantity is a positive whole number.
- Order status becomes `CONFIRMED`.
- Delivery appears as `DRAFT`.
- Completing the delivery succeeds.
- Delivery status becomes `COMPLETED`.
- Inventory quantity decreases by the delivery quantity.
- A stock movement with type `OUT` is created.
- Dashboard and inventory data refresh correctly.
