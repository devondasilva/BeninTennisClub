"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { xof } from "@/lib/format";

export type CourtFormData = { id?: string; name: string; surface: string; description: string; pricePerSlot: number; image: string | null; isActive: boolean };
const PRESETS = ["/images/courts/court-1.svg", "/images/courts/court-2.svg", "/images/courts/court-3.svg"];

export default function CourtForm({ initial }: { initial: CourtFormData }) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof CourtFormData>(k: K, v: CourtFormData[K]) => { setF({ ...f, [k]: v }); setMsg(""); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, ...body } = f;
    const res = await fetch(id ? `/api/admin/courts/${id}` : "/api/admin/courts", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.message);
    window.location.href = `/dashboard/admin/courts?ok=${encodeURIComponent(data.message)}`;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="card space-y-5 p-6">
        <ImageUpload label="Photo du court" hint="Recadrée au format paysage" value={f.image} onChange={(v) => set("image", v)} ratio={12 / 7} maxWidth={1200} mode="cover" previewClass="aspect-[12/7] max-w-lg" />
        <div>
          <p className="mb-2 text-sm text-slate-500">…ou une illustration fournie :</p>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button type="button" key={p} onClick={() => set("image", p)} className={`overflow-hidden rounded-lg ring-offset-2 ${f.image === p ? "ring-2 ring-accent-500" : ""}`}><img src={p} alt="" className="h-14 w-24 object-cover" /></button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Nom</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex. Court 4" /></div>
          <div><label className="label">Surface</label><input className="input" value={f.surface} onChange={(e) => set("surface", e.target.value)} required placeholder="Ex. Terre battue" /></div>
        </div>
        <div>
          <label className="label">Prix d'un créneau de 30 minutes (XOF)</label>
          <input className="input max-w-xs" type="number" min={500} step="any" value={f.pricePerSlot} onChange={(e) => set("pricePerSlot", Number(e.target.value))} required />
          <p className="mt-1 text-sm text-slate-500">Soit <b>{xof(f.pricePerSlot * 2)}</b> de l'heure. Le nouveau prix s'applique aux prochaines réservations.</p>
        </div>
        <div><label className="label">Description</label><textarea className="input" rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Éclairage, tribunes, ombrage..." /></div>
      </div>
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-medium backdrop-blur">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <button type="button" role="switch" aria-checked={f.isActive} onClick={() => set("isActive", !f.isActive)} className={`relative h-6 w-11 rounded-full transition ${f.isActive ? "bg-accent-500" : "bg-slate-300"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${f.isActive ? "left-[22px]" : "left-0.5"}`} />
          </button>
          {f.isActive ? "Ouvert à la réservation" : "Fermé (travaux, entretien…)"}
        </label>
        <div className="flex items-center gap-3">
          {msg && <p className="text-sm font-medium text-red-600">{msg}</p>}
          <button className="btn-accent" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} {f.id ? "Enregistrer" : "Ajouter le court"}</button>
        </div>
      </div>
    </form>
  );
}
