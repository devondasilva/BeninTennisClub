"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { xof } from "@/lib/format";
import { stickyBar, switchCls, switchKnob } from "./kit";

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
      <div className="card space-y-6 p-6 md:p-8">
        <ImageUpload label="Photo du court" hint="Recadrée au format paysage" value={f.image} onChange={(v) => set("image", v)} ratio={12 / 7} maxWidth={1200} mode="cover" previewClass="aspect-[12/7] max-w-lg" />
        <div>
          <p className="mb-2 text-sm text-muted">…ou une illustration fournie :</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button type="button" key={p} onClick={() => set("image", p)} aria-label={`Illustration ${i + 1}`} aria-pressed={f.image === p}
                className={`overflow-hidden rounded-xl ring-offset-2 transition ${f.image === p ? "ring-2 ring-brand" : "opacity-80 hover:opacity-100"}`}><img src={p} alt="" className="h-14 w-24 object-cover" /></button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label" htmlFor="c-name">Nom</label><input id="c-name" className="input" value={f.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex. Court 4" /></div>
          <div><label className="label" htmlFor="c-surface">Surface</label><input id="c-surface" className="input" value={f.surface} onChange={(e) => set("surface", e.target.value)} required placeholder="Ex. Terre battue" /></div>
        </div>
        <div className="rounded-2xl bg-mist p-5">
          <label className="label" htmlFor="c-price">Prix d'un créneau de 30 minutes (XOF)</label>
          <input id="c-price" className="input max-w-xs" type="number" min={500} step="any" value={f.pricePerSlot} onChange={(e) => set("pricePerSlot", Number(e.target.value))} required />
          <p className="mt-2 text-sm text-muted">Soit <b className="text-ink">{xof(f.pricePerSlot * 2)}</b> de l'heure. Le nouveau prix s'applique aux prochaines réservations.</p>
        </div>
        <div><label className="label" htmlFor="c-desc">Description</label><textarea id="c-desc" className="input" rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Éclairage, tribunes, ombrage..." /></div>
      </div>
      <div className={stickyBar}>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink">
          <button type="button" role="switch" aria-checked={f.isActive} onClick={() => set("isActive", !f.isActive)} className={switchCls(f.isActive)}>
            <span className={switchKnob(f.isActive)} />
          </button>
          {f.isActive ? "Ouvert à la réservation" : "Fermé (travaux, entretien…)"}
        </label>
        <div className="flex items-center gap-3">
          {msg && <p role="status" className="text-sm font-semibold text-red-600">{msg}</p>}
          <button className="btn-primary" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} {f.id ? "Enregistrer" : "Ajouter le court"}</button>
        </div>
      </div>
    </form>
  );
}
