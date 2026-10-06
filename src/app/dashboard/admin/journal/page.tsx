import { Search, ScrollText } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr } from "@/lib/format";
import { PageHeader, Empty } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Avatar from "@/components/Avatar";

export const metadata = { title: "Journal d'activité" };

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireSession("access.manage");
  const { q } = await searchParams;
  const needle = q?.toLowerCase();
  const logs = sortBy(
    db.adminLogs.filter((l) => !needle || [l.userName, l.action, l.target ?? ""].some((v) => v.toLowerCase().includes(needle))),
    "createdAt", "desc"
  ).slice(0, 300);

  // Regroupement par jour
  const days = new Map<string, typeof logs>();
  for (const l of logs) {
    const k = dateFr(l.createdAt, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    days.set(k, [...(days.get(k) ?? []), l]);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader eyebrow="Back-office" title="Journal d'activité" subtitle="Toutes les actions de gestion, avec leur auteur" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <form className="relative w-full max-w-md" role="search">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden />
          <input name="q" defaultValue={q} className="input pl-11" placeholder="Filtrer par membre, action..." aria-label="Filtrer le journal" />
        </form>
        <span className="text-[11px] font-bold uppercase tracking-widest text-ink/45">{logs.length} action{logs.length > 1 ? "s" : ""}{logs.length === 300 ? " (300 dernières)" : ""}</span>
      </div>
      {logs.length === 0 ? <Empty>Aucune action enregistrée.</Empty> : (
        <div className="space-y-6">
          {[...days.entries()].map(([day, list]) => (
            <section key={day} className="card overflow-hidden">
              <h2 className="flex items-center gap-2 border-b border-ink/[0.06] bg-mist px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-ink/55">
                <ScrollText size={14} aria-hidden /> {day}
              </h2>
              <ol className="divide-y divide-ink/[0.06]">
                {list.map((l) => (
                  <li key={l.id} className="flex items-start gap-4 px-6 py-4 text-sm">
                    <Avatar src={null} name={l.userName} size={34} />
                    <div className="min-w-0 flex-1">
                      <p><span className="font-semibold text-ink">{l.userName}</span> <span className="text-ink/80">{l.action}</span></p>
                      {l.target && <p className="mt-0.5 truncate text-muted">{l.target}</p>}
                    </div>
                    <time className="tabular shrink-0 rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-muted" dateTime={l.createdAt.toISOString()}>{timeFr(l.createdAt)}</time>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
