# FY and Falcore Business Workflow Requirements

> **Document purpose:** This is a business-requirements reference for the future development of BDMS. It summarizes the workflow described in the FY and Falcore inventory-tracking requirements. It is not an implementation plan, and none of the requirements below should be treated as authorization to build them immediately.

## 1. Business objective

The main objective is to keep an accurate record of products supplied to the business, the quantities received, and the stock remaining after deliveries.

The system should make it possible to determine:

- How much stock was available at the beginning of a period.
- Which supplier provided each product.
- How much of each product was received during the period.
- How much was delivered or otherwise removed from available stock.
- How much stock remains at the end of the period.

The system should maintain reliable transaction history so that inventory balances and operational reports can be checked.

## 2. Supplier and product records

The business needs to identify the suppliers that provide its products.

A future supplier record may contain:

- Supplier name.
- Contact person and contact details, when available.
- Address or other relevant notes.
- Active or inactive status.

Products should be recorded in the product master list. Where applicable, the business should be able to identify which supplier provides a product. A product may need to be associated with more than one supplier if the real business workflow allows it.

Supplier information identifies **who provides the product**. It should not be confused with the product itself or with the inventory balance.

## 3. Stock receiving

Whenever products are received from a supplier, staff should record the actual receipt.

A receiving record should capture, as applicable:

- Date received.
- Supplier.
- Product.
- Quantity received.
- Reference or delivery document number.
- Notes.

Receiving a product increases its available inventory. The system should preserve the receiving history instead of relying only on a manually overwritten stock balance.

Only quantities that were actually received should be posted to inventory. The system must not invent supplier deliveries, quantities, prices, or costs.

### 3.1 Supplier-source stock tracking

After a supplier delivers products to the business warehouse and the receipt is accepted, the stock becomes the business's inventory. Supplier information is retained to identify the source of each received quantity; this is not consignment tracking and does not mean the stock remains owned by or stored at the supplier.

The business wants to track both:

- The total remaining quantity of each product in its warehouse.
- The remaining quantity attributable to each supplier/source from which that product was received.

For example, if the warehouse receives 100 units of a product from FY and 50 units of the same product from DNS, BDMS should be able to show a total of 150 units while also showing the separate FY and DNS source balances. These figures are illustrative only.

A receipt should therefore remain identifiable as a source batch or receipt record. Stock issued through a completed customer delivery must reduce both the product's total warehouse balance and the appropriate source balance.

### 3.2 Stock allocation rule

The agreed allocation policy is **FIFO with manual override**:

1. By default, BDMS should allocate stock from the oldest eligible receipt/source first (First In, First Out).
2. Staff may manually choose a different available source when they know which source's physical stock was used or when an operational reason requires it.
3. A manual selection must not allocate more than the available balance of that source.
4. The system must retain the source allocation against the delivery so the remaining balance for each source can be calculated and audited.
5. Regardless of source allocation, the total product inventory must be reduced by the total quantity delivered.

The business should be able to review received, allocated/delivered, and remaining quantities by supplier/source. FIFO is the default allocation behavior; it does not mean stock is physically separated in the warehouse.

## 4. Starting and ending inventory

The business needs to know the starting and ending quantity of each product for a selected reporting period.

- **Starting inventory (opening stock):** the verified quantity available at the beginning of the period.
- **Stock received:** the total quantity received during the period.
- **Stock delivered:** the total quantity issued or delivered during the period.
- **Stock adjustments:** documented corrections for approved discrepancies, damage, loss, or other valid reasons.
- **Ending inventory (closing stock):** the quantity remaining at the end of the period.

The basic calculation is:

```text
Ending Inventory =
    Starting Inventory
    + Stock Received
    - Stock Delivered
    +/- Approved Stock Adjustments
```

The ending inventory of one period becomes the starting inventory of the next period, subject to the business's stock-count and period-closing process.

The system should retain the period, product, quantities, and supporting transaction records used to calculate each balance. Staff should be able to compare the calculated balance with a physical stock count and record an authorized adjustment when necessary.

## 5. Deliveries and customer records

When products are delivered to customers, the business needs a delivery record that identifies:

- Delivery date.
- Customer.
- Delivery Receipt (DR) or reference number.
- Products and quantities delivered.
- Relevant status and notes.

Completed deliveries reduce available inventory. The same delivery must not deduct stock more than once. The source or receipt allocation used for each delivered quantity must also be recorded according to the FIFO-with-manual-override rule above.

Customer records should contain the information needed to identify customers and associate their deliveries and payments with the correct account.

## 6. Payments and outstanding balances

Where customer payments are tracked in BDMS, payment records should be associated with the relevant customer and, where applicable, delivery or sales transaction.

The business needs to distinguish:

- Total amount charged.
- Payments received.
- Remaining balance.
- Fully paid and partially paid transactions.

Payment records should preserve payment dates, amounts, and references. The system should not treat an unpaid or partially paid delivery as though payment had been received.

## 7. Expected reports

The original requirements describe operational reports that help the business review stock, deliveries, and customer accounts. Future BDMS reporting may include:

### Inventory reports
- Starting inventory by product.
- Quantity received by product and supplier.
- Quantity delivered by product.
- Approved stock adjustments.
- Ending inventory by product.
- Physical count versus recorded balance.
- Low-stock and out-of-stock products.
- Remaining stock by product and supplier/source.

### Supplier reports
- Supplier directory and status.
- Products associated with each supplier.
- Receiving history by supplier.
- Total quantities received from each supplier over a selected period.
- Delivered/allocated and remaining quantities by supplier/source.

### Delivery and customer reports
- Delivery Receipt register.
- Delivered products and quantities.
- Delivery history by customer.
- Customer transaction summaries.
- Source allocation details for delivered stock, where needed for traceability.

### Payment reports
- Payments received over a selected period.
- Paid and partially paid transactions.
- Outstanding customer balances.

### Dashboard summaries
- Current inventory totals.
- Stock received and delivered during a selected period.
- Low-stock items.
- Delivery activity.
- Payments received and outstanding balances.

Reports should support date and relevant supplier, product, or customer filters. Totals should be traceable to the underlying records.

## 8. Important business rules

1. Record actual supplier receipts; do not increase inventory merely because a supplier is listed for a product.
2. Keep supplier, product, receiving, delivery, and payment records distinct.
3. Inventory balances must be supported by recorded stock transactions.
4. Opening stock must come from a confirmed starting count or approved opening balance, not an invented quantity.
5. Ending stock must be calculated from the opening balance and the period's recorded movements and adjustments.
6. A completed delivery must reduce inventory only once.
7. Corrections to posted stock records should be traceable; historical transactions should not be silently overwritten.
8. Quantities must follow the business's confirmed unit and whole-number rules.
9. Do not invent product prices, costs, quantities, supplier details, or customer payment information.
10. Any distinction between FY-owned stock, FY-supplied stock held by Falcore, and Falcore-purchased stock should only be tracked if the business confirms that ownership/source affects how stock is recorded, reported, or reconciled.
11. Supplier/source attribution records where received stock came from; after acceptance into the warehouse, the stock is the business's inventory and must be included in the total warehouse balance.
12. Delivery allocation follows FIFO by default, with staff permitted to override the source selection. Allocations must not exceed the selected source's available balance and must remain traceable to the delivery.

## 9. Scope and implementation note

This document captures the business workflow and reporting needs as a reference for BDMS. It does not require a separate Excel system, a particular worksheet layout, or immediate implementation of every report.

BDMS features should continue to be developed in the agreed project sequence. When the relevant inventory, supplier, delivery, customer, payment, or reporting feature is scheduled, the team should confirm the applicable business rules against the actual workflow before designing or changing the database, API, or user interface.

The first practical priority for this workflow is to maintain supplier and product information and record actual stock received, so that starting inventory, stock movements, and ending inventory can be calculated accurately.
