"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { xof } from "@/lib/format";

export type ProductFormData = { id?: string; name: string; description: string; category: string; price: number; stock: number; image: string | null; isActive: boolean };

const CATS = [["RACKETS", "Raquettes"], ["BALLS", "Balles"], ["CLOTHING", "Vêtements"], ["SHOES", "Chaussures"], ["ACCESSORIES", "Accessoires"]];

export default function ProductForm({ initial }: { initial: ProductFormData }) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => { setF({ ...f, [k]: v }); setMsg(null); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { id, ...body } = f;
    const res = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg({ ok: false, text: data.message });
    window.location.href = `/dashboard/admin/products?ok=${encodeURIComponent(data.message)}`;
  }

  async function remove() {
    const res = await fetch(`/api/admin/products/${f.id}`, { method: "DELETE" });
    const data = await res.json();
    window.location.href = `/dashboard/admin/products?ok=${encodeURIComponent(data.message)}`;
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="card grid gap-6 p-6 md:grid-cols-[260px_1fr]">
        <ImageUpload label="Photo de l'article" hint="Recadrée au carré" value={f.image} onChange={(v) => set("image", v)} ratio={1} maxWidth={800} mode="cover" previewClass="aspect-square" />
        <div className="space-y-4">
          <div><label className="label">Nom de l'article</label><input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex. Raquette Junior 23&quot;" /></div>
          <div>
            <label className="label">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {CATS.map(([k, l]) => (
                <button type="button" key={k} onClick={() => set("category", k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f.category === k ? "bg-primary-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Prix (XOF)</label><input className="input" type="number" min={100} step="any" value={f.price} onChange={(e) => set("price", Number(e.target.value))} required /><p className="mt-1 text-xs text-slate-400">Affiché : {xof(f.price || 0)}</p></div>
            <div><label className="label">Stock disponible</label><input className="input" type="number" min={0} value={f.stock} onChange={(e) => set("stock", Number(e.target.value))} required />{f.stock <= 5 && <p className="mt-1 text-xs font-medium text-amber-700">Stock bas</p>}</div>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} required /></div>
        </div>
      </div>
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-medium backdrop-blur">
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <button type="button" role="switch" aria-checked={f.isActive} onClick={() => set("isActive", !f.isActive)} className={`relative h-6 w-11 rounded-full transition ${f.isActive ? "bg-accent-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${f.isActive ? "left-[22px]" : "left-0.5"}`} />
            </button>
            {f.isActive ? "En vente" : "Retiré de la vente"}
          </label>
          {f.id && (confirm
            ? <span className="text-sm"><span className="text-slate-500">Supprimer ?</span> <button type="button" onClick={remove} className="font-semibold text-red-600">Oui</button> · <button type="button" onClick={() => setConfirm(false)} className="text-slate-500">Non</button></span>
            : <button type="button" onClick={() => setConfirm(true)} className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><Trash2 size={14} /> Supprimer</button>)}
        </div>
        <div className="flex items-center gap-3">
          {msg && <p className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
          <button className="btn-accent" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} {f.id ? "Enregistrer" : "Ajouter l'article"}</button>
        </div>
      </div>
    </form>
  );
}
