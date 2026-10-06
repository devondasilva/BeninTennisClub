import { redirect } from "next/navigation";
import { Wallet, Clock, CheckCircle2, BadgeCheck } from "lucide-react";
import { db } from "@/db";
import { indexById, sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";
import { SegLinks } from "../../_member/ui";
import CommissionTable from "./CommissionTable";

export const metadata = { title: "Commissions des coachs" };

export default async function CommissionsPage({ searchParams }: { searchParams: Promise<{ coach?: string; status?: string }> }) {
  const s = await requireSession();
  if (!s.can("commissions.manage") && s.role !== "COACH") redirect("/dashboard?refus=1");
  const { coach: coachFilter, status } = await searchParams;

  // Les séances passées deviennent « terminées » (à payer)
  const now = new Date();
  db.commissions.updateWhere((c) => c.status === "PENDING" && c.sessionDate < now, { status: "COMPLETED" });

  let coachId = coachFilter;
  if (!s.can("commissions.manage")) {
    const me = db.coaches.find((c) => c.userId === s.userId);
    coachId = me?.id ?? "none";
  }
  const coaches = db.coaches.all();
  const byId = indexById(coaches);
  const scoped = db.commissions.filter((c) => !coachId || c.coachId === coachId);
  const list = sortBy(scoped.filter((c) => (!status || c.status === status) && byId.has(c.coachId)), "sessionDate", "desc").slice(0, 200);
  const sum = (k: string) => scoped.filter((c) => c.status === k).reduce((t, c) => t + c.amount, 0);

  const rows = list.map((c) => {
    const coach = byId.get(c.coachId)!;
    return {
      id: c.id, coach: `${coach.firstName} ${coach.lastName}`, client: c.clientName,
      date: `${dateFr(c.sessionDate, { day: "numeric", month: "short" })} · ${timeFr(c.sessionDate)}`,
      base: c.baseAmount, rate: c.rate, amount: c.amount, status: c.status, paidAt: c.paidAt ? dateFr(c.paidAt, { day: "numeric", month: "short" }) : null,
    };
  });

  const qs = (k: string, v?: string) => {
    const p = new URLSearchParams();
    if (k !== "coach" && coachFilter) p.set("coach", coachFilter);
    if (k !== "status" && status) p.set("status", status);
    if (v) p.set(k, v);
    return `?${p}`;
  };

  return (
    <div>
      <PageHeader eyebrow={s.role === "COACH" ? "Espace coach" : "Gestion du club"} title="Commissions des coachs" subtitle={s.role === "COACH" ? "Vos revenus sur les cours donnés au club" : "Suivi et règlement des commissions"} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total généré" value={xof(sum("PENDING") + sum("COMPLETED") + sum("PAID"))} icon={Wallet} tone="navy" />
        <StatCard label="À venir (séances planifiées)" value={xof(sum("PENDING"))} icon={Clock} tone="sky" />
        <StatCard label="À payer" value={xof(sum("COMPLETED"))} icon={CheckCircle2} tone="clay" />
        <StatCard label="Déjà payé" value={xof(sum("PAID"))} icon={BadgeCheck} tone="lime" />
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {s.can("commissions.manage") && (
          <SegLinks label="Filtrer par coach" items={[
            { href: qs("coach"), label: "Tous les coachs", active: !coachFilter },
            ...coaches.map((c) => ({ href: qs("coach", c.id), label: c.firstName, active: coachFilter === c.id })),
          ]} />
        )}
        <SegLinks label="Filtrer par statut" items={[["", "Tous statuts"], ["PENDING", "À venir"], ["COMPLETED", "À payer"], ["PAID", "Payées"]].map(([k, l]) => ({
          href: qs("status", k), label: l, active: (status ?? "") === k,
        }))} />
      </div>
      <CommissionTable rows={rows} canPay={s.can("commissions.manage")} />
    </div>
  );
}
