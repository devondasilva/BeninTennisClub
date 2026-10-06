import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { Plus, Users, CalendarClock, Target, ArrowRight } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { daysUntil, xof } from "@/lib/format";
import { CATEGORY, campaignTotals } from "@/lib/campaigns";
import { PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { HeartHandshake } from "lucide-react";

export const metadata = { title: "Collectes" };

export default async function FundraisingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const s = await requireSession();
  const status = (await searchParams).status ?? "ACTIVE";
  const list = await db.query.campaigns.findMany({ where: eq(t.campaigns.status, status), orderBy: status === "ACTIVE" ? asc(t.campaigns.deadline) : desc(t.campaigns.deadline) });
  const totals = await campaignTotals();
  const all = await db.query.campaigns.findMany();
  const raisedAll = all.reduce((sum, c) => sum + totals(c.id).total, 0);
  const donors = all.reduce((sum, c) => sum + totals(c.id).count, 0);

  return (
    <div>
      <PageHeader title="Collectes du club" subtitle="Chaque don fait grandir le Bénin Tennis Club"
        action={s.can("fundraising.manage") && <Link href="/dashboard/fundraising/new" className="btn-accent"><Plus size={16} /> Lancer une collecte</Link>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Collecté au total" value={xof(raisedAll)} icon={HeartHandshake} tone="lime" />
        <StatCard label="Dons reçus" value={String(donors)} icon={Users} tone="navy" />
        <StatCard label="Collectes en cours" value={String(all.filter((c) => c.status === "ACTIVE").length)} icon={Target} tone="clay" />
      </div>
      <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
        {[["ACTIVE", "En cours"], ["COMPLETED", "Terminées"]].map(([k, l]) => (
          <Link key={k} href={`?status=${k}`} className={`rounded-lg px-4 py-2 text-sm font-semibold ${status === k ? "bg-white text-primary-400 shadow-soft" : "text-slate-500"}`}>{l}</Link>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {list.map((c) => {
          const { total, count } = totals(c.id);
          const pct = (total / c.targetAmount) * 100;
          const days = daysUntil(c.deadline);
          const [cat, color] = CATEGORY[c.category] ?? ["", ""];
          return (
            <Link key={c.id} href={`/dashboard/fundraising/${c.id}`} className="card group overflow-hidden transition hover:shadow-medium">
              <div className="relative">
                <img src={c.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover" />
                <span className={`chip absolute left-3 top-3 ${color}`}>{cat}</span>
                {c.status === "ACTIVE" && days <= 7 && <span className="chip absolute right-3 top-3 bg-red-500 text-white">Plus que {days} j</span>}
                {c.status === "COMPLETED" && <span className="chip absolute right-3 top-3 bg-emerald-500 text-white">Objectif atteint 🎉</span>}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-primary-400 group-hover:underline">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-end justify-between">
                    <span className="text-xl font-bold text-primary-400">{xof(total)}</span>
                    <span className="text-sm font-semibold text-accent-700">{Math.round(pct)} %</span>
                  </div>
                  <ProgressBar value={pct} />
                  <p className="mt-1.5 text-xs text-slate-400">sur un objectif de {xof(c.targetAmount)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Users size={15} /> {count} donateurs</span>
                  <span className="flex items-center gap-1.5"><CalendarClock size={15} /> {c.status === "ACTIVE" ? `${days} jours restants` : "Terminée"}</span>
                </div>
                <span className={`mt-4 w-full ${c.status === "ACTIVE" ? "btn-accent" : "btn-ghost"}`}>{c.status === "ACTIVE" ? "Voir la collecte et donner" : "Voir la collecte"} <ArrowRight size={16} /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
