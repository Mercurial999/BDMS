14. Phase 2 — Operations Upgrade
After Phase 1 is completed and stable, we move to Phase 2.
The goal is to make the system more useful for actual business operations.
Phase 2 Features
Suppliers
Add suppliers that provide bakery ingredients.
Possible functionality:
•	Supplier records 
•	Supplier contact information 
•	Supplier status 
•	Supplier products 
________________________________________
Purchase Receiving / Stock-In
Instead of manually increasing inventory, the system can record where stock came from.
Example:
Supplier
    ↓
Purchase/Receiving
    ↓
Products
    ↓
Inventory Stock-In
    ↓
Stock Movement
Example:
Supplier: ABC Trading

Flour: 500 kg

Received Date:
August 28, 2026
________________________________________
Stock Adjustments
Allow authorized staff to correct inventory when necessary.
Examples:
•	Damaged goods 
•	Expired products 
•	Counting errors 
•	Missing stock 
•	Other approved adjustments 
Every adjustment should have a reason.
________________________________________
Returns
Eventually support:
Delivery
    ↓
Customer Return
    ↓
Return Items
    ↓
Inventory Adjustment
This is useful when a bakery store returns damaged or incorrect products.
________________________________________
Delivery Status
Add statuses such as:
PENDING
PREPARING
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURNED
The exact statuses will be decided based on the actual business workflow.
________________________________________
Audit Logs
Record important system actions.
Example:
User: John
Action: UPDATE_PRODUCT
Product: Flour
Date: August 28, 2026
This becomes particularly useful as the system grows.
________________________________________
Improved Reports
Phase 2 reports can include:
•	Daily deliveries 
•	Monthly deliveries 
•	Store delivery history 
•	Product movement 
•	Stock-in reports 
•	Stock-out reports 
•	Inventory adjustments 
•	Returns 
•	Supplier reports 
________________________________________
Stronger Permissions
Instead of only having basic roles, we can eventually have more specific permissions.
Example:
Admin
 ├── Manage Users
 ├── Manage Products
 ├── Manage Inventory
 ├── Manage Stores
 ├── Manage Deliveries
 └── View Reports

Manager
 ├── Manage Inventory
 ├── Manage Stores
 ├── Manage Deliveries
 └── View Reports

Staff
 ├── View Products
 ├── Record Deliveries
 └── View Allowed Information
The exact permissions will be designed later.
