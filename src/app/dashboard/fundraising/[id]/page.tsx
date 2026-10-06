import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, CalendarClock, Heart, Target } from "lucide-react";
import { db } from "@/db";
import { sortBy, withDonationRefs } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, daysUntil, relativeFr, xof } from "@/lib/format";
import { CATEGORY } from "@/lib/campaigns";
import { ProgressBar } from "@/components/ui";
import DonateForm from "./DonateForm";
import Avatar from "@/components/Avatar";
import { DarkCard } from "../../_member/ui";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const c = db.campaigns.get((await params).id);
  return { title: c?.title ?? "Collecte" };
}

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  const { id } = await params;
  const c = db.campaigns.get(id);
  if (!c) notFound();
  const creator = db.users.get(c.createdById);
  const donations = sortBy(withDonationRefs(db.donations.filter((d) => d.campaignId === id && d.status === "COMPLETED")), "createdAt", "desc");
  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const pct = (total / c.targetAmount) * 100;
  const days = daysUntil(c.deadline);
  const open = c.status === "ACTIVE" && days > 0;
  const [cat, color] = CATEGORY[c.category] ?? ["", ""];

  return (
    <div>
      <Link href="/dashboard/fundraising" className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted hover:text-brand"><ArrowLeft size={16} /> Toutes les collectes</Link>
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-8">
          <article className="card overflow-hidden">
            <img src={c.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover" />
            <div className="p-6 md:p-8">
              {cat && <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>{cat}</span>}
              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-display text-3xl font-black tracking-tight text-ink md:text-4xl">{c.title}</h1>
                {s.can("fundraising.manage") && <Link href={`/dashboard/fundraising/${c.id}/edit`} className="btn-ghost btn-sm">Modifier / clôturer</Link>}
              </div>
              <p className="mt-2 text-sm text-muted">Lancée par {creator ? `${creator.firstName} ${creator.lastName}` : "le club"} le {dateFr(c.createdAt)}</p>
              <p className="mt-5 whitespace-pre-line leading-relaxed text-ink/80">{c.description}</p>
            </div>
          </article>

          <section className="card p-6 md:p-8">
            <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-black tracking-tight text-ink">
              <span className="rounded-xl bg-brand-light p-2.5 text-brand"><Heart size={18} /></span> Ils ont donné ({donations.length})
            </h2>
            {donations.length === 0 ? <p className="rounded-2xl border-2 border-dashed border-ink/10 py-8 text-center text-muted">Soyez le premier à soutenir ce projet !</p> : (
              <ul className="divide-y divide-ink/[0.06]">
                {donations.slice(0, 25).map((d) => {
                  const name = d.donorName ?? (d.user ? `${d.user.firstName} ${d.user.lastName}` : "Membre du club");
                  return (
                    <li key={d.id} className="flex items-start gap-3 py-3.5">
                      {d.anonymous ? <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist font-bold text-ink/40" aria-hidden>?</span> : <Avatar src={d.user?.avatar} name={name} size={40} />}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink">{d.anonymous ? "Donateur anonyme" : d.donorName}</p>
                        {d.message && <p className="text-sm italic text-muted">« {d.message} »</p>}
                        <p className="text-xs text-ink/45">{relativeFr(d.createdAt)}</p>
                      </div>
                      <span className="tabular font-bold text-brand">{xof(d.amount)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:col-span-4">
          <DarkCard className="p-6 md:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Progression</p>
            <p className="tabular mt-3 font-display text-4xl font-black text-white">{xof(total)}</p>
            <p className="mb-4 text-sm text-white/60">collectés sur {xof(c.targetAmount)}</p>
            <ProgressBar value={pct} />
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/[0.06] p-3"><p className="flex items-center justify-center gap-1 text-lg font-bold text-lime"><Target size={15} />{Math.round(pct)} %</p><p className="text-xs text-white/55">atteint</p></div>
              <div className="rounded-2xl bg-white/[0.06] p-3"><p className="flex items-center justify-center gap-1 text-lg font-bold text-white"><Users size={15} />{donations.length}</p><p className="text-xs text-white/55">dons</p></div>
              <div className="rounded-2xl bg-white/[0.06] p-3"><p className="flex items-center justify-center gap-1 text-lg font-bold text-white"><CalendarClock size={15} />{Math.max(0, days)}</p><p className="text-xs text-white/55">jours</p></div>
            </div>
          </DarkCard>
          {open ? <DonateForm id={c.id} defaultName={`${s.firstName} ${s.lastName}`} /> : (
            <div className="card p-6 text-center text-muted">Cette collecte est terminée. Merci à tous les donateurs !</div>
          )}
        </aside>
      </div>
    </div>
  );
}
