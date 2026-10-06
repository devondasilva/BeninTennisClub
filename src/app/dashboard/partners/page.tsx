import { redirect } from "next/navigation";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus, Handshake, Eye, MousePointerClick, CalendarClock, Pencil, ExternalLink, CheckCircle2 } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, daysUntil, xof } from "@/lib/format";
import { PLACEMENTS, TIERS, partnerImage } from "@/lib/partners";
import { PageHeader, StatCard, Empty } from "@/components/ui";

export const metadata = { title: "Partenaires" };

function state(p: { status: string; startDate: Date; endDate: Date }) {
  const now = Date.now();
  if (p.status !== "ACTIVE") return ["Désactivé", "bg-slate-200 text-slate-600"];
  if (p.startDate.getTime() > now) return ["Programmé", "bg-sky-100 text-sky-800"];
  if (p.endDate.getTime() < now) return ["Expiré", "bg-red-100 text-red-700"];
  return ["En diffusion", "bg-emerald-100 text-emerald-800"];
}

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ added?: string; deleted?: string }> }) {
  const s = await requireSession();
  if (!s.can("partners.manage") && s.role !== "SPONSOR") redirect("/dashboard?refus=1");
  const staff = s.can("partners.manage");
  const { added, deleted } = await searchParams;
  const partners = await db.query.partners.findMany({ orderBy: desc(t.partners.amount) });
  const live = partners.filter((p) => state(p)[0] === "En diffusion");
  const impressions = partners.reduce((a, p) => a + p.impressions, 0);
  const clicks = partners.reduce((a, p) => a + p.clicks, 0);
  const soon = live.filter((p) => daysUntil(p.endDate) <= 30);
  const freeSlots = Object.keys(PLACEMENTS).filter((k) => !live.some((p) => p.banner && p.placements.split(",").includes(k)));

  return (
    <div>
      <PageHeader title="Partenaires & publicité" subtitle="Gérez les sponsors du club et leurs bannières sur le site"
        action={staff && <Link href="/dashboard/partners/new" className="btn-accent"><Plus size={16} /> Ajouter un partenaire</Link>} />

      {deleted && <p className="mb-5 flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700"><CheckCircle2 size={18} /> Partenaire supprimé.</p>}
      {added && <p className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={18} /> Partenaire ajouté. Sa bannière est diffusée sur les emplacements choisis.</p>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Partenaires en diffusion" value={`${live.length} / ${partners.length}`} icon={Handshake} tone="navy" hint={`${xof(live.reduce((a, p) => a + p.amount, 0))} de contrats`} />
        <StatCard label="Affichages des bannières" value={impressions.toLocaleString("fr-FR")} icon={Eye} tone="sky" />
        <StatCard label="Clics" value={clicks.toLocaleString("fr-FR")} icon={MousePointerClick} tone="lime" hint={`Taux de clic moyen ${impressions ? ((clicks / impressions) * 100).toFixed(1) : 0} %`} />
        <StatCard label="Contrats à renouveler (30 j)" value={String(soon.length)} icon={CalendarClock} tone="clay" />
      </div>

      {freeSlots.length > 0 && staff && (
        <div className="mb-6 rounded-2xl border border-dashed border-accent-500 bg-accent-50 p-4 text-sm text-primary-400">
          <b>Emplacements libres :</b> {freeSlots.map((k) => PLACEMENTS[k].label).join(", ")}. Ils affichent « Votre marque ici » avec un lien vers la page Devenir partenaire.
        </div>
      )}

      {partners.length === 0 ? <Empty>Aucun partenaire. {staff && <Link href="/dashboard/partners/new" className="font-semibold underline">Ajouter le premier</Link>}</Empty> : (
        <div className="space-y-4">
          {partners.map((p) => {
            const [label, color] = state(p);
            const tier = TIERS[p.tier] ?? { label: p.tier, color: "" };
            const banner = partnerImage(p, "banner"), logo = partnerImage(p, "logo");
            const ctr = p.impressions ? ((p.clicks / p.impressions) * 100).toFixed(1) : "0";
            return (
              <div key={p.id} className="card overflow-hidden">
                <div className="grid md:grid-cols-[320px_1fr]">
                  <div className="flex items-center bg-slate-50 p-4">
                    {banner ? <img src={banner} alt={`Bannière ${p.name}`} className="aspect-[4/1] w-full rounded-xl object-cover shadow-soft" /> : <div className="flex aspect-[4/1] w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">Pas de bannière</div>}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {logo && <img src={logo} alt="" className="h-12 w-20 rounded-lg border border-slate-100 bg-white object-contain p-1" />}
                        <div>
                          <p className="text-lg font-bold text-primary-400">{p.name}</p>
                          <div className="mt-0.5 flex flex-wrap gap-1.5"><span className={`chip ${tier.color}`}>{tier.label}</span><span className={`chip ${color}`}>{label}</span></div>
                        </div>
                      </div>
                      {staff && <Link href={`/dashboard/partners/${p.id}/edit`} className="btn-primary px-3 py-2 text-xs"><Pencil size={14} /> Modifier</Link>}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{p.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.placements.split(",").filter(Boolean).map((k) => <span key={k} className="chip bg-slate-100 text-slate-600">{PLACEMENTS[k]?.label ?? k}</span>)}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm sm:grid-cols-4">
                      <div><p className="text-xs text-slate-400">Contrat</p><p className="font-semibold">{xof(p.amount)}</p></div>
                      <div><p className="text-xs text-slate-400">Période</p><p className="font-semibold">{dateFr(p.startDate, { day: "numeric", month: "short" })} → {dateFr(p.endDate, { day: "numeric", month: "short", year: "2-digit" })}</p></div>
                      <div><p className="text-xs text-slate-400">Affichages · clics</p><p className="font-semibold">{p.impressions.toLocaleString("fr-FR")} · {p.clicks.toLocaleString("fr-FR")}</p></div>
                      <div><p className="text-xs text-slate-400">Taux de clic</p><p className="font-semibold">{ctr} %</p></div>
                    </div>
                    {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-400 hover:underline">Site du partenaire <ExternalLink size={12} /></a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
