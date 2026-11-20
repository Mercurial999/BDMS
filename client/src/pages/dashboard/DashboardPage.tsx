import { useEffect, useState } from "react";
import { getDashboardSummary, type DashboardSummary } from "../../services/dashboardService";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getDashboardSummary()
      .then(setSummary)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard."));
  }, []);

  if (error) return <p className="dashboard-error" role="alert">{error}</p>;
  if (!summary) return <section className="space-y-6" aria-busy="true"><PageHeader eyebrow="Overview" title="Dashboard" description="A quick view of your bakery distribution operations." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div className="stat-card animate-pulse" key={item}><div className="mb-3 h-3 w-24 rounded bg-stone-200" /><div className="h-8 w-16 rounded bg-stone-200" /></div>)}</div><p className="text-sm text-stone-500">Loading your latest operations…</p></section>;

  const cards = [
    { label: "Total products", value: summary.inventory.totalProducts, tone: "warm" as const },
    { label: "Low stock alerts", value: summary.inventory.lowStock, tone: "red" as const },
    { label: "Draft deliveries", value: summary.deliveries.draft, tone: "blue" as const },
    { label: "Completed deliveries", value: summary.deliveries.completed, tone: "green" as const },
  ];

  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Overview" title="Dashboard" description="A quick view of your bakery distribution operations." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>
      <div className="dashboard-panels grid gap-5 lg:grid-cols-2">
        <section className="surface dashboard-panel" aria-labelledby="top-selling-heading">
          <div className="dashboard-panel-heading"><div><h3 id="top-selling-heading">Top selling products</h3><p className="panel-caption">Highest quantities sold</p></div><span aria-hidden="true">↗</span></div>
          {summary.topSellingProducts.length ? <div className="dashboard-list">{summary.topSellingProducts.map((item, index) => <div className="dashboard-list-row" key={item.productName}><span className="dashboard-list-name"><span className="mr-3 text-xs text-stone-400">{String(index + 1).padStart(2, "0")}</span>{item.productName}</span><strong className="dashboard-list-value">{item.quantitySold}</strong></div>)}</div> : <p className="dashboard-empty">No completed deliveries yet. Sales activity will appear here.</p>}
        </section>
        <section className="surface dashboard-panel" aria-labelledby="demand-heading">
          <div className="dashboard-panel-heading"><div><h3 id="demand-heading">Products in demand</h3><p className="panel-caption">Items currently requested</p></div><span aria-hidden="true">⌁</span></div>
          {summary.productsInDemand.length ? <div className="dashboard-list">{summary.productsInDemand.map((item, index) => <div className="dashboard-list-row" key={item.productName}><span className="dashboard-list-name"><span className="mr-3 text-xs text-stone-400">{String(index + 1).padStart(2, "0")}</span>{item.productName}</span><strong className="dashboard-list-value">{item.quantityDemanded}</strong></div>)}</div> : <p className="dashboard-empty">No pending demand yet. New requests will appear here.</p>}
        </section>
      </div>
    </section>
  );
}

export default DashboardPage;
