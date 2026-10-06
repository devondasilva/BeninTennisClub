import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Download, Pencil, ExternalLink } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { PageHeader, StatusBadge, Empty } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Avatar from "@/components/Avatar";

export const metadata = { title: "Inscrits" };

export default async function EventRegistrants({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("events.manage");
  const { id } = await params;
  const e = await db.query.events.findFirst({ where: eq(t.events.id, id) });
  if (!e) notFound();
  const regs = await db.query.eventRegistrations.findMany({ where: eq(t.eventRegistrations.eventId, id), with: { user: true }, orderBy: desc(t.eventRegistrations.createdAt) });
  const paid = regs.filter((r) => r.status === "CONFIRMED").length;
  return (
    <div>
      <BackLink href="/dashboard/admin/events" label="Gestion des événements" />
      <PageHeader title={e.title} subtitle={`${dateFr(e.startDate, { weekday: "long", day: "numeric", month: "long" })} · ${timeFr(e.startDate)} · ${e.location}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/events/${e.id}`} className="btn-ghost"><ExternalLink size={15} /> Voir la fiche</Link>
            <Link href={`/dashboard/events/${e.id}/edit`} className="btn-ghost"><Pencil size={15} /> Modifier</Link>
            <a href={`/api/admin/events/${e.id}/csv`} className="btn-accent"><Download size={15} /> Exporter (Excel)</a>
          </div>
        } />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-slate-500">Inscrits confirmés</p><p className="text-2xl font-bold text-primary-400">{paid} / {e.capacity}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">En attente de paiement</p><p className="text-2xl font-bold text-primary-400">{regs.length - paid}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500">Recettes</p><p className="text-2xl font-bold text-primary-400">{xof(paid * e.price)}</p></div>
      </div>
      {regs.length === 0 ? <Empty>Aucun inscrit pour l'instant.</Empty> : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Participant</th><th>Contact</th><th>Inscrit le</th><th>Statut</th></tr></thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.id}>
                  <td><div className="flex items-center gap-3"><Avatar src={r.user.avatar} name={`${r.user.firstName} ${r.user.lastName}`} size={34} /><span className="font-semibold text-primary-400">{r.user.firstName} {r.user.lastName}</span></div></td>
                  <td><a href={`mailto:${r.user.email}`} className="hover:underline">{r.user.email}</a><p className="text-xs text-slate-400">{r.user.phone}</p></td>
                  <td className="whitespace-nowrap">{dateFr(r.createdAt, { day: "numeric", month: "short" })}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
