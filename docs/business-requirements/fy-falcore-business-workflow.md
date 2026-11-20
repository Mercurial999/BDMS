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

BDMS should track money actually received from customers and the remaining amount owed for completed customer transactions. Payment arrangements, payment methods, and individual payment records must be represented distinctly.

### 6.1 Payment arrangements and methods

The business may use either of these payment arrangements:

- **Cash on delivery (COD):** the customer is expected to pay when the goods are delivered.
- **Credit terms:** the customer is allowed to pay within an agreed period, such as 15 days, 30 days, or another period agreed with the business.

Payment arrangements describe when payment is due. They are separate from the method used to pay. The initial supported payment methods are:

- Cash.
- Bank transfer.

Customer records may contain default payment terms for reference. The actual agreed terms and applicable due date must be recorded with each transaction so that later changes to a customer's default terms do not alter existing transaction history.

### 6.2 Recording payments

Each recorded payment should preserve, at minimum:

- Customer and the order/delivery transaction to which the payment is applied.
- Amount received.
- Date received.
- Payment method.
- Staff member who recorded the payment.
- Relevant notes or reference information.

For a bank transfer, record the bank name and the bank transaction/reference number. A reference number alone does not prove that funds were received. Staff must verify that the transfer has actually been received before recording it as a received payment.

### 6.3 Partial and multiple payments

A transaction may be settled through multiple payments. For example, a customer may pay part of an amount by bank transfer, make another transfer later, and pay the remainder in cash.

BDMS should:

- Allow partial payments.
- Preserve each payment as a separate record, including its date, amount, method, and recorder.
- Automatically calculate the remaining balance from the transaction's final amount less the payments received.
- Identify a transaction as unpaid, partially paid, or fully paid.
- Mark a transaction fully paid only when its remaining balance reaches zero.

An overdue condition is separate from the payment status. A transaction is overdue when its due date has passed and a balance remains outstanding.

### 6.4 Payment allocation scope

For the initial workflow, staff will record each payment against one order/delivery transaction at a time. Multiple payments may be recorded against that same transaction.

The business may later need to apply one payment, such as a single bank transfer, across multiple orders. This is a future capability and is not required in the initial workflow. The design should avoid unnecessarily preventing that extension, but the initial user interface and process should remain focused on one transaction per payment record.

### 6.5 Outstanding balances

Outstanding balances must be based on the final transaction amount after any applicable discount, less all payments actually received and allocated to that transaction.

Completing a delivery confirms that goods were delivered; it does not confirm that the customer paid. Delivery completion must not automatically mark a transaction as paid.

## 7. Customer discounts

BDMS should support percentage-based customer discounts that staff may deliberately apply while processing an order.

- The initial discount type is percentage only.
- Discounts are applied manually during order processing by staff with the appropriate permission.
- A customer being regular or having a good payment history must not automatically trigger a discount.
- A customer record may optionally store a reference discount percentage, but this value is not applied automatically. Staff must choose to apply the discount to a particular order.
- The system must preserve the original amount, discount percentage, calculated discount amount, and final discounted amount. The original selling amount must not be overwritten.
- Record which staff member applied the discount and when it was applied.
- Any payment balance must be calculated from the final discounted amount, not the original amount.
- Discounts are applied during order pricing, not when a payment is recorded.
- Discount application must be permission-controlled. Specific discount limits or approval requirements can be defined by the business later.

## 8. Expected reports

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
- Payments received over a selected period, with payment dates and methods.
- Paid, partially paid, unpaid, and overdue transactions.
- Outstanding balances by customer and transaction.
- Payment history, including multiple and partial payments.

### Discount reports
- Gross amount, discount amount, and final/net amount for discounted orders.
- Discount history by customer and order.
- Discount percentage, amount, and staff member who applied it.

### Dashboard summaries
- Current inventory totals.
- Stock received and delivered during a selected period.
- Low-stock items.
- Delivery activity.
- Payments received and outstanding balances.

Reports should support date and relevant supplier, product, or customer filters. Totals should be traceable to the underlying records.

## 9. Important business rules

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
13. Completing a delivery does not mean payment has been received; delivery and payment records must remain distinct.
14. Payment arrangement (COD or agreed credit terms) is separate from payment method (initially cash or bank transfer).
15. Record a payment as received only after the business has verified that the funds were actually received.
16. Preserve each partial or multiple payment as a separate record. Calculate the remaining balance from the final transaction amount less payments received.
17. A transaction is overdue only when its due date has passed and a balance remains outstanding.
18. Changes to a customer's default payment terms must not retroactively change the terms or due date recorded for an existing transaction.
19. Discounts are percentage-based and manually applied by authorized staff during order processing; a regular-customer relationship alone must not apply a discount automatically.
20. Preserve the original amount, discount percentage, discount amount, final discounted amount, and the staff member/time associated with applying the discount.
21. Calculate payment balances using the final discounted transaction amount.

## 10. Scope and implementation note

This document captures the business workflow and reporting needs as a reference for BDMS. It does not require a separate Excel system, a particular worksheet layout, or immediate implementation of every report.

BDMS features should continue to be developed in the agreed project sequence. When the relevant inventory, supplier, delivery, customer, payment, or reporting feature is scheduled, the team should confirm the applicable business rules against the actual workflow before designing or changing the database, API, or user interface.

The first practical priority for this workflow is to maintain supplier and product information and record actual stock received, so that starting inventory, stock movements, and ending inventory can be calculated accurately.
