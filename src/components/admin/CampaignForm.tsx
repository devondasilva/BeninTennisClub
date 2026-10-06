"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { choiceCls } from "./kit";

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
    <form onSubmit={submit} className="card space-y-5 p-6 md:p-8">
      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div><label className="label" htmlFor="cp-title">Titre</label><input id="cp-title" className="input" value={f.title} onChange={(e) => set("title", e.target.value)} required /></div>
      <div><label className="label" htmlFor="cp-desc">Description du projet</label><textarea id="cp-desc" className="input" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} required /></div>
      <div>
        <p className="label">Catégorie</p>
        <div className="flex flex-wrap gap-2">{CATS.map(([k, l]) => <button type="button" key={k} aria-pressed={f.category === k} onClick={() => set("category", k)} className={choiceCls(f.category === k)}>{l}</button>)}</div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="cp-target">Objectif (XOF)</label><input id="cp-target" className="input" type="number" min={10000} step="any" value={f.targetAmount} onChange={(e) => set("targetAmount", Number(e.target.value))} /></div>
        <div><label className="label" htmlFor="cp-deadline">Date limite</label><input id="cp-deadline" className="input" type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} required /></div>
      </div>
      <ImageUpload label="Visuel (facultatif)" hint="Format paysage 2:1" value={f.image} onChange={(v) => set("image", v)} ratio={2} maxWidth={1200} mode="cover" previewClass="aspect-[2/1] max-w-md" />
      {f.id && (
        <div>
          <p className="label">Statut</p>
          <div className="flex flex-wrap gap-2">
            {[["ACTIVE", "En cours (dons ouverts)"], ["COMPLETED", "Clôturée"]].map(([k, l]) => <button type="button" key={k} aria-pressed={f.status === k} onClick={() => set("status", k)} className={choiceCls(f.status === k)}>{l}</button>)}
          </div>
        </div>
      )}
      <button className="btn-primary w-full" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} {f.id ? "Enregistrer" : "Publier la collecte"}</button>
    </form>
  );
}
