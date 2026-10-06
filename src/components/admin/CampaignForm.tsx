"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export type CampaignFormData = { id?: string; title: string; description: string; category: string; targetAmount: number; deadline: string; image: string | null; status: string };
const CATS = [["EQUIPMENT", "Équipement"], ["FACILITY", "Infrastructure"], ["TOURNAMENT", "Tournoi"], ["TRAINING", "Formation"], ["COMMUNITY", "Communauté"], ["OTHER", "Autre"]];

export default function CampaignForm({ initial }: { initial: CampaignFormData }) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof CampaignFormData>(k: K, v: CampaignFormData[K]) => { setF({ ...f, [k]: v }); setError(""); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, ...body } = f;
    const res = await fetch(id ? `/api/fundraising/${id}` : "/api/fundraising", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message);
    window.location.href = `/dashboard/fundraising/${id ?? data.campaign.id}`;
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div><label className="label">Titre</label><input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} required /></div>
      <div><label className="label">Description du projet</label><textarea className="input" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} required /></div>
      <div>
        <label className="label">Catégorie</label>
        <div className="flex flex-wrap gap-2">{CATS.map(([k, l]) => <button type="button" key={k} onClick={() => set("category", k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f.category === k ? "bg-primary-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{l}</button>)}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Objectif (XOF)</label><input className="input" type="number" min={10000} step="any" value={f.targetAmount} onChange={(e) => set("targetAmount", Number(e.target.value))} /></div>
        <div><label className="label">Date limite</label><input className="input" type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} required /></div>
      </div>
      <ImageUpload label="Visuel (facultatif)" hint="Format paysage 2:1" value={f.image} onChange={(v) => set("image", v)} ratio={2} maxWidth={1200} mode="cover" previewClass="aspect-[2/1] max-w-md" />
      {f.id && (
        <div>
          <label className="label">Statut</label>
          <div className="flex flex-wrap gap-2">
            {[["ACTIVE", "En cours (dons ouverts)"], ["COMPLETED", "Clôturée"]].map(([k, l]) => <button type="button" key={k} onClick={() => set("status", k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f.status === k ? "bg-primary-400 text-white" : "bg-slate-100 text-slate-600"}`}>{l}</button>)}
          </div>
        </div>
      )}
      <button className="btn-primary w-full py-3" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} {f.id ? "Enregistrer" : "Publier la collecte"}</button>
    </form>
  );
}
