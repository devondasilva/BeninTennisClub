import { redirect } from "next/navigation";
import Link from "next/link";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { Wallet, Clock, CheckCircle2, BadgeCheck } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";
import CommissionTable from "./CommissionTable";

export const metadata = { title: "Commissions des coachs" };

export default async function CommissionsPage({ searchParams }: { searchParams: Promise<{ coach?: string; status?: string }> }) {
  const s = await requireSession();
  if (!s.can("commissions.manage") && s.role !== "COACH") redirect("/dashboard?refus=1");
  const { coach: coachFilter, status } = await searchParams;

  // Les séances passées deviennent « terminées » (à payer)
  await db.update(t.commissions).set({ status: "COMPLETED" }).where(and(eq(t.commissions.status, "PENDING"), lt(t.commissions.sessionDate, new Date())));

  let coachId = coachFilter;
  if (!s.can("commissions.manage")) {
    const me = await db.query.coaches.findFirst({ where: eq(t.coaches.userId, s.userId) });
    coachId = me?.id ?? "none";
  }
  const coaches = await db.query.coaches.findMany();
  const where = and(coachId ? eq(t.commissions.coachId, coachId) : undefined, status ? eq(t.commissions.status, status) : undefined);
  const list = await db.query.commissions.findMany({ where, with: { coach: true }, orderBy: desc(t.commissions.sessionDate), limit: 200 });
  const sums = await db.select({ status: t.commissions.status, v: sql<number>`sum(${t.commissions.amount})` }).from(t.commissions)
    .where(coachId ? eq(t.commissions.coachId, coachId) : undefined).groupBy(t.commissions.status);
  const sum = (k: string) => sums.find((x) => x.status === k)?.v ?? 0;

  const rows = list.map((c) => ({
    id: c.id, coach: `${c.coach.firstName} ${c.coach.lastName}`, client: c.clientName,
    date: `${dateFr(c.sessionDate, { day: "numeric", month: "short" })} · ${timeFr(c.sessionDate)}`,
    base: c.baseAmount, rate: c.rate, amount: c.amount, status: c.status, paidAt: c.paidAt ? dateFr(c.paidAt, { day: "numeric", month: "short" }) : null,
  }));

  const qs = (k: string, v?: string) => {
    const p = new URLSearchParams();
    if (k !== "coach" && coachFilter) p.set("coach", coachFilter);
    if (k !== "status" && status) p.set("status", status);
    if (v) p.set(k, v);
    return `?${p}`;
  };

  return (
    <div>
      <PageHeader title="Commissions des coachs" subtitle={s.role === "COACH" ? "Vos revenus sur les cours donnés au club" : "Suivi et règlement des commissions"} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total généré" value={xof(sum("PENDING") + sum("COMPLETED") + sum("PAID"))} icon={Wallet} tone="navy" />
        <StatCard label="À venir (séances planifiées)" value={xof(sum("PENDING"))} icon={Clock} tone="sky" />
        <StatCard label="À payer" value={xof(sum("COMPLETED"))} icon={CheckCircle2} tone="clay" />
        <StatCard label="Déjà payé" value={xof(sum("PAID"))} icon={BadgeCheck} tone="lime" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {s.can("commissions.manage") && (
          <>
            <Link href={qs("coach")} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!coachFilter ? "bg-primary-400 text-white" : "bg-white text-slate-600 shadow-soft"}`}>Tous les coachs</Link>
            {coaches.map((c) => (
              <Link key={c.id} href={qs("coach", c.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${coachFilter === c.id ? "bg-primary-400 text-white" : "bg-white text-slate-600 shadow-soft"}`}>{c.firstName}</Link>
            ))}
            <span className="mx-1 w-px bg-slate-200" />
          </>
        )}
        {[["", "Tous statuts"], ["PENDING", "À venir"], ["COMPLETED", "À payer"], ["PAID", "Payées"]].map(([k, l]) => (
          <Link key={k} href={qs("status", k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${(status ?? "") === k ? "bg-accent-400 text-primary-400" : "bg-white text-slate-600 shadow-soft"}`}>{l}</Link>
        ))}
      </div>
      <CommissionTable rows={rows} canPay={s.can("commissions.manage")} />
    </div>
  );
}
