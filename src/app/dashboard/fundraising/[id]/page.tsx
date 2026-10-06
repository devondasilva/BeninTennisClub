import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft, Users, CalendarClock, Heart } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, daysUntil, relativeFr, xof } from "@/lib/format";
import { CATEGORY } from "@/lib/campaigns";
import { ProgressBar } from "@/components/ui";
import DonateForm from "./DonateForm";
import Avatar from "@/components/Avatar";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  const { id } = await params;
  const c = await db.query.campaigns.findFirst({ where: eq(t.campaigns.id, id), with: { creator: true } });
  if (!c) notFound();
  const donations = await db.query.donations.findMany({
    where: and(eq(t.donations.campaignId, id), eq(t.donations.status, "COMPLETED")),
    with: { user: true },
    orderBy: desc(t.donations.createdAt),
  });
  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const pct = (total / c.targetAmount) * 100;
  const days = daysUntil(c.deadline);
  const open = c.status === "ACTIVE" && days > 0;
  const [cat, color] = CATEGORY[c.category] ?? ["", ""];

  return (
    <div>
      <Link href="/dashboard/fundraising" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-400"><ArrowLeft size={16} /> Toutes les collectes</Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card overflow-hidden">
            <img src={c.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover" />
            <div className="p-6">
              <span className={`chip ${color}`}>{cat}</span>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-primary-400 md:text-3xl">{c.title}</h1>
                {s.can("fundraising.manage") && <Link href={`/dashboard/fundraising/${c.id}/edit`} className="btn-ghost px-3 py-2 text-xs">Modifier / clôturer</Link>}
              </div>
              <p className="mt-1 text-sm text-slate-400">Lancée par {c.creator.firstName} {c.creator.lastName} le {dateFr(c.createdAt)}</p>
              <p className="mt-4 leading-relaxed text-slate-600">{c.description}</p>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-primary-400"><Heart size={20} /> Ils ont donné ({donations.length})</h2>
            {donations.length === 0 ? <p className="py-6 text-center text-slate-500">Soyez le premier à soutenir ce projet !</p> : (
              <ul className="divide-y divide-slate-100">
                {donations.slice(0, 25).map((d) => (
                  <li key={d.id} className="flex items-start gap-3 py-3">
                    {d.anonymous ? <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-400">?</span> : <Avatar src={d.user.avatar} name={d.donorName ?? `${d.user.firstName} ${d.user.lastName}`} size={40} />}
                    <div className="flex-1">
                      <p className="font-semibold">{d.anonymous ? "Donateur anonyme" : d.donorName}</p>
                      {d.message && <p className="text-sm italic text-slate-500">« {d.message} »</p>}
                      <p className="text-xs text-slate-400">{relativeFr(d.createdAt)}</p>
                    </div>
                    <span className="font-bold text-primary-400">{xof(d.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-6">
            <p className="text-3xl font-bold text-primary-400">{xof(total)}</p>
            <p className="mb-3 text-sm text-slate-500">collectés sur {xof(c.targetAmount)}</p>
            <ProgressBar value={pct} />
            <div className="mt-4 grid grid-cols-3 text-center">
              <div><p className="text-lg font-bold text-primary-400">{Math.round(pct)} %</p><p className="text-xs text-slate-400">atteint</p></div>
              <div><p className="flex items-center justify-center gap-1 text-lg font-bold text-primary-400"><Users size={16} />{donations.length}</p><p className="text-xs text-slate-400">dons</p></div>
              <div><p className="flex items-center justify-center gap-1 text-lg font-bold text-primary-400"><CalendarClock size={16} />{Math.max(0, days)}</p><p className="text-xs text-slate-400">jours</p></div>
            </div>
          </div>
          {open ? <DonateForm id={c.id} defaultName={`${s.firstName} ${s.lastName}`} /> : (
            <div className="card p-6 text-center text-slate-500">Cette collecte est terminée. Merci à tous les donateurs ! 💚</div>
          )}
        </aside>
      </div>
    </div>
  );
}
