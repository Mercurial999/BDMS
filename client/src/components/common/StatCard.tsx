import { AlertTriangle, CheckCircle2, Package, Truck } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  tone?: "warm" | "green" | "red" | "blue";
}

const cardIcons = {
  warm: Package,
  green: CheckCircle2,
  red: AlertTriangle,
  blue: Truck,
};

function StatCard({ label, value, tone = "warm" }: StatCardProps) {
  const Icon = cardIcons[tone];

  return (
    <div
      className={`stat-card stat-card-${tone} group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <strong className="mt-3 block text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </strong>

          <p className="mt-2 text-xs text-slate-400">
            Current overview
          </p>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
            tone === "red"
              ? "bg-red-50 text-red-600"
              : tone === "green"
                ? "bg-emerald-50 text-emerald-600"
                : tone === "blue"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 h-1 ${
          tone === "red"
            ? "bg-red-500"
            : tone === "green"
              ? "bg-emerald-500"
              : tone === "blue"
                ? "bg-blue-500"
                : "bg-amber-500"
        }`}
      />
    </div>
  );
}

export default StatCard;