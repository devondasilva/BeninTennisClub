import { Mail, Phone, Inbox, MailOpen, CalendarDays, Reply } from "lucide-react";
import { db } from "@/db";
import { sortBy, startOfMonth } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { relativeFr } from "@/lib/format";
import { Empty, PageHeader, StatCard } from "@/components/ui";
import Avatar from "@/components/Avatar";
import { Badge } from "@/components/admin/kit";
import MarkRead from "./MarkRead";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireSession("messages.manage");
  const list = sortBy(db.contactMessages.all(), "createdAt", "desc");
  const fresh = list.filter((m) => m.status === "NEW").length;
  const month = startOfMonth();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Back-office · Club" title="Messages du site" subtitle="Reçus via le formulaire de contact" />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Non lus" value={String(fresh)} icon={Inbox} tone="navy" hint={fresh ? "À traiter" : "Tout est à jour"} />
        <StatCard label="Ce mois-ci" value={String(list.filter((m) => m.createdAt >= month).length)} icon={CalendarDays} tone="sky" />
        <StatCard label="Messages reçus" value={String(list.length)} icon={MailOpen} tone="lime" hint="Depuis l'ouverture" />
      </div>
      {list.length === 0 ? <Empty>Aucun message.</Empty> : (
        <div className="space-y-4">
          {list.map((m) => {
            const isNew = m.status === "NEW";
            return (
              <article key={m.id} className={`card relative overflow-hidden p-6 ${isNew ? "ring-1 ring-brand/20" : ""}`}>
                {isNew && <span className="absolute inset-y-0 left-0 w-1.5 bg-lime" aria-hidden />}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar src={null} name={m.name} size={42} />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-bold text-ink">{m.subject} {isNew && <Badge tone="lime">Nouveau</Badge>}</p>
                      <p className="text-sm text-muted">{m.name} · {relativeFr(m.createdAt)}</p>
                    </div>
                  </div>
                  {isNew && <MarkRead id={m.id} />}
                </div>
                <p className="mt-4 whitespace-pre-line rounded-2xl bg-mist p-4 text-[15px] leading-relaxed text-ink/85">{m.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="btn-primary btn-sm"><Reply size={14} aria-hidden /> Répondre</a>
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="flex items-center gap-1.5 font-semibold text-brand hover:underline"><Mail size={15} aria-hidden /> {m.email}</a>
                  {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 font-semibold text-brand hover:underline"><Phone size={15} aria-hidden /> {m.phone}</a>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
