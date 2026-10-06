import { STATUS_COLORS, STATUS_LABELS } from "@/lib/format";
import type { LucideIcon } from "lucide-react";

/** En-tête des pages de l'espace membre / back-office (sur-titre + titre Fraunces + actions) */
export function PageHeader({ title, subtitle, action, eyebrow = "Espace membre" }: { title: string; subtitle?: string; action?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{eyebrow}</p>
        <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-ink md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`chip ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}>{STATUS_LABELS[status] ?? status}</span>;
}

/** Carte d'indicateur (style du tableau de bord Beach Tennis Bénin) — tone "navy" = carte sombre mise en avant */
export function StatCard({ label, value, icon: Icon, hint, tone = "sky" }: { label: string; value: string; icon: LucideIcon; hint?: string; tone?: "navy" | "lime" | "clay" | "sky" }) {
  const dark = tone === "navy";
  const iconTone = { navy: "bg-lime text-ink", lime: "bg-lime-light text-accent-700", clay: "bg-orange-50 text-orange-600", sky: "bg-brand-light text-brand" }[tone];
  return (
    <div className={`rounded-[1.75rem] p-6 ${dark ? "bg-ink text-white shadow-xl shadow-ink/20" : "border border-ink/[0.08] bg-white shadow-sm"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${dark ? "text-white/60" : "text-ink/50"}`}>{label}</p>
        <span className={`rounded-xl p-2.5 ${iconTone}`}><Icon size={18} /></span>
      </div>
      <p className={`tabular mt-4 text-3xl font-extrabold tracking-tight ${dark ? "text-white" : "text-ink"}`}>{value}</p>
      {hint && <p className={`mt-1 text-xs ${dark ? "text-white/50" : "text-muted"}`}>{hint}</p>}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card p-12 text-center text-muted">{children}</div>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-cloud">
      <div className="h-full rounded-full bg-gradient-to-r from-brand to-lime-dark" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
