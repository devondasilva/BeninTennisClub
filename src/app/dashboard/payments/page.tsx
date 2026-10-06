import Link from "next/link";
import { db } from "@/db";
import { sortBy, withTransactionUser } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatusBadge, StatCard } from "@/components/ui";
import { Wallet, Clock, Smartphone, CreditCard } from "lucide-react";
import { SegLinks } from "../_member/ui";
import TxActions from "./TxActions";

export const metadata = { title: "Paiements" };

const TYPE: Record<string, string> = { RESERVATION: "Réservation", EVENT: "Événement", SHOP: "Boutique", STRINGING: "Cordage", DONATION: "Don" };
const METHOD: Record<string, string> = { MTN_MONEY: "MTN MoMo", STRIPE: "Carte", CASH: "Espèces", FREE: "Gratuit" };

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const s = await requireSession();
  const all = s.can("payments.manage") && (await searchParams).scope === "club";
  const mine = (t: { userId: string }) => all || t.userId === s.userId;

  const list = withTransactionUser(sortBy(db.transactions.filter(mine), "createdAt", "desc").slice(0, 80));
  const paid = db.transactions.sum("amount", (t) => mine(t) && t.status === "COMPLETED");
  const pending = db.transactions.count((t) => mine(t) && t.status === "PENDING");
  const mtn = db.transactions.sum("amount", (t) => mine(t) && t.status === "COMPLETED" && t.method === "MTN_MONEY");
  const card = db.transactions.sum("amount", (t) => mine(t) && t.status === "COMPLETED" && t.method === "STRIPE");

  return (
    <div>
      <PageHeader title="Paiements" subtitle={all ? "Toutes les transactions du club" : "Historique de vos paiements"}
        action={s.can("payments.manage") && (
          <SegLinks label="Périmètre" items={[
            { href: "?", label: "Les miens", active: !all },
            { href: "?scope=club", label: "Tout le club", active: all },
          ]} />
        )} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total payé" value={xof(paid)} icon={Wallet} tone="navy" />
        <StatCard label="Via MTN Mobile Money" value={xof(mtn)} icon={Smartphone} tone="lime" />
        <StatCard label="Par carte" value={xof(card)} icon={CreditCard} tone="sky" />
        <StatCard label="En attente" value={String(pending)} icon={Clock} tone="clay" />
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-ink/[0.06] p-5 md:p-6">
          <h2 className="font-display text-xl font-black tracking-tight text-ink">Transactions</h2>
          <p className="text-sm text-muted">{all ? "Les 80 dernières opérations du club" : "Vos 80 dernières opérations"}</p>
        </div>
        {list.length === 0 ? <p className="p-12 text-center text-muted">Aucun paiement pour l'instant.</p> : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead><tr><th>Date</th><th>Description</th>{all && <th>Membre</th>}<th>Type</th><th>Moyen</th><th>Montant</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {list.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-mist/60">
                    <td className="whitespace-nowrap text-muted">{dateFr(tx.createdAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="max-w-xs truncate font-semibold text-ink">{tx.description}</td>
                    {all && <td className="whitespace-nowrap">{tx.user ? `${tx.user.firstName} ${tx.user.lastName}` : "—"}</td>}
                    <td><span className="chip bg-brand-light text-brand">{TYPE[tx.type] ?? tx.type}</span></td>
                    <td className="whitespace-nowrap">{(tx.method && METHOD[tx.method]) || "—"}</td>
                    <td className="tabular whitespace-nowrap font-bold text-ink">{xof(tx.amount)}</td>
                    <td><StatusBadge status={tx.status} /></td>
                    <td className="text-right">
                      {all ? <TxActions id={tx.id} status={tx.status} /> : tx.status === "PENDING" && tx.userId === s.userId && <Link href={`/dashboard/payments/${tx.id}`} className="btn-primary btn-sm !px-3 !py-1.5">Payer</Link>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
