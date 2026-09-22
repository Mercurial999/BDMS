You are working on the frontend of my existing Bakery Distribution Management System (BDMS).

Before changing or creating frontend pages, understand and follow the actual business flow below.

# VERY IMPORTANT

The backend is already implemented and tested.

**DO NOT MODIFY THE BACKEND.**

Do not:

* modify Prisma
* modify database models
* modify backend services
* modify backend repositories
* modify backend business logic
* create duplicate backend functionality
* create a new Sale model
* create a new inventory system

The frontend must represent and consume the existing backend functionality.

---

# CORE BUSINESS CONCEPT

The most important distinction is:

## PRODUCT ≠ INVENTORY

A Product represents **what the business sells**.

Example:

```text
Product
Name: Flour
Unit: sack
Price: ₱850
Status: ACTIVE
```

Product creation should NOT contain the current stock quantity.

Inventory represents **how much of a product the business currently has**.

Example:

```text
Inventory
Product: Flour
Quantity: 100
Minimum Stock: 20
```

Therefore:

```text
Product
    ↓
defines the product

Inventory
    ↓
tracks the quantity
```

---

# PRODUCT FLOW

The Product page is responsible for:

* product name
* description
* unit
* price
* status

Example:

```text
Products

+ Add Product

Flour
Unit: sack
Price: ₱850
Status: ACTIVE
```

Do NOT put "current quantity" inside the Add Product form.

---

# INVENTORY FLOW

Inventory tracks the current quantity of products.

Example:

```text
Inventory

Product       Quantity      Minimum Stock
Flour         100           20
Sugar         50            20
Yeast         30            10
```

The frontend should make it clear that inventory quantity is different from product information.

---

# HOW STOCK IS ADDED

When the business receives products from a supplier, staff records a stock-in operation.

Example:

```text
Supplier delivers:

50 sacks of Flour
```

The frontend should provide an appropriate Stock In operation.

Conceptually:

```text
Product: Flour
Quantity: 50
Reason: PURCHASE
```

This results in:

```text
Inventory
100 → 150
```

and creates a stock movement:

```text
Type: IN
Reason: PURCHASE
Quantity: 50
```

Do not manually modify the database from the frontend.

Use the existing backend stock/inventory API.

---

# STOCK OUT / SALES FLOW

Stock should normally be deducted when a Delivery is completed.

Example:

```text
Inventory:
Flour = 100
```

Customer receives:

```text
10 sacks Flour
```

When the delivery becomes COMPLETED:

```text
100 → 90
```

The backend automatically handles:

1. inventory deduction
2. stock movement
3. SALE reason
4. delivery completion
5. order completion when applicable

The frontend should NOT manually perform these backend operations separately.

The frontend only triggers the appropriate existing Delivery completion endpoint.

---

# BUSINESS FLOW

The complete system flow is:

```text
PRODUCT
   ↓
Create product information
   ↓
INVENTORY
   ↓
Receive stock / Stock In
   ↓
STOCK MOVEMENT
   ↓
Inventory quantity increases
   ↓
CUSTOMER
   ↓
ORDER
   ↓
PENDING
   ↓
CONFIRMED
   ↓
DELIVERY
   ↓
DRAFT
   ↓
COMPLETE DELIVERY
   ↓
Inventory automatically decreases
   ↓
Stock Movement OUT / SALE
   ↓
ORDER COMPLETED
   ↓
SALES
   ↓
REPORTS
```

---

# QUANTITY RULE

The business does not sell partial quantities.

Operational quantities are integers.

Examples:

```text
1 sack
5 sacks
20 sacks
100 sacks
```

Do not design quantity inputs around decimal quantities such as:

```text
0.5
1.5
2.5
```

Use integer quantity inputs where applicable.

---

# FRONTEND PAGES

The frontend should make the business flow understandable.

Recommended navigation:

```text
Dashboard

Products
Inventory
Stock Movements

Customers
Orders
Deliveries

Sales
Reports

Users
Roles / Permissions
```

Do not create pages that duplicate existing backend functionality.

---

# PRODUCT PAGE

Responsibilities:

```text
Create Product
View Products
Update Product
Deactivate Product
```

Do not add current inventory quantity to Product creation.

---

# INVENTORY PAGE

Responsibilities:

```text
View current stock
View minimum stock
Identify low-stock products
Access stock-in operation
```

The page should make it obvious how staff can increase inventory.

For example:

```text
Inventory

Product      Current Qty    Minimum Stock    Action
Flour        100            20               [Add Stock]
Sugar        50             20               [Add Stock]
Yeast        30             10               [Add Stock]
```

The exact UI can follow the existing project's design system.

---

# STOCK MOVEMENTS PAGE

Display inventory movements such as:

```text
IN
OUT
ADJUSTMENT
```

Reasons include:

```text
PURCHASE
SALE
DAMAGE
RETURN
MANUAL_ADJUSTMENT
```

The frontend should display the actual values returned by the backend.

Do not invent movement types or reasons.

---

# ORDERS

Orders represent customer orders.

Typical flow:

```text
PENDING
   ↓
CONFIRMED
```

Do not deduct inventory merely because an order exists.

Inventory is deducted when the related delivery is completed.

---

# DELIVERIES

Delivery represents fulfillment of an order/customer delivery.

Typical flow:

```text
DRAFT
   ↓
COMPLETED
```

or:

```text
DRAFT
   ↓
CANCELLED
```

When a delivery is completed, the backend handles the inventory deduction and stock movement.

---

# SALES

There is intentionally no separate Sale database model.

Sales come from completed deliveries.

Therefore:

```text
Completed Delivery
       ↓
Sales
```

The Sales frontend should consume the existing Sales API.

Do not create a separate frontend "sale creation" process.

---

# REPORTS

Reports use existing backend endpoints.

Available reports:

```text
Sales Summary
Sales Details
Product Sales
Customer Sales
Inventory
Stock Movements
Deliveries
```

Do not create an Order Report unless explicitly requested later.

---

# IMPORTANT FRONTEND RULE

The frontend should NOT invent business logic that belongs to the backend.

Use this principle:

```text
Frontend
  ↓
collect user input
  ↓
call API
  ↓
display backend result
```

The backend remains the source of truth for:

* inventory deduction
* delivery completion
* sales
* stock movements
* order status
* validation
* business rules

---

# BEFORE CODING

First inspect the existing frontend.

Identify:

1. Existing folder structure
2. Existing API/fetch services
3. Existing authentication handling
4. Existing routes
5. Existing Product pages
6. Existing Inventory pages
7. Existing Stock Movement pages
8. Existing Order pages
9. Existing Delivery pages
10. Existing UI components

Do not restructure the entire frontend.

Do not rewrite working code.

Add only what is necessary to complete the missing frontend flow.

---

# MOST IMPORTANT QUESTION TO SOLVE

If the current frontend allows creating a Product but there is no way to increase its quantity, do NOT add quantity to the Product form.

Instead, implement or expose the appropriate **Inventory / Stock In** workflow using the existing backend API.

The intended business model is:

```text
PRODUCT
"What is this?"

        ↓

INVENTORY
"How much do we have?"

        ↓

STOCK IN
"How much did we receive?"

        ↓

DELIVERY COMPLETION
"How much did we sell/deliver?"

        ↓

SALES / REPORTS
"What did we sell and what happened?"
```

Follow this model throughout the frontend.
