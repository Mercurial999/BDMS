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
    +/− Approved Stock Adjustments
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

Completed deliveries reduce available inventory. The same delivery must not deduct stock more than once.

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

### Supplier reports
- Supplier directory and status.
- Products associated with each supplier.
- Receiving history by supplier.
- Total quantities received from each supplier over a selected period.

### Delivery and customer reports
- Delivery Receipt register.
- Delivered products and quantities.
- Delivery history by customer.
- Customer transaction summaries.

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

## 9. Scope and implementation note

This document captures the business workflow and reporting needs as a reference for BDMS. It does not require a separate Excel system, a particular worksheet layout, or immediate implementation of every report.

BDMS features should continue to be developed in the agreed project sequence. When the relevant inventory, supplier, delivery, customer, payment, or reporting feature is scheduled, the team should confirm the applicable business rules against the actual workflow before designing or changing the database, API, or user interface.

The first practical priority for this workflow is to maintain supplier and product information and record actual stock received, so that starting inventory, stock movements, and ending inventory can be calculated accurately.
