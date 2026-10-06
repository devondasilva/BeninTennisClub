"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { choiceCls } from "./kit";

export type EventFormData = { id?: string; title: string; description: string; type: string; startDate: string; endDate: string; location: string; capacity: number; price: number; image: string | null };
const TYPES = [["TOURNAMENT", "Tournoi"], ["STAGE", "Stage"], ["SCHOOL", "École de tennis"], ["GATHERING", "Convivialité"]];

export default function EventForm({ initial }: { initial: EventFormData }) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof EventFormData>(k: K, v: EventFormData[K]) => { setF({ ...f, [k]: v }); setError(""); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, ...body } = f;
    const res = await fetch(id ? `/api/events/${id}` : "/api/events", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message);
    window.location.href = `/dashboard/admin/events?ok=${encodeURIComponent(id ? "Événement modifié" : "Événement publié")}`;
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 md:p-8">
      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div><label className="label" htmlFor="ev-title">Titre</label><input id="ev-title" className="input" value={f.title} onChange={(e) => set("title", e.target.value)} required /></div>
      <div>
        <p className="label">Type</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(([k, l]) => <button type="button" key={k} aria-pressed={f.type === k} onClick={() => set("type", k)} className={choiceCls(f.type === k)}>{l}</button>)}
        </div>
      </div>
      <div><label className="label" htmlFor="ev-desc">Description</label><textarea id="ev-desc" className="input" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} required /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="ev-start">Début</label><input id="ev-start" className="input" type="datetime-local" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} required /></div>
        <div><label className="label" htmlFor="ev-end">Fin</label><input id="ev-end" className="input" type="datetime-local" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} required /></div>
        <div><label className="label" htmlFor="ev-loc">Lieu</label><input id="ev-loc" className="input" value={f.location} onChange={(e) => set("location", e.target.value)} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="ev-cap">Places</label><input id="ev-cap" className="input" type="number" min={1} value={f.capacity} onChange={(e) => set("capacity", Number(e.target.value))} /></div>
          <div><label className="label" htmlFor="ev-price">Prix (0 = gratuit)</label><input id="ev-price" className="input" type="number" min={0} step="any" value={f.price} onChange={(e) => set("price", Number(e.target.value))} /></div>
        </div>
      </div>
      <ImageUpload label="Visuel (facultatif)" hint="Sinon une illustration selon le type est utilisée" value={f.image} onChange={(v) => set("image", v)} ratio={2} maxWidth={1200} mode="cover" previewClass="aspect-[2/1] max-w-md" />
      <button className="btn-primary w-full" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} {f.id ? "Enregistrer les modifications" : "Publier l'événement"}</button>
    </form>
  );
}
