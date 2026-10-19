import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../../components/ui/chart";
import { getProductSales, getSalesDetails } from "../../services/reportService";
import type { ProductSalesReport, ReportDateRange, SalesDetailReport } from "../../types/report.types";

const salesTrendConfig = { sales: { label: "Sales", color: "#b45309" } } satisfies ChartConfig;
const productSalesConfig = { totalSales: { label: "Sales", color: "#0f766e" } } satisfies ChartConfig;
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

function AnalyticsCharts({ dates }: { dates: ReportDateRange }) {
  const [details, setDetails] = useState<SalesDetailReport[] | null>(null);
  const [products, setProducts] = useState<ProductSalesReport[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setDetails(null);
    setProducts(null);
    setHasError(false);
    Promise.all([getSalesDetails({ from: dates.from, to: dates.to }), getProductSales({ from: dates.from, to: dates.to })])
      .then(([salesDetails, productSales]) => {
        if (!active) return;
        setDetails(salesDetails);
        setProducts(productSales);
      })
      .catch(() => { if (active) setHasError(true); });
    return () => { active = false; };
  }, [dates.from, dates.to]);

  const trend = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const row of details ?? []) {
      const date = new Date(row.deliveryDate);
      if (Number.isNaN(date.getTime())) continue;
      const key = date.toISOString().slice(0, 10);
      byDate.set(key, (byDate.get(key) ?? 0) + Number(row.total || 0));
    }
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, sales]) => ({
      date,
      label: new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(date + "T12:00:00Z")),
      sales,
    }));
  }, [details]);

  const topProducts = useMemo(() => [...(products ?? [])].sort((a, b) => b.totalSales - a.totalSales).slice(0, 8), [products]);

  return (
    <section className="grid gap-5 xl:grid-cols-2" aria-label="Sales analytics charts">
      <div className="surface min-w-0 p-5">
        <div className="mb-2"><h2 className="text-base font-semibold text-stone-900">Sales over time</h2><p className="mt-1 text-sm text-stone-500">Daily completed sales for the selected date range</p></div>
        {details === null && !hasError ? <div className="flex h-[260px] items-center justify-center text-sm text-stone-500" aria-busy="true">Loading sales trend…</div>
          : hasError ? <p className="flex h-[260px] items-center justify-center text-sm text-red-700" role="alert">Unable to load chart data. Please try again.</p>
          : trend.length ? <ChartContainer config={salesTrendConfig} className="h-[260px] w-full aspect-auto">
            <LineChart accessibilityLayer data={trend} margin={{ left: 8, right: 12, top: 12, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(value: number) => peso.format(value)} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => peso.format(Number(value))} />} />
              <Line dataKey="sales" type="monotone" stroke="var(--color-sales)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-sales)" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ChartContainer> : <p className="flex h-[260px] items-center justify-center text-sm text-stone-500">No sales data for this date range.</p>}
      </div>
      <div className="surface min-w-0 p-5">
        <div className="mb-2"><h2 className="text-base font-semibold text-stone-900">Sales by product</h2><p className="mt-1 text-sm text-stone-500">Top products ranked by sales value</p></div>
        {products === null && !hasError ? <div className="flex h-[260px] items-center justify-center text-sm text-stone-500" aria-busy="true">Loading product sales…</div>
          : hasError ? <p className="flex h-[260px] items-center justify-center text-sm text-red-700" role="alert">Unable to load chart data. Please try again.</p>
          : topProducts.length ? <ChartContainer config={productSalesConfig} className="h-[260px] w-full aspect-auto">
            <BarChart accessibilityLayer data={topProducts} margin={{ left: 8, right: 12, top: 12, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="product" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-15} textAnchor="end" height={52} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(value: number) => peso.format(value)} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => peso.format(Number(value))} />} />
              <Bar dataKey="totalSales" fill="var(--color-totalSales)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ChartContainer> : <p className="flex h-[260px] items-center justify-center text-sm text-stone-500">No product sales for this date range.</p>}
      </div>
    </section>
  );
}

export default AnalyticsCharts;
