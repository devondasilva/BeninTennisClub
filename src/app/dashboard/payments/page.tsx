import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { Empty, PageHeader, StatusBadge, StatCard } from "@/components/ui";
import { Wallet, Clock, Smartphone, CreditCard } from "lucide-react";
import TxActions from "./TxActions";

export const metadata = { title: "Paiements" };

const TYPE: Record<string, string> = { RESERVATION: "Réservation", EVENT: "Événement", SHOP: "Boutique", STRINGING: "Cordage", DONATION: "Don" };

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const s = await requireSession();
  const all = s.can("payments.manage") && (await searchParams).scope === "club";
  const mine = all ? undefined : eq(t.transactions.userId, s.userId);

  const [list, [paid], [pending], [mtn], [card]] = await Promise.all([
    db.query.transactions.findMany({ where: mine, with: { user: true }, orderBy: desc(t.transactions.createdAt), limit: 80 }),
    db.select({ v: sql<number>`coalesce(sum(${t.transactions.amount}),0)` }).from(t.transactions).where(and(mine, eq(t.transactions.status, "COMPLETED"))),
    db.select({ v: sql<number>`count(*)` }).from(t.transactions).where(and(mine, eq(t.transactions.status, "PENDING"))),
    db.select({ v: sql<number>`coalesce(sum(${t.transactions.amount}),0)` }).from(t.transactions).where(and(mine, eq(t.transactions.status, "COMPLETED"), eq(t.transactions.method, "MTN_MONEY"))),
    db.select({ v: sql<number>`coalesce(sum(${t.transactions.amount}),0)` }).from(t.transactions).where(and(mine, eq(t.transactions.status, "COMPLETED"), eq(t.transactions.method, "STRIPE"))),
  ]);

  return (
    <div>
      <PageHeader title="Paiements" subtitle={all ? "Toutes les transactions du club" : "Historique de vos paiements"}
        action={s.can("payments.manage") && (
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <Link href="?" className={`rounded-lg px-4 py-2 text-sm font-semibold ${!all ? "bg-white text-primary-400 shadow-soft" : "text-slate-500"}`}>Les miens</Link>
            <Link href="?scope=club" className={`rounded-lg px-4 py-2 text-sm font-semibold ${all ? "bg-white text-primary-400 shadow-soft" : "text-slate-500"}`}>Tout le club</Link>
          </div>
        )} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total payé" value={xof(paid.v)} icon={Wallet} tone="navy" />
        <StatCard label="Via MTN Mobile Money" value={xof(mtn.v)} icon={Smartphone} tone="lime" />
        <StatCard label="Par carte" value={xof(card.v)} icon={CreditCard} tone="sky" />
        <StatCard label="En attente" value={String(pending.v)} icon={Clock} tone="clay" />
      </div>
      {list.length === 0 ? <Empty>Aucun paiement pour l'instant.</Empty> : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Date</th><th>Description</th>{all && <th>Membre</th>}<th>Type</th><th>Moyen</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {list.map((tx) => (
                <tr key={tx.id}>
                  <td className="whitespace-nowrap">{dateFr(tx.createdAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="max-w-xs truncate">{tx.description}</td>
                  {all && <td className="whitespace-nowrap">{tx.user.firstName} {tx.user.lastName}</td>}
                  <td><span className="chip bg-slate-100 text-slate-600">{TYPE[tx.type]}</span></td>
                  <td className="whitespace-nowrap">{tx.method === "MTN_MONEY" ? "MTN MoMo" : tx.method === "STRIPE" ? "Carte" : tx.method === "CASH" ? "Espèces" : tx.method === "FREE" ? "Gratuit" : "—"}</td>
                  <td className="whitespace-nowrap font-semibold">{xof(tx.amount)}</td>
                  <td><StatusBadge status={tx.status} /></td>
                  <td className="text-right">
                    {all ? <TxActions id={tx.id} status={tx.status} /> : tx.status === "PENDING" && tx.userId === s.userId && <Link href={`/dashboard/payments/${tx.id}`} className="text-xs font-semibold text-primary-400 underline">Payer</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
