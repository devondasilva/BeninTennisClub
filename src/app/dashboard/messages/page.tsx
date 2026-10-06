import { desc } from "drizzle-orm";
import { Mail, Phone } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { relativeFr } from "@/lib/format";
import { Empty, PageHeader } from "@/components/ui";
import MarkRead from "./MarkRead";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireSession("messages.manage");
  const list = await db.query.contactMessages.findMany({ orderBy: desc(t.contactMessages.createdAt) });
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Messages du site" subtitle="Reçus via le formulaire de contact" />
      {list.length === 0 ? <Empty>Aucun message.</Empty> : (
        <div className="space-y-4">
          {list.map((m) => (
            <div key={m.id} className={`card p-5 ${m.status === "NEW" ? "border-l-4 border-l-accent-500" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-primary-400">{m.subject} {m.status === "NEW" && <span className="chip ml-2 bg-accent-200 text-primary-400">Nouveau</span>}</p>
                  <p className="text-sm text-slate-500">{m.name} · {relativeFr(m.createdAt)}</p>
                </div>
                {m.status === "NEW" && <MarkRead id={m.id} />}
              </div>
              <p className="mt-3 whitespace-pre-line text-slate-700">{m.message}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="flex items-center gap-1.5 font-semibold text-primary-400 hover:underline"><Mail size={15} /> {m.email}</a>
                {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 font-semibold text-primary-400 hover:underline"><Phone size={15} /> {m.phone}</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
