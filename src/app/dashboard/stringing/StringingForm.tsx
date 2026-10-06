"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { xof } from "@/lib/format";

const TYPES = [
  ["SYNTHETIC", "Synthétique", "Polyvalent, confortable"],
  ["POLYESTER", "Polyester", "Contrôle et effets"],
  ["NATURAL", "Boyau naturel", "Toucher et puissance"],
  ["HYBRID", "Hybride", "Boyau + polyester"],
];

export default function StringingForm() {
  const [f, setF] = useState({ racketBrand: "", racketModel: "", stringType: "SYNTHETIC", tension: 24, stringPattern: "16x19", notes: "", preferredDate: "", urgent: false });
  const [today, setToday] = useState("");
  // Dates calculées dans le navigateur (fuseau horaire local)
  useEffect(() => {
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setToday(iso(new Date()));
    setF((x) => ({ ...x, preferredDate: x.preferredDate || iso(new Date(Date.now() + 86400000)) }));
  }, []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const price = 25000 + (f.urgent ? 5000 : 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/stringing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setLoading(false); return; }
    window.location.href = data.paymentUrl;
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      <h2 className="text-lg font-bold text-primary-400">Nouvelle demande</h2>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Marque</label><input className="input" placeholder="Wilson, Babolat, Head..." value={f.racketBrand} onChange={(e) => setF({ ...f, racketBrand: e.target.value })} required /></div>
        <div><label className="label">Modèle</label><input className="input" placeholder="Pro Staff 97" value={f.racketModel} onChange={(e) => setF({ ...f, racketModel: e.target.value })} required /></div>
      </div>
      <div>
        <label className="label">Type de cordage</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {TYPES.map(([k, l, d]) => (
            <button type="button" key={k} onClick={() => setF({ ...f, stringType: k })}
              className={`rounded-xl border-2 p-3 text-left text-sm ${f.stringType === k ? "border-accent-500 bg-accent-50" : "border-slate-100"}`}>
              <span className="block font-semibold text-primary-400">{l}</span><span className="text-xs text-slate-500">{d}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label flex justify-between"><span>Tension</span><span className="font-bold text-primary-400">{f.tension} lbs · {(f.tension * 0.4536).toFixed(1)} kg</span></label>
        <input type="range" min={15} max={80} value={f.tension} onChange={(e) => setF({ ...f, tension: Number(e.target.value) })} className="w-full accent-[#1e3a5f]" />
        <div className="flex justify-between text-xs text-slate-400"><span>15 lbs · souple</span><span>Recommandé : 22-26 lbs</span><span>80 lbs · rigide</span></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Plan de cordage</label>
          <select className="input" value={f.stringPattern} onChange={(e) => setF({ ...f, stringPattern: e.target.value })}>
            <option value="16x19">16 × 19</option><option value="18x20">18 × 20</option><option value="16x18">16 × 18</option><option value="OTHER">Autre</option>
          </select></div>
        <div><label className="label">Date de dépôt</label><input className="input" type="date" min={today} value={f.preferredDate} onChange={(e) => setF({ ...f, preferredDate: e.target.value })} /></div>
      </div>
      <div><label className="label">Remarques</label><textarea className="input" rows={2} placeholder="Ex. garder le même cordage, changer le grip..." value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${f.urgent ? "border-amber-400 bg-amber-50" : "border-slate-100"}`}>
        <input type="checkbox" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} className="h-4 w-4" />
        <Zap className="text-amber-500" size={20} />
        <span className="flex-1"><span className="block font-semibold">Service express 24 h</span><span className="text-xs text-slate-500">Au lieu de 48 h</span></span>
        <span className="font-semibold">+ {xof(5000)}</span>
      </label>
      <div className="flex items-center justify-between rounded-xl bg-primary-400 p-4 text-white">
        <span>Total (pose + cordage)</span><span className="text-2xl font-bold text-accent-400">{xof(price)}</span>
      </div>
      <button className="btn-accent w-full py-3" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Réserver et payer</button>
    </form>
  );
}
