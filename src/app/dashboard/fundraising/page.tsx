import Link from "next/link";
import { Plus, Users, CalendarClock, Target, ArrowRight, HeartHandshake, PartyPopper } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { daysUntil, xof } from "@/lib/format";
import { CATEGORY, campaignTotals } from "@/lib/campaigns";
import { Empty, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { SegLinks } from "../_member/ui";

export const metadata = { title: "Collectes" };

export default async function FundraisingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const s = await requireSession();
  const status = (await searchParams).status ?? "ACTIVE";
  const list = sortBy(db.campaigns.filter((c) => c.status === status), "deadline", status === "ACTIVE" ? "asc" : "desc");
  const totals = await campaignTotals();
  const all = db.campaigns.all();
  const raisedAll = all.reduce((sum, c) => sum + totals(c.id).total, 0);
  const donors = all.reduce((sum, c) => sum + totals(c.id).count, 0);

  return (
    <div>
      <PageHeader title="Collectes du club" subtitle="Chaque don fait grandir le Bénin Tennis Club"
        action={s.can("fundraising.manage") && <Link href="/dashboard/fundraising/new" className="btn-primary"><Plus size={16} /> Lancer une collecte</Link>} />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Collecté au total" value={xof(raisedAll)} icon={HeartHandshake} tone="navy" />
        <StatCard label="Dons reçus" value={String(donors)} icon={Users} tone="lime" />
        <StatCard label="Collectes en cours" value={String(all.filter((c) => c.status === "ACTIVE").length)} icon={Target} tone="clay" />
      </div>
      <div className="mb-6">
        <SegLinks label="Statut des collectes" items={[["ACTIVE", "En cours"], ["COMPLETED", "Terminées"]].map(([k, l]) => ({ href: `?status=${k}`, label: l, active: status === k }))} />
      </div>
      {list.length === 0 ? <Empty>Aucune collecte pour le moment.</Empty> : (
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((c) => {
            const { total, count } = totals(c.id);
            const pct = (total / c.targetAmount) * 100;
            const days = daysUntil(c.deadline);
            const [cat, color] = CATEGORY[c.category] ?? ["", ""];
            return (
              <Link key={c.id} href={`/dashboard/fundraising/${c.id}`} className="card-hover group flex flex-col overflow-hidden">
                <div className="relative overflow-hidden">
                  <img src={c.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {cat && <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>{cat}</span>}
                  {c.status === "ACTIVE" && days <= 7 && <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">Plus que {days} j</span>}
                  {c.status === "COMPLETED" && <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink"><PartyPopper size={12} /> Objectif atteint</span>}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-black leading-snug tracking-tight text-ink group-hover:text-brand">{c.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{c.description}</p>
                  <div className="mt-5">
                    <div className="mb-2 flex items-end justify-between">
                      <span className="tabular font-display text-2xl font-black text-ink">{xof(total)}</span>
                      <span className="text-sm font-bold text-brand">{Math.round(pct)} %</span>
                    </div>
                    <ProgressBar value={pct} />
                    <p className="mt-2 text-xs text-muted">sur un objectif de {xof(c.targetAmount)}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-ink/[0.06] pt-4 text-sm text-muted">
                    <span className="flex items-center gap-1.5"><Users size={15} className="text-brand" /> {count} donateurs</span>
                    <span className="flex items-center gap-1.5"><CalendarClock size={15} className="text-brand" /> {c.status === "ACTIVE" ? `${days} jours restants` : "Terminée"}</span>
                  </div>
                  <span className={`mt-5 w-full ${c.status === "ACTIVE" ? "btn-primary" : "btn-ghost"}`}>{c.status === "ACTIVE" ? "Voir la collecte et donner" : "Voir la collecte"} <ArrowRight size={16} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
