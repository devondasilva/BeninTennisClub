"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Star } from "lucide-react";
import type { ClubInfo, Membership } from "@/lib/settings";

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
    <div><label className="label">{label}</label><input className="input" value={ci[k]} onChange={(e) => { setCi({ ...ci, [k]: e.target.value }); setMsg(null); }} /></div>
  );

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="mb-1 text-lg font-bold text-primary-400">Coordonnées & horaires</h2>
        <p className="mb-4 text-sm text-slate-500">Affichés dans le pied de page et sur la page Contact.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("phone", "Téléphone")}{field("whatsapp", "WhatsApp")}{field("email", "E-mail")}{field("hours", "Horaires")}
          {field("address", "Adresse")}{field("addressHint", "Repère (comment nous trouver)")}
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold text-primary-400">Formules d'adhésion</h2><p className="text-sm text-slate-500">Affichées sur la page Tarifs.</p></div>
          {ms.length < 6 && <button type="button" onClick={() => setMs([...ms, { name: "Nouvelle formule", price: 0, period: "an", tag: "", perks: [""] }])} className="btn-ghost"><Plus size={16} /> Ajouter une formule</button>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {ms.map((m, i) => (
            <div key={i} className={`space-y-3 rounded-2xl border-2 p-4 ${m.highlight ? "border-accent-500" : "border-slate-100"}`}>
              <div className="flex items-center justify-between gap-2">
                <input className="input font-semibold" value={m.name} onChange={(e) => setM(i, { name: e.target.value })} />
                <button type="button" title="Mettre en avant" onClick={() => setMs(ms.map((x, j) => ({ ...x, highlight: j === i ? !x.highlight : false })))} className={`rounded-lg p-2 ${m.highlight ? "bg-accent-400 text-primary-400" : "bg-slate-100 text-slate-400"}`}><Star size={16} /></button>
                <button type="button" title="Supprimer" onClick={() => setMs(ms.filter((_, j) => j !== i))} className="rounded-lg bg-slate-100 p-2 text-red-600"><Trash2 size={16} /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2"><label className="text-xs text-slate-500">Prix (XOF)</label><input className="input" type="number" min={0} step="any" value={m.price} onChange={(e) => setM(i, { price: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-slate-500">Par</label><input className="input" value={m.period} onChange={(e) => setM(i, { period: e.target.value })} /></div>
              </div>
              <div><label className="text-xs text-slate-500">Étiquette</label><input className="input" value={m.tag} onChange={(e) => setM(i, { tag: e.target.value })} placeholder="Ex. Moins de 18 ans" /></div>
              <div><label className="text-xs text-slate-500">Avantages (un par ligne)</label><textarea className="input" rows={4} value={m.perks.join("\n")} onChange={(e) => setM(i, { perks: e.target.value.split("\n") })} /></div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl bg-white/95 p-3 shadow-medium backdrop-blur">
        {msg && <p className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
        <button onClick={save} className="btn-accent" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer et publier</button>
      </div>
    </div>
  );
}
