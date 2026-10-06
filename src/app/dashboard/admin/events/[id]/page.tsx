import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil, ExternalLink, CalendarCheck, Hourglass, Wallet } from "lucide-react";
import { db } from "@/db";
import { sortBy, withRegistrationRefs } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { PageHeader, StatusBadge, Empty, StatCard, ProgressBar } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Avatar from "@/components/Avatar";

export const metadata = { title: "Inscrits" };

export default async function EventRegistrants({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("events.manage");
  const { id } = await params;
  const e = db.events.get(id);
  if (!e) notFound();
  const regs = withRegistrationRefs(sortBy(db.eventRegistrations.filter((r) => r.eventId === id), "createdAt", "desc"));
  const paid = regs.filter((r) => r.status === "CONFIRMED").length;
  return (
    <div>
      <BackLink href="/dashboard/admin/events" label="Gestion des événements" />
      <PageHeader eyebrow="Back-office · Inscrits" title={e.title} subtitle={`${dateFr(e.startDate, { weekday: "long", day: "numeric", month: "long" })} · ${timeFr(e.startDate)} · ${e.location}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/events/${e.id}`} className="btn-ghost btn-sm"><ExternalLink size={15} /> Voir la fiche</Link>
            <Link href={`/dashboard/events/${e.id}/edit`} className="btn-ghost btn-sm"><Pencil size={15} /> Modifier</Link>
            <a href={`/api/admin/events/${e.id}/csv`} className="btn-primary btn-sm"><Download size={15} /> Exporter (Excel)</a>
          </div>
        } />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Inscrits confirmés" value={`${paid} / ${e.capacity}`} icon={CalendarCheck} tone="navy" hint={`${Math.max(0, e.capacity - paid)} place(s) restante(s)`} />
        <StatCard label="En attente de paiement" value={String(regs.length - paid)} icon={Hourglass} tone="clay" />
        <StatCard label="Recettes" value={xof(paid * e.price)} icon={Wallet} tone="lime" hint={e.price ? `${xof(e.price)} par inscription` : "Événement gratuit"} />
      </div>
      <div className="mb-8 card p-6">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-widest text-ink/50">Remplissage</span>
          <span className="tabular font-bold text-ink">{e.capacity ? Math.round((paid / e.capacity) * 100) : 0} %</span>
        </div>
        <ProgressBar value={e.capacity ? (paid / e.capacity) * 100 : 0} />
      </div>
      {regs.length === 0 ? <Empty>Aucun inscrit pour l'instant.</Empty> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base min-w-[640px]">
              <thead><tr><th>Participant</th><th>Contact</th><th>Inscrit le</th><th>Statut</th></tr></thead>
              <tbody>
                {regs.map((r) => {
                  const name = r.user ? `${r.user.firstName} ${r.user.lastName}` : "Compte supprimé";
                  return (
                    <tr key={r.id}>
                      <td><div className="flex items-center gap-3"><Avatar src={r.user?.avatar} name={name} size={36} /><span className="font-semibold text-ink">{name}</span></div></td>
                      <td>{r.user && <><a href={`mailto:${r.user.email}`} className="text-brand hover:underline">{r.user.email}</a><p className="text-xs text-muted">{r.user.phone}</p></>}</td>
                      <td className="whitespace-nowrap text-muted">{dateFr(r.createdAt, { day: "numeric", month: "short" })}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
