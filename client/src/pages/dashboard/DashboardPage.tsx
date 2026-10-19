import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../../components/ui/chart";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { getDashboardSummary, type DashboardSummary } from "../../services/dashboardService";

const productChartConfig = {
  quantitySold: { label: "Quantity sold", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const demandChartConfig = {
  quantityDemanded: { label: "Quantity demanded", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

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

  const topProducts = summary.topSellingProducts.slice(0, 8);
  const demandedProducts = summary.productsInDemand.slice(0, 8);

  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Overview" title="Dashboard" description="A quick view of your bakery distribution operations." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="surface dashboard-panel min-w-0" aria-labelledby="top-selling-heading">
          <div className="dashboard-panel-heading"><div><h3 id="top-selling-heading">Top selling products</h3><p className="panel-caption">Highest quantities sold</p></div><span aria-hidden="true">↗</span></div>
          {topProducts.length ? (
            <ChartContainer config={productChartConfig} className="mt-4 h-[280px] w-full aspect-auto">
              <BarChart accessibilityLayer data={topProducts} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="productName" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-18} textAnchor="end" height={62} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="quantitySold" fill="var(--color-quantitySold)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : <p className="dashboard-empty">No completed deliveries yet. Sales activity will appear here.</p>}
        </section>
        <section className="surface dashboard-panel min-w-0" aria-labelledby="demand-heading">
          <div className="dashboard-panel-heading"><div><h3 id="demand-heading">Products in demand</h3><p className="panel-caption">Items currently requested</p></div><span aria-hidden="true">⌁</span></div>
          {demandedProducts.length ? (
            <ChartContainer config={demandChartConfig} className="mt-4 h-[280px] w-full aspect-auto">
              <BarChart accessibilityLayer data={demandedProducts} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="productName" type="category" tickLine={false} axisLine={false} width={112} tick={{ fontSize: 11 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="quantityDemanded" fill="var(--color-quantityDemanded)" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ChartContainer>
          ) : <p className="dashboard-empty">No pending demand yet. New requests will appear here.</p>}
        </section>
      </div>
    </section>
  );
}

export default DashboardPage;
