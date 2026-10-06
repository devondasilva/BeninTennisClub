import { desc, like, or } from "drizzle-orm";
import { Search } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr } from "@/lib/format";
import { PageHeader, Empty } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";

export const metadata = { title: "Journal d'activité" };

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireSession("access.manage");
  const { q } = await searchParams;
  const logs = await db.query.adminLogs.findMany({
    where: q ? or(like(t.adminLogs.userName, `%${q}%`), like(t.adminLogs.action, `%${q}%`), like(t.adminLogs.target, `%${q}%`)) : undefined,
    orderBy: desc(t.adminLogs.createdAt),
    limit: 300,
  });
  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader title="Journal d'activité" subtitle="Toutes les actions de gestion, avec leur auteur" />
      <form className="relative mb-4 max-w-md"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input name="q" defaultValue={q} className="input pl-9" placeholder="Filtrer par membre, action..." /></form>
      {logs.length === 0 ? <Empty>Aucune action enregistrée.</Empty> : (
        <ol className="card divide-y divide-slate-100">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3 text-sm">
              <span className="w-32 shrink-0 text-xs text-slate-400">{dateFr(l.createdAt, { day: "numeric", month: "short" })} · {timeFr(l.createdAt)}</span>
              <span className="font-semibold text-primary-400">{l.userName}</span>
              <span className="text-slate-700">{l.action}</span>
              {l.target && <span className="text-slate-500">— {l.target}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
