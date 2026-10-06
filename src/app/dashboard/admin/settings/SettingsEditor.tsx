"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Star, MapPin, BadgeCheck } from "lucide-react";
import type { ClubInfo, Membership } from "@/lib/settings";
import { stickyBar } from "@/components/admin/kit";

export default function SettingsEditor({ info, memberships }: { info: ClubInfo; memberships: Membership[] }) {
  const [ci, setCi] = useState(info);
  const [ms, setMs] = useState(memberships);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const setM = (i: number, patch: Partial<Membership>) => { setMs(ms.map((m, j) => (j === i ? { ...m, ...patch } : m))); setMsg(null); };

  async function save() {
    setLoading(true);
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clubInfo: ci, memberships: ms.map((m) => ({ ...m, perks: m.perks.filter((p) => p.trim()) })) }) });
    setMsg({ ok: res.ok, text: (await res.json()).message });
    setLoading(false);
  }

  const field = (k: keyof ClubInfo, label: string) => (
    <div><label className="label" htmlFor={`ci-${k}`}>{label}</label><input id={`ci-${k}`} className="input" value={ci[k]} onChange={(e) => { setCi({ ...ci, [k]: e.target.value }); setMsg(null); }} /></div>
  );

  return (
    <div className="space-y-6">
      <section className="card p-6 md:p-8">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand"><MapPin size={20} /></span>
          <div>
            <h2 className="text-lg font-bold text-ink">Coordonnées & horaires</h2>
            <p className="text-sm text-muted">Affichés dans le pied de page et sur la page Contact.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {field("phone", "Téléphone")}{field("whatsapp", "WhatsApp")}{field("email", "E-mail")}{field("hours", "Horaires")}
          {field("address", "Adresse")}{field("addressHint", "Repère (comment nous trouver)")}
        </div>
      </section>

      <section className="card p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-light text-ink"><BadgeCheck size={20} /></span>
            <div><h2 className="text-lg font-bold text-ink">Formules d'adhésion</h2><p className="text-sm text-muted">Affichées sur la page Tarifs.</p></div>
          </div>
          {ms.length < 6 && <button type="button" onClick={() => setMs([...ms, { name: "Nouvelle formule", price: 0, period: "an", tag: "", perks: [""] }])} className="btn-ghost btn-sm"><Plus size={16} /> Ajouter une formule</button>}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {ms.map((m, i) => (
            <div key={i} className={`space-y-4 rounded-[1.5rem] border-2 p-5 transition ${m.highlight ? "border-brand bg-brand/[0.03] shadow-lg shadow-brand/10" : "border-ink/[0.08]"}`}>
              <div className="flex items-center justify-between gap-2">
                <input className="input font-bold" value={m.name} aria-label="Nom de la formule" onChange={(e) => setM(i, { name: e.target.value })} />
                <button type="button" title="Mettre en avant" aria-label="Mettre en avant" aria-pressed={!!m.highlight} onClick={() => setMs(ms.map((x, j) => ({ ...x, highlight: j === i ? !x.highlight : false })))}
                  className={`rounded-xl p-2.5 transition ${m.highlight ? "bg-ink text-lime" : "bg-mist text-ink/40 hover:text-ink"}`}><Star size={16} /></button>
                <button type="button" title="Supprimer" aria-label="Supprimer la formule" onClick={() => setMs(ms.filter((_, j) => j !== i))} className="rounded-xl bg-mist p-2.5 text-red-600 transition hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className="label">Prix (XOF)</label><input className="input" type="number" min={0} step="any" value={m.price} onChange={(e) => setM(i, { price: Number(e.target.value) })} /></div>
                <div><label className="label">Par</label><input className="input" value={m.period} onChange={(e) => setM(i, { period: e.target.value })} /></div>
              </div>
              <div><label className="label">Étiquette</label><input className="input" value={m.tag} onChange={(e) => setM(i, { tag: e.target.value })} placeholder="Ex. Moins de 18 ans" /></div>
              <div><label className="label">Avantages (un par ligne)</label><textarea className="input" rows={4} value={m.perks.join("\n")} onChange={(e) => setM(i, { perks: e.target.value.split("\n") })} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className={`${stickyBar} justify-end`}>
        {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
        <button onClick={save} className="btn-primary" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer et publier</button>
      </div>
    </div>
  );
}
