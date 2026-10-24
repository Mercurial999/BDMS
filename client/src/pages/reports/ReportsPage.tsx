import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import AnalyticsCharts from "./AnalyticsCharts";
import StatusBadge from "../../components/common/StatusBadge";
import {
  getCustomerSales,
  getDeliveryReport,
  getInventoryReport,
  getProductSales,
  getSalesDetails,
  getSalesReportSummary,
  getStockMovementReport,
} from "../../services/reportService";
import type {
  CustomerSalesReport,
  DeliveryReport,
  InventoryReport,
  ProductSalesReport,
  ReportDateRange,
  SalesDetailReport,
  SalesReportSummary,
  StockMovementReport,
} from "../../types/report.types";

type ReportKey = "summary" | "details" | "products" | "customers" | "inventory" | "movements" | "deliveries";
type ReportData = SalesReportSummary | SalesDetailReport[] | ProductSalesReport[] | CustomerSalesReport[] | InventoryReport[] | StockMovementReport[] | DeliveryReport[];

const reportTabs: { key: ReportKey; label: string; dates: boolean }[] = [
  { key: "summary", label: "Sales summary", dates: true },
  { key: "details", label: "Sales details", dates: true },
  { key: "products", label: "Product sales", dates: true },
  { key: "customers", label: "Customer sales", dates: true },
  { key: "inventory", label: "Inventory", dates: false },
  { key: "movements", label: "Stock movements", dates: true },
  { key: "deliveries", label: "Deliveries", dates: true },
];

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(value));
}

const rowsPerPage = 10;

type CsvValue = string | number | null;

function csvCell(value: CsvValue) {
  const text = value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadCsv(report: ReportKey, data: ReportData, dates: ReportDateRange) {
  const csvRows: CsvValue[][] = [];

  if (report === "summary") {
    const summary = data as SalesReportSummary;
    csvRows.push(
      ["Completed sales", "Quantity sold", "Total sales"],
      [summary.completedSales, summary.totalQuantitySold, summary.totalSales],
    );
  } else if (report === "products") {
    csvRows.push(["Product", "Unit", "Quantity sold", "Sales"]);
    for (const row of data as ProductSalesReport[]) csvRows.push([row.product, row.unit, row.quantitySold, row.totalSales]);
  } else if (report === "customers") {
    csvRows.push(["Customer", "Completed deliveries", "Quantity sold", "Sales"]);
    for (const row of data as CustomerSalesReport[]) csvRows.push([row.customer, row.completedDeliveries, row.quantitySold, row.totalSales]);
  } else if (report === "inventory") {
    csvRows.push(["Product", "Unit", "Current stock", "Minimum stock", "Status"]);
    for (const row of data as InventoryReport[]) csvRows.push([row.product, row.unit, row.currentStock, row.minimumStock, row.currentStock === 0 ? "OUT_OF_STOCK" : row.currentStock <= row.minimumStock ? "LOW_STOCK" : "NORMAL"]);
  } else if (report === "movements") {
    csvRows.push(["Date", "Product", "Type", "Reason", "Quantity", "Reference", "Notes"]);
    for (const row of data as StockMovementReport[]) csvRows.push([row.createdAt, row.product, row.type, row.reason, `${row.quantity} ${row.unit}`, row.reference, row.notes]);
  } else {
    csvRows.push(["Delivery", "Order", "Date", "Customer", "Status", "Items", "Total"]);
    for (const row of data as (SalesDetailReport | DeliveryReport)[]) csvRows.push([row.deliveryId, row.orderId, row.deliveryDate, row.customer, row.status, row.items.map((item) => `${item.product} (${item.quantity} ${item.unit})`).join(", "), row.total]);
  }

  const csv = csvRows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const range = dates.from || dates.to ? `-${dates.from ?? "start"}-to-${dates.to ?? "end"}` : "";
  link.href = url;
  link.download = `bdms-${report}${range}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function printReport() {
  window.print();
}

function ReportTable({ headers, rows }: { headers: React.ReactNode; rows: React.ReactNode[] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return <div className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500"><tr>{headers}</tr></thead><tbody>{visibleRows}</tbody></table></div><div className="flex items-center justify-between gap-4 border-t border-stone-200 px-4 py-3 text-sm text-stone-600"><span>Showing {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, rows.length)} of {rows.length}</span><div className="flex gap-2"><button className="rounded border border-stone-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} type="button">Previous</button><span className="px-2 py-1.5">Page {currentPage} of {pageCount}</span><button className="rounded bg-amber-700 px-3 py-1.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} type="button">Next</button></div></div></div>;
}

function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportKey>("summary");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedDates, setAppliedDates] = useState<ReportDateRange>({});
  const requestKey = `${selectedReport}:${appliedDates.from ?? ""}:${appliedDates.to ?? ""}`;
  const [reportState, setReportState] = useState<{ key: string; data: ReportData | null; error: string | null } | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const request = selectedReport === "summary" ? getSalesReportSummary(appliedDates)
      : selectedReport === "details" ? getSalesDetails(appliedDates)
        : selectedReport === "products" ? getProductSales(appliedDates)
          : selectedReport === "customers" ? getCustomerSales(appliedDates)
            : selectedReport === "inventory" ? getInventoryReport()
              : selectedReport === "movements" ? getStockMovementReport(appliedDates)
                : getDeliveryReport(appliedDates);

    void request
      .then((result) => { if (active) setReportState({ key: requestKey, data: result, error: null }); })
      .catch(() => { if (active) setReportState({ key: requestKey, data: null, error: "Unable to load this report right now." }); });

    return () => { active = false; };
  }, [selectedReport, appliedDates, requestKey]);

  const activeTab = reportTabs.find((tab) => tab.key === selectedReport);

  function applyFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from && to && from > to) {
      setFilterError("The From date cannot be later than the To date.");
      return;
    }
    setFilterError(null);
    setAppliedDates({ from: from || undefined, to: to || undefined });
  }

  const loading = reportState?.key !== requestKey;
  const error = filterError ?? (reportState?.key === requestKey ? reportState.error : null);
  const data = reportState?.key === requestKey ? reportState.data : null;

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Analysis" title="Reports" description="Sales, inventory, stock movement, and delivery reports from the backend." />
      <AnalyticsCharts dates={appliedDates} />
      <div className="flex flex-wrap items-center justify-between gap-3" role="tablist" aria-label="Report types">
        <div className="flex flex-wrap gap-2">
        {reportTabs.map((tab) => <button className={`rounded-md border px-3 py-2 text-sm ${selectedReport === tab.key ? "border-amber-700 bg-amber-700 text-white" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"}`} key={tab.key} onClick={() => setSelectedReport(tab.key)} role="tab" aria-selected={selectedReport === tab.key} type="button">{tab.label}</button>)}
        </div>
        {data && !loading && !error ? <div className="flex gap-2"><button className="rounded-md border border-amber-700 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50" onClick={() => downloadCsv(selectedReport, data, appliedDates)} type="button">Export CSV</button><button className="rounded-md bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800" onClick={printReport} type="button">Export PDF</button></div> : null}
      </div>
      {activeTab?.dates ? <form className="surface flex flex-wrap items-end gap-3 p-4" onSubmit={applyFilter}><label className="grid gap-1 text-sm text-stone-600">From<input className="rounded-md border border-stone-300 px-3 py-2 text-stone-900" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="grid gap-1 text-sm text-stone-600">To<input className="rounded-md border border-stone-300 px-3 py-2 text-stone-900" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label><button className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800" type="submit">Apply filter</button></form> : null}
      {loading ? <p className="text-stone-500">Loading report...</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {!loading && !error && data ? <ReportContent key={requestKey} report={selectedReport} data={data} /> : null}
    </section>
  );
}

function ReportContent({ report, data }: { report: ReportKey; data: ReportData }) {
  if (report === "summary") {
    const summary = data as SalesReportSummary;
    return <div className="grid gap-4 sm:grid-cols-3"><div className="stat-card stat-card-green"><p>Completed sales</p><strong>{summary.completedSales}</strong></div><div className="stat-card stat-card-blue"><p>Quantity sold</p><strong>{summary.totalQuantitySold}</strong></div><div className="stat-card"><p>Total sales</p><strong>{peso.format(Number(summary.totalSales))}</strong></div></div>;
  }
  if (report === "products") {
    const rows = data as ProductSalesReport[];
    return rows.length ? <ReportTable headers={<><th className="p-4">Product</th><th className="p-4">Unit</th><th className="p-4">Quantity sold</th><th className="p-4">Sales</th></>} rows={rows.map((row) => <tr className="border-b border-stone-100" key={row.product}><td className="p-4 font-medium">{row.product}</td><td className="p-4">{row.unit}</td><td className="p-4">{row.quantitySold}</td><td className="p-4">{peso.format(row.totalSales)}</td></tr>)} /> : <EmptyReport />;
  }
  if (report === "customers") {
    const rows = data as CustomerSalesReport[];
    return rows.length ? <ReportTable headers={<><th className="p-4">Customer</th><th className="p-4">Completed deliveries</th><th className="p-4">Quantity sold</th><th className="p-4">Sales</th></>} rows={rows.map((row) => <tr className="border-b border-stone-100" key={row.customer}><td className="p-4 font-medium">{row.customer}</td><td className="p-4">{row.completedDeliveries}</td><td className="p-4">{row.quantitySold}</td><td className="p-4">{peso.format(row.totalSales)}</td></tr>)} /> : <EmptyReport />;
  }
  if (report === "inventory") {
    const rows = data as InventoryReport[];
    return rows.length ? <ReportTable headers={<><th className="p-4">Product</th><th className="p-4">Unit</th><th className="p-4">Current stock</th><th className="p-4">Minimum stock</th><th className="p-4">Status</th></>} rows={rows.map((row) => <tr className="border-b border-stone-100" key={row.product}><td className="p-4 font-medium">{row.product}</td><td className="p-4">{row.unit}</td><td className="p-4">{row.currentStock}</td><td className="p-4">{row.minimumStock}</td><td className="p-4"><StatusBadge value={row.currentStock === 0 ? "OUT_OF_STOCK" : row.currentStock <= row.minimumStock ? "LOW_STOCK" : "NORMAL"} /></td></tr>)} /> : <EmptyReport />;
  }
  if (report === "movements") {
    const rows = data as StockMovementReport[];
    return rows.length ? <ReportTable headers={<><th className="p-4">Date</th><th className="p-4">Product</th><th className="p-4">Type</th><th className="p-4">Reason</th><th className="p-4">Quantity</th><th className="p-4">Reference</th></>} rows={rows.map((row) => <tr className="border-b border-stone-100" key={row.id}><td className="p-4">{formatDate(row.createdAt)}</td><td className="p-4 font-medium">{row.product}</td><td className="p-4"><StatusBadge value={row.type} /></td><td className="p-4">{row.reason}</td><td className="p-4">{row.quantity} {row.unit}</td><td className="p-4">{row.reference || "-"}</td></tr>)} /> : <EmptyReport />;
  }
  const rows = data as (SalesDetailReport | DeliveryReport)[];
  return rows.length ? <ReportTable headers={<><th className="p-4">Delivery</th><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Status</th><th className="p-4">Items</th><th className="p-4">Total</th></>} rows={rows.map((row) => <tr className="border-b border-stone-100" key={row.deliveryId}><td className="p-4 font-medium">#{row.deliveryId}</td><td className="p-4">{formatDate(row.deliveryDate)}</td><td className="p-4">{row.customer}</td><td className="p-4"><StatusBadge value={row.status} /></td><td className="p-4">{row.items.map((item) => `${item.product} (${item.quantity} ${item.unit})`).join(", ")}</td><td className="p-4">{peso.format(row.total)}</td></tr>)} /> : <EmptyReport />;
}

function EmptyReport() {
  return <div className="surface p-5 text-sm text-stone-500">No data found for the selected report and date range.</div>;
}

export default ReportsPage;