# Falcore Inventory Workbook Analysis and Implementation Plan

## Purpose and source of truth

The client’s workbook, **FALCORE INVENTORY AS OF OCTOBER 04, 2026.xlsx**, is the final manual inventory input to migrate into this system. This document records the workbook analysis and a safe plan for representing it through the existing Product, Inventory, and Stock Movement flow. Workbook contents are business data; any notes or instructions written in cells are treated as source data to review, not as instructions for system changes.

The workbook is dated **October 04, 2026**. Preserve that as the inventory snapshot/effective date in import metadata or notes. Do not present the date the data is entered into the app as the date the counts were taken.

## Workbook structure

| Sheet | Contents | Interpretation |
|---|---|---|
| `STOCK REPORT.` | 12 named product rows with current counts in Agan Warehouse and Falcore Store, computed combined current inventory, receipts, and sell-out figures/remarks | The main opening-balance source. The combined current quantity is `Agan Warehouse + Falcore Store`. |
| `FALCORE RECEIVED STOCKS` | 12 populated receipt lines (rows 3–14), delivery receipt number/date, product/packing, production and expiry dates, received quantity/unit, cost and notes | A receipt ledger, but incomplete as a full movement history. Repeated DR numbers represent multiple item lines; some receipt quantities and notes conflict. The system has no supplier/lot/expiry fields in its current inventory or stock movement model. |
| `SELL OUT` | Column headings only; no transaction rows | A future sell-out data format, not a populated sales history. Existing Sales are generated from completed deliveries. Do not import sales from this blank template. |

## Supplier Stocks / Supplier Receipts: recommendation and output design

The `FALCORE RECEIVED STOCKS` sheet is an inbound receiving register: it records quantities Falcore received against delivery receipt numbers, with the supplier identified in the current workbook as FY. Renaming this area to **Supplier Stocks** is understandable, but can be misread as stock owned or held by the supplier. The clearest user-facing title is **Supplier Receipts** or **Stock Received from Suppliers**. If the client prefers “Supplier Stocks,” use a subtitle such as “Received from supplier” and identify the supplier on every receipt line.

This is a supplier receiving/purchase history view, not the live inventory balance. A supplier receipt adds stock once. Live on-hand stock is shown in Inventory and changes through stock movements/delivery completion. Keep those concepts visually distinct so a receipt total or historical sell-out is not mistaken for the current balance.

### Recommended column set for the requested output

The client’s proposed 13-column layout is a useful source-faithful report. For a system screen, group it into receipt details, batch/cost details, and stock/sales context. Correct the workbook typo `QUANITY` to `QUANTITY`. Prefer `Supplier` and `Delivery Receipt #` as separate fields rather than putting supplier shorthand `FY` into the receipt-number heading.

| Proposed display column | Source / meaning | Recommendation and system fit |
|---|---|---|
| Supplier | Currently implied by `FY DR#`; FY is the supplier | Show supplier name separately. The current system has no Supplier model or supplier API, so this is a reporting/import field only until supplier support exists. Confirm whether `FY` is the supplier’s full display name. |
| Delivery Receipt # | The `DR#` part of `FY DR#` | Keep as a reference; several product rows can share one DR number, so it is not a unique row key. Example: DR313258 has multiple item lines. |
| Date Received | Receipt date from workbook | Preserve as the receipt’s business date. Current StockMovement has `createdAt` only and cannot store a separate historical receipt date. |
| Item Name | Received product | Match to a canonical Product. Resolve spelling/spacing variations deliberately. |
| Packing | Pack configuration such as `25 KG X 1` | Display useful product detail, but the current Product model has no packing field. Do not silently put packing into unit or price. |
| Production Date | Batch production date | Useful traceability/lot data; unsupported as a structured field today. |
| Expiry Date | Batch expiry date | Important for expiry tracking, but unsupported as a structured field today. Requires a future approved lot/expiry capability to persist/filter reliably. |
| Quantity Received | Quantity on this receipt line | Integer operational quantity, with unit. Do not aggregate receipt rows when a shared DR has multiple items. |
| Unit | Bags, cases, pails, etc. | Must match the Product unit. In the current system this is the product-level unit. |
| Unit Cost | Cost per received unit | Receipt cost, not the Product selling price. Current movement model has no unit-cost field. Keep in a supplier receipt ledger if cost history is needed. |
| Total Amount | Quantity Received × Unit Cost | Can be a calculated display value, with currency shown as PHP if confirmed. Existing formula has floating-point precision artifacts (e.g. 244785.09999999998); display rounded to 2 decimals. Confirm whether discounts, credits, tax, or partial receipts change the calculation. |
| Status | Current free-text payment/credit/receipt notes in workbook | Rename to `Receipt / Payment Notes` or split into `Receipt Status` and `Payment Status`. Current cells contain notes such as paid in full, credit note, and quantity discrepancy, which are not one consistent status. Do not infer a controlled status without a defined list. |
| Daily / Monthly Sell Out | Workbook sell-out context, not a property of receiving a supplier line | Do not store this on each supplier receipt. Show sell-out in a separate sales report/time-period view based on completed deliveries. The provided SELL OUT sheet is empty. Current data only has a summarized period column/remarks on the stock report. |
| Stock Inventory | Current stock context | Do not make this a manually editable receipt field. Show current on-hand from Inventory as a separate linked/current value (or a separate inventory report). It can become stale and location-specific values are unsupported in the current schema. |

### Suggested screen/report organization

A practical first version should keep one Supplier Receipts table with these columns: `Supplier`, `Delivery Receipt #`, `Date Received`, `Item`, `Packing`, `Quantity Received`, `Unit`, `Unit Cost`, `Total Amount`, and `Receipt / Payment Notes`. Put `Production Date` and `Expiry Date` in a batch/details expansion if retained. Put `Daily / Monthly Sell Out` and `Stock Inventory` in separate linked Sales and Inventory views, rather than repeating them as editable values on receipt rows. If the client specifically requires the full 13-column printout, generate it as a read-only report with clearly labeled as-of dates for stock and sales, and mark the unsupported/uncertain fields rather than inventing data.

For an accurate receipt register, recommended row identity is an internal receipt-line ID, not DR number alone. A later supplier feature should represent a receipt header (supplier, DR number, received date, payment/status metadata) and one or more product lines (product, quantity, unit cost, amount, batch production/expiry details). That is a future capability, not something the current `StockMovement` table can safely stand in for: movements have no supplier, DR date, cost, batch, or expiry fields. Do not create duplicate or implied Supplier functionality in the frontend without a matching approved backend data contract.

### How a confirmed supplier receipt should affect stock

When staff records a new supplier delivery after go-live, the business event is one receipt and the stock effect should be one `IN` movement with reason `PURCHASE` for each product line. Use the DR number as the movement reference, with supplier and receipt date in notes while there are no dedicated fields. Keep the receipt quantity a positive integer. Do not add a separate manual inventory quantity update for the same receipt. The current API does not retain unit cost, line amount, supplier as a relation, lot dates, or historical receipt date, so it can update on-hand stock but cannot provide the complete requested Supplier Receipts table or reliable valuation/expiry reporting.

For the October 04 opening snapshot, do not replay the 12 historical receipt lines as new `PURCHASE` movements on top of the approved current balances. That would double-count stock. Import the approved on-hand opening quantity once, and treat the receipt history as a separate migration only after its discrepancies and supported fields have been resolved.
## Current inventory snapshot (as written in the stock report)

Quantities below use each workbook row’s stated unit. They should not be added across products because units differ. `Current total` is the sum of the two location columns in the workbook, not an independently counted number.

| # | Product (stock report spelling) | Packing | Unit | Agan | Falcore Store | Current total | Workbook received total | Sell-out shown | Notes / concern |
|---:|---|---|---|---:|---:|---:|---:|---:|---|
| 1 | COTTAGE BUTTERMILK PASTILLAS 25KG X1 | 25 KG X 1 | BAGS | 115 | 30 | 145 | 225 | 80 BAGS | 145 + 80 = 225. |
| 2 | ASI 33 MOLD INHIBITOR 1KG X10 | 1 KG X 10 | CASES | 4 | 25 | 29 | 33 | 4 | 29 + 4 = 33. |
| 3 | FRYMATE DEEP FRYING FAT 1KG X 12 | 1 KG X 12 | CASES | 0 | 10 | 10 | 10 | 0 | Reconciles. |
| 4 | LA CREMA BUTTER OIL SUBSTITUTE 13KG X 1 | 13 KG X 1 | PAILS | 9 | 10 | 19 | 20 | 1 | 19 + 1 = 20. |
| 5 | LA CREMA CONDENSED MILK 1KG X 12 | 1 KG X 12 | CASES | 0 | 0 | 0 | 20 | 20 | Reconciles. |
| 6 | EVEREST SHORTENING 40 KG X 1 | 40 KG X 1 | PAILS | 28 | 12 | 40 | 55 (raw sheet total) | 10 | D&N cell says 25, with note “ACTUAL STOCKS RECEIVED: 20 PAILS”. Using 20, 30 + 20 - 10 = 40. Confirm before importing receipts. |
| 7 | EVEREST MARGARINE 11 KG X 1 | 11 KG X 1 | PAILS | 0 | 24 | 24 | 32 | 8 | Reconciles. |
| 9 | OBRIM BREAD IMPROVER | 1 KG X 12 | CASES | 8 | 3 | 11 | 4 | 0 | Current stock exceeds listed receipts by 7. Likely prior/opening stock, but source does not explain it. |
| 10 | LA CREMA FUDGE CARAMEL | 1 KG X 12 | CASES | 0 | 25 | 25 | 40 | 15 | Reconciles. |
| 11 | LA CREMA FUDGE YEMA | 1 KG X 12 | CASES | 0 | 0 | 0 | 40 | 40 | Reconciles. |
| 12 | AVALONE OYSTER SAUCE | 2.3 KG X 6 | CASES | 0 | 23 | 23 | 9 (marked “PLEASE CLARIFY”) | “19 CASES (17 SOLD. & 2 CASES FOR SAMPLING)” is in the sell-out column. Receipt, sales/sampling, and current counts do not reconcile clearly. |
| 13 | QUEENSLAND SKIMMED MILK POWDER 25 KG X 1 | 25 KG X 1 | BAGS | 1 | 0 | 1 | 2 | 1 | Remark says “1 BAG RETURND TO NAS”; relationship of return to the current count is unclear. |

Workbook row number 8 is absent from the numbering (rows jump from product #7 to #9). There are 12 populated product lines, numbered #1–#7 and #9–#13. Do not invent a missing #8 product. The stock report’s formula column G computes the two locations’ sum for populated rows; blank rows beneath the list contain formulas yielding zero, not additional products.

### Reconciliation findings

- The combined current counts reconcile to receipts less stated sell-out for at least 9 of the 12 rows when the Everest Shortening note is used instead of its raw D&N quantity.
- **Everest Shortening** has a clear raw cell conflict: D&N stock is 25, the note says actual received is 20. The total receipt formula counts 25, but the current balance reconciles using 20.
- **Avalone Oyster Sauce** is explicitly marked for clarification. “17 sold + 2 sampling” equals the reported 19 sell-out, while the receipt total is 9 (also marked for clarification) and the current quantity is 23. Do not infer a correction.
- **Queensland Skimmed Milk Powder** has a return note but the counted quantity does not reconcile unambiguously with receipts and sales.
- **Obrim Bread Improver** has 11 on hand but only 4 listed received and no sell-out. Its starting balance/history is missing.
- Some receipt product names differ from the stock report, including `EVERESTSHORTENING` (no space). Match by reviewed product identity/packing, not naïve exact text alone.
- Receipt dates, DR numbers, production/expiry dates, costs, and payment/credit notes are useful source detail but current schema cannot preserve most of these as structured receipt/lot data. Do not discard the workbook; retain it as the original supporting source if the client’s retention process permits.

## How this maps to the current system

The system already separates products from inventory:

- `Product` holds name, description, unit, price, and status. It has no packing field. Current product records do not include stock quantities.
- `Inventory` has one row per product, one quantity, and one minimum-stock threshold. There is no warehouse/store or stock-location field. Therefore the two workbook locations cannot be represented separately with the current model.
- `StockMovement` records type, reason, quantity, reference, notes, and creation time. It cannot store DR received date, supplier, unit cost, production/expiry date, or a historical effective timestamp.
- The current Product and Inventory frontend pages already exist. The Inventory page provides explicit inventory setup for active products without inventory and adds stock through a `PURCHASE` stock-in movement. Operational quantity entry is integer-based in this page.
- Product creation does not automatically create Inventory. Inventory lists only inventory records, so an active product appears there after an Inventory record has been created.
- Delivery completion already owns the sale/stock-out flow. Do not replay workbook sell-out quantities as delivery completions or create a separate sale record.

Relevant implementation references (inspect before future coding):

- `server/prisma/schema.prisma` — current Product, Inventory, StockMovement, Delivery, and Order fields.
- `server/src/features/inventory/inventory.routes.ts`, `inventory.validation.ts`, `inventory.service.ts` — inventory endpoints and constraints.
- `server/src/features/stock-movements/stock-movement.routes.ts`, `stock-movement.validation.ts`, `stock-movement.service.ts` — movement endpoints and quantity effects.
- `server/src/features/products/product.routes.ts` and `product.service.ts` — product API; product creation creates no inventory row.
- `server/src/features/deliveries/delivery.routes.ts` and delivery service — existing completion flow.
- `client/src/pages/products/ProductsPage.tsx` — catalog UI.
- `client/src/pages/inventory/InventoryPage.tsx` — inventory setup, counts, stock-in, and movement view.
- `client/src/services/inventoryService.ts`, `stockMovementService.ts`, `productService.ts` — existing API calls.

### Existing API contracts and permissions

| Operation | Existing endpoint | Request shape / behavior | Required permission |
|---|---|---|---|
| List products | `GET /api/products` | Returns product records; supports status filtering | `products.read` |
| Create product | `POST /api/products` | `{ name, description?, unit, price }`; no quantity and no automatic inventory | `products.create` |
| List inventory | `GET /api/inventory` | Returns only existing inventory rows | `inventory.read` |
| Initialize inventory | `POST /api/inventory` | `{ productId, quantity, minimumStock }`; rejects negative values, inactive products, and duplicate product inventory | `inventory.create` |
| Update minimum stock | `PUT /api/inventory/:id` | `{ quantity?, minimumStock? }`; quantity can be directly changed by API, so do not use this for routine stock receipts | `inventory.update` |
| List movements | `GET /api/stock-movements` | Existing inventory movement records | `inventory.read` |
| Record movement | `POST /api/stock-movements` | `{ inventoryId, type, reason, quantity, reference?, notes? }`; positive quantity required. `IN` adds, `OUT` subtracts, `ADJUSTMENT` sets inventory quantity to the supplied quantity (absolute resulting balance) | `inventory.update` |
| Complete delivery | `PATCH /api/deliveries/:id/complete` | Existing delivery completion action performs the established stock/sales flow | Delivery route currently has no visible auth/permission middleware in its route file; inspect global wiring before any future changes. |

The Administrator role is seeded with all seeded permissions, including `inventory.read`, `inventory.create`, and `inventory.update`. Other roles need their actual role-permission assignments checked in the running system; do not assume every user can import, initialize inventory, or record movements. API route authorization remains authoritative.

## Recommended client-approved behavior

### Initial migration

1. Treat the **current combined quantity as of October 04, 2026** as the opening balance for each of the 12 products, unless the client explicitly requests location-level stock. The present schema supports one quantity per product, so the safe system representation is one total quantity per product. This loses the Agan versus Falcore Store split for operational reporting; explicitly surface this limitation and preserve the original workbook as the location detail source. If location tracking is a required final client outcome, pause the import design for a separate scoped data-model decision rather than silently combining locations.
2. Create/match the 12 catalog products using the stock report names and units. Preserve packing information in the product name or description only if the client accepts that display convention; there is currently no dedicated packing field. Set product selling prices only from an approved product/pricing source; this workbook lists received unit costs, which are not sale prices. Do not map unit cost into Product price.
3. Initialize one Inventory row per active product. The workbook provides no minimum-stock thresholds; use zero only if accepted as an explicit temporary default, otherwise obtain thresholds from the client before final setup.
4. Apply the 12 opening quantities through an auditable, reviewed migration procedure. The current inventory creation endpoint accepts an initial quantity; alternatively a stock `ADJUSTMENT` movement sets the resulting balance (not a delta). Choose one approach and avoid doing both. If a movement is used, make the October 04 snapshot date and source workbook clear in its notes/reference because the API records creation time, not a backdated effective date. Do not fabricate `PURCHASE` movements for opening stock.
5. Do not import receipt lines as historical stock-ins or sell-out lines as historical sales until the client has resolved the noted discrepancies and confirmed the desired history period. Importing both the current balance and past receipt/sale movements would double-count stock. Current schema also cannot faithfully store the receipt lot and expiry details.

### Future user workflow

- Keep Product creation limited to catalog fields; after creation, provide a clear inventory setup step with initial quantity `0` for products entering business after migration.
- For ordinary receipts after cutover, use the existing stock-in API (`IN` + `PURCHASE`) through Inventory. Do not directly edit quantity for receipts.
- Complete deliveries through the existing delivery completion flow; do not manually create `OUT`/`SALE` movements as well.
- Keep the stock report’s two-location breakdown visible in migration/reconciliation documentation until location-aware inventory is explicitly supported.
- Keep minimum-stock thresholds configurable and set only from client-approved values.

## Import safeguards and acceptance criteria

Before writing any inventory data, prepare a preview/mapping with product name, unit, packing, Agan quantity, Falcore Store quantity, proposed combined opening balance, duplicate/existing product match, and source-row reference. Require a human review of ambiguous matches and all exceptions. Validate that:

- Exactly 12 named rows are considered; blank formula rows and missing item #8 are excluded.
- Every product has one approved canonical identity and unit; receipt spelling variations are resolved deliberately.
- Each proposed opening quantity equals the two current-location figures added together and is a nonnegative integer.
- No existing product or inventory row is duplicated. Existing balances are compared before any update; never rerun an import in a way that adds the opening quantity again.
- Existing stock transactions are not replayed along with opening balances.
- The four flagged exceptions (Everest Shortening, Avalone Oyster Sauce, Queensland return, Obrim starting balance) are reviewed, with a recorded client disposition. The source itself resolves Everest Shortening only provisionally via a note.
- No sales price is derived from receipt cost, no minimum threshold is invented without approval, and no fabricated sale/customer/delivery history is created.
- Post-import system quantities reconcile to the approved opening-balance preview product by product, using integer units and the October 04 effective snapshot date.
- The final reconciliation reports current total quantities by product and retains the workbook’s location split as a reference.

## Outstanding client decisions before import is treated as final

1. Is the requested system inventory a combined quantity, or must Agan Warehouse and Falcore Store remain independently visible and transactable?
2. Confirm Everest Shortening actual D&N receipt: 20 pails per note or 25 pails per cell/formula.
3. Clarify Avalone Oyster Sauce: is the 9 a receipt quantity, and how should 17 sold plus 2 sampling relate to the 23 current cases?
4. Clarify Queensland’s one-bag return to NAS and the one-bag current balance.
5. Explain Obrim’s 7-unit prior balance or approve 11 as the authoritative October 04 count regardless of incomplete receipt history.
6. Provide minimum-stock thresholds, or approve temporary zero thresholds.
7. Confirm whether the receipt register and sell-out history need migration. If yes, define the history cut-off and approve how to handle source discrepancies and unsupported lot/location details.
8. Approve a source for product selling prices; workbook unit costs are not selling prices.

## Scope for subsequent implementation

This document is an analysis and migration plan only. No application behavior or workbook data has been changed. The safest next implementation step is a reviewed import specification or controlled one-time import workflow using the existing Product/Inventory/Stock Movement contracts. Keep any future code changes scoped to the explicitly approved product, inventory, and import surfaces. Do not add backend entities or location/lot/expiry tracking as a hidden assumption; those require a separate client-approved scope because the current schema cannot represent them.

