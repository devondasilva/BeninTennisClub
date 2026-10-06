"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Eye } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { stickyBar, switchCls, switchKnob, tileCls } from "@/components/admin/kit";

export type PartnerFormData = {
  id?: string; name: string; tier: string; description: string; tagline: string; website: string;
  logo: string | null; banner: string | null; placements: string[]; amount: number; startDate: string; endDate: string;
  status: string; contactName: string; contactEmail: string; contactPhone: string;
};

const PLACEMENTS: [string, string, string][] = [
  ["HOME", "Accueil du site", "Grande bannière entre les sections"],
  ["EVENTS", "Événements", "Page Événements (site et espace membre)"],
  ["COACHES", "Fiches coachs", "Colonne latérale des pages coachs"],
  ["DASHBOARD", "Tableau de bord", "Accueil de l'espace membre"],
  ["SHOP", "Boutique", "En haut de la boutique"],
];
const TIERS = [["PLATINUM", "Platine"], ["GOLD", "Or"], ["SILVER", "Argent"], ["PARTNER", "Partenaire"]];

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-ink">
      <span className="tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-lime">{n}</span>
      <span>{children}</span>
    </h2>
  );
}

export default function PartnerForm({ initial }: { initial: PartnerFormData }) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const set = <K extends keyof PartnerFormData>(k: K, v: PartnerFormData[K]) => { setF({ ...f, [k]: v }); setMsg(null); };
  const togglePlacement = (k: string) => set("placements", f.placements.includes(k) ? f.placements.filter((x) => x !== k) : [...f.placements, k]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, ...body } = f;
    const res = await fetch(id ? `/api/partners/${id}` : "/api/partners", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg({ ok: false, text: data.message });
    if (!id) { window.location.href = "/dashboard/partners?added=1"; return; }
    setMsg({ ok: true, text: data.message });
    router.refresh();
  }

  async function remove() {
    await fetch(`/api/partners/${f.id}`, { method: "DELETE" });
    window.location.href = "/dashboard/partners?deleted=1"; // rechargement complet de la liste
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card space-y-5 p-6 md:p-8">
        <SectionTitle n={1}>Le partenaire</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label">Nom</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex. Boulangerie du Port" /></div>
          <div><label className="label">Site internet <span className="font-medium normal-case tracking-normal text-ink/45">(lien de la bannière)</span></label><input className="input" value={f.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." /></div>
        </div>
        <div>
          <label className="label">Niveau de partenariat</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIERS.map(([k, l]) => (
              <button type="button" key={k} onClick={() => set("tier", k)} aria-pressed={f.tier === k} className={tileCls(f.tier === k)}>{l}</button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Plus le niveau est élevé, plus la bannière apparaît souvent quand plusieurs partenaires partagent un emplacement.</p>
        </div>
        <div><label className="label">Description du partenariat</label><input className="input" value={f.description} onChange={(e) => set("description", e.target.value)} required placeholder="Ex. Boissons officielles des tournois" /></div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div><label className="label">Montant du contrat (XOF)</label><input className="input" type="number" min={0} step="any" value={f.amount} onChange={(e) => set("amount", Number(e.target.value))} /></div>
          <div><label className="label">Début</label><input className="input" type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} required /></div>
          <div><label className="label">Fin</label><input className="input" type="date" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} required /></div>
        </div>
      </section>

      <section className="card space-y-6 p-6 md:p-8">
        <SectionTitle n={2}>Visuels</SectionTitle>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <ImageUpload label="Logo" hint="Format libre, fond transparent conseillé" value={f.logo} onChange={(v) => set("logo", v)} ratio={null} maxWidth={500} mode="contain" previewClass="h-32" />
          <ImageUpload label="Bannière publicitaire" hint="Recadrée au format 4:1 (ex. 1200 × 300)" value={f.banner} onChange={(v) => set("banner", v)} ratio={4} maxWidth={1200} mode="cover" previewClass="aspect-[4/1]" />
        </div>
        <div><label className="label">Accroche <span className="font-medium normal-case tracking-normal text-ink/45">(texte alternatif de la bannière)</span></label><input className="input" maxLength={80} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Ex. -15 % pour les adhérents" /></div>
      </section>

      <section className="card p-6 md:p-8">
        <SectionTitle n={3}>Où afficher la bannière ?</SectionTitle>
        <p className="mb-5 mt-2 text-sm text-muted">La bannière n'est diffusée que si le partenaire est actif et entre les dates du contrat.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLACEMENTS.map(([k, l, h]) => (
            <label key={k} className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition ${f.placements.includes(k) ? "border-brand bg-brand/[0.05]" : "border-ink/[0.08] hover:border-ink/20"}`}>
              <input type="checkbox" checked={f.placements.includes(k)} onChange={() => togglePlacement(k)} className="mt-1 h-4 w-4 shrink-0 accent-[#1F5996]" />
              <span><span className="block font-semibold text-ink">{l}</span><span className="text-sm text-muted">{h}</span></span>
            </label>
          ))}
        </div>
        {f.banner && (
          <div className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ink/55"><Eye size={15} /> Aperçu tel qu'affiché sur le site</p>
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-ink/[0.08]">
              <img src={f.banner} alt={f.tagline} className="aspect-[4/1] w-full object-cover" />
              <span className="absolute right-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Partenaire</span>
            </div>
          </div>
        )}
      </section>

      <section className="card p-6 md:p-8">
        <SectionTitle n={4}>Contact chez le partenaire <span className="text-sm font-normal text-muted">(interne)</span></SectionTitle>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div><label className="label">Nom</label><input className="input" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
          <div><label className="label">E-mail</label><input className="input" type="email" value={f.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></div>
          <div><label className="label">Téléphone</label><input className="input" value={f.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></div>
        </div>
      </section>

      <div className={stickyBar}>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink">
            <button type="button" role="switch" aria-checked={f.status === "ACTIVE"} onClick={() => set("status", f.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
              className={switchCls(f.status === "ACTIVE")}>
              <span className={switchKnob(f.status === "ACTIVE")} />
            </button>
            {f.status === "ACTIVE" ? "Actif" : "Désactivé"}
          </label>
          {f.id && (confirmDelete ? (
            <span className="text-sm"><span className="text-muted">Supprimer définitivement ?</span> <button type="button" onClick={remove} className="font-semibold text-red-600">Oui</button> · <button type="button" onClick={() => setConfirmDelete(false)} className="text-muted">Non</button></span>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><Trash2 size={14} /> Supprimer</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
          <button className="btn-primary" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} {f.id ? "Enregistrer" : "Ajouter le partenaire"}</button>
        </div>
      </div>
    </form>
  );
}
