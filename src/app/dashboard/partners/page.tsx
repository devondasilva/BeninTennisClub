import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Handshake, Eye, MousePointerClick, CalendarClock, Pencil, ExternalLink, CheckCircle2, Megaphone } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, daysUntil, xof } from "@/lib/format";
import { PLACEMENTS, TIERS, partnerImage } from "@/lib/partners";
import { PageHeader, StatCard, Empty } from "@/components/ui";
import { Badge, type Tone } from "@/components/admin/kit";

export const metadata = { title: "Partenaires" };

function state(p: { status: string; startDate: Date; endDate: Date }): [string, Tone] {
  const now = Date.now();
  if (p.status !== "ACTIVE") return ["Désactivé", "slate"];
  if (p.startDate.getTime() > now) return ["Programmé", "blue"];
  if (p.endDate.getTime() < now) return ["Expiré", "red"];
  return ["En diffusion", "green"];
}

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ added?: string; deleted?: string }> }) {
  const s = await requireSession();
  if (!s.can("partners.manage") && s.role !== "SPONSOR") redirect("/dashboard?refus=1");
  const staff = s.can("partners.manage");
  const { added, deleted } = await searchParams;
  const partners = sortBy(db.partners.all(), "amount", "desc");
  const live = partners.filter((p) => state(p)[0] === "En diffusion");
  const impressions = partners.reduce((a, p) => a + p.impressions, 0);
  const clicks = partners.reduce((a, p) => a + p.clicks, 0);
  const soon = live.filter((p) => daysUntil(p.endDate) <= 30);
  const freeSlots = Object.keys(PLACEMENTS).filter((k) => !live.some((p) => p.banner && p.placements.split(",").includes(k)));

  return (
    <div>
      <PageHeader eyebrow="Back-office · Sponsors" title="Partenaires & publicité" subtitle="Gérez les sponsors du club et leurs bannières sur le site"
        action={staff && <Link href="/dashboard/partners/new" className="btn-primary"><Plus size={16} /> Ajouter un partenaire</Link>} />

      {deleted && <p role="status" className="mb-6 flex items-center gap-3 rounded-2xl bg-ink/[0.05] px-4 py-3 text-sm font-semibold text-ink"><CheckCircle2 size={18} /> Partenaire supprimé.</p>}
      {added && <p role="status" className="mb-6 flex items-center gap-3 rounded-2xl border border-lime-dark/30 bg-lime-light px-4 py-3 text-sm font-semibold text-ink"><CheckCircle2 size={18} /> Partenaire ajouté. Sa bannière est diffusée sur les emplacements choisis.</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Partenaires en diffusion" value={`${live.length} / ${partners.length}`} icon={Handshake} tone="navy" hint={`${xof(live.reduce((a, p) => a + p.amount, 0))} de contrats`} />
        <StatCard label="Affichages des bannières" value={impressions.toLocaleString("fr-FR")} icon={Eye} tone="sky" />
        <StatCard label="Clics" value={clicks.toLocaleString("fr-FR")} icon={MousePointerClick} tone="lime" hint={`Taux de clic moyen ${impressions ? ((clicks / impressions) * 100).toFixed(1) : 0} %`} />
        <StatCard label="Contrats à renouveler (30 j)" value={String(soon.length)} icon={CalendarClock} tone="clay" />
      </div>

      {freeSlots.length > 0 && staff && (
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-ink p-6 text-white">
          <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/15 blur-3xl" aria-hidden />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime text-ink"><Megaphone size={20} /></span>
            <p className="min-w-0 flex-1 text-sm text-white/80">
              <b className="text-lime">Emplacements libres :</b> {freeSlots.map((k) => PLACEMENTS[k].label).join(", ")}. Ils affichent « Votre marque ici » avec un lien vers la page Devenir partenaire.
            </p>
          </div>
        </div>
      )}

      {partners.length === 0 ? <Empty>Aucun partenaire. {staff && <Link href="/dashboard/partners/new" className="font-semibold text-brand underline">Ajouter le premier</Link>}</Empty> : (
        <div className="space-y-5">
          {partners.map((p) => {
            const [label, tone] = state(p);
            const tier = TIERS[p.tier] ?? { label: p.tier, color: "" };
            const banner = partnerImage(p, "banner"), logo = partnerImage(p, "logo");
            const ctr = p.impressions ? ((p.clicks / p.impressions) * 100).toFixed(1) : "0";
            return (
              <article key={p.id} className="card overflow-hidden">
                <div className="grid md:grid-cols-[340px_1fr]">
                  <div className="flex items-center bg-mist p-5">
                    {banner ? <img src={banner} alt={`Bannière ${p.name}`} className="aspect-[4/1] w-full rounded-2xl object-cover shadow-soft" /> : <div className="flex aspect-[4/1] w-full items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 text-sm text-muted">Pas de bannière</div>}
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {logo && <img src={logo} alt="" className="h-12 w-20 rounded-xl border border-ink/[0.08] bg-white object-contain p-1" />}
                        <div>
                          <p className="text-lg font-bold text-ink">{p.name}</p>
                          <div className="mt-1 flex flex-wrap gap-1.5"><span className={`chip ${tier.color}`}>{tier.label}</span><Badge tone={tone}>{label}</Badge></div>
                        </div>
                      </div>
                      {staff && <Link href={`/dashboard/partners/${p.id}/edit`} className="btn-primary btn-sm"><Pencil size={14} /> Modifier</Link>}
                    </div>
                    <p className="mt-3 text-sm text-muted">{p.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.placements.split(",").filter(Boolean).map((k) => <span key={k} className="chip bg-ink/[0.05] text-ink/70">{PLACEMENTS[k]?.label ?? k}</span>)}
                    </div>
                    <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-mist p-4 text-sm sm:grid-cols-4">
                      <div><dt className="text-[10px] font-bold uppercase tracking-widest text-ink/45">Contrat</dt><dd className="tabular font-semibold text-ink">{xof(p.amount)}</dd></div>
                      <div><dt className="text-[10px] font-bold uppercase tracking-widest text-ink/45">Période</dt><dd className="font-semibold text-ink">{dateFr(p.startDate, { day: "numeric", month: "short" })} → {dateFr(p.endDate, { day: "numeric", month: "short", year: "2-digit" })}</dd></div>
                      <div><dt className="text-[10px] font-bold uppercase tracking-widest text-ink/45">Affichages · clics</dt><dd className="tabular font-semibold text-ink">{p.impressions.toLocaleString("fr-FR")} · {p.clicks.toLocaleString("fr-FR")}</dd></div>
                      <div><dt className="text-[10px] font-bold uppercase tracking-widest text-ink/45">Taux de clic</dt><dd className="tabular font-semibold text-ink">{ctr} %</dd></div>
                    </dl>
                    {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">Site du partenaire <ExternalLink size={12} /></a>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
