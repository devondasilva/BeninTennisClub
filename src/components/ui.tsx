import { STATUS_COLORS, STATUS_LABELS } from "@/lib/format";
import type { LucideIcon } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-primary-400 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`chip ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}>{STATUS_LABELS[status] ?? status}</span>;
}

export function StatCard({ label, value, icon: Icon, hint, tone = "navy" }: { label: string; value: string; icon: LucideIcon; hint?: string; tone?: "navy" | "lime" | "clay" | "sky" }) {
  const tones = {
    navy: "bg-primary-400 text-white",
    lime: "bg-accent-400 text-primary-400",
    clay: "bg-orange-100 text-orange-700",
    sky: "bg-sky-100 text-sky-700",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-primary-400">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <span className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card p-10 text-center text-slate-500">{children}</div>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
