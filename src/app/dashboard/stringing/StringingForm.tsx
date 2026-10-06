"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap, ShieldCheck } from "lucide-react";
import { xof } from "@/lib/format";
import { optionCls } from "@/lib/ui";
import { SelectedTick, StepTitle, SummaryRow } from "../_member/ui";

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
  const typeLabel = TYPES.find(([k]) => k === f.stringType)?.[1] ?? f.stringType;

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
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-12">
      <div className="min-w-0 space-y-6 lg:col-span-8">
        <section className="card p-6 md:p-8">
          <StepTitle n={1} title="Votre raquette" hint="Nouvelle demande : déposez-la à l'accueil à la date choisie." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="st-brand">Marque</label><input id="st-brand" className="input" placeholder="Wilson, Babolat, Head..." value={f.racketBrand} onChange={(e) => setF({ ...f, racketBrand: e.target.value })} required /></div>
            <div><label className="label" htmlFor="st-model">Modèle</label><input id="st-model" className="input" placeholder="Pro Staff 97" value={f.racketModel} onChange={(e) => setF({ ...f, racketModel: e.target.value })} required /></div>
          </div>
        </section>

        <section className="card space-y-6 p-6 md:p-8">
          <StepTitle n={2} title="Le cordage" hint="Type, tension et plan de cordage." />
          <div>
            <span className="label">Type de cordage</span>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {TYPES.map(([k, l, d]) => (
                <button type="button" key={k} onClick={() => setF({ ...f, stringType: k })} aria-pressed={f.stringType === k} className={`${optionCls(f.stringType === k)} text-left text-sm`}>
                  <SelectedTick show={f.stringType === k} />
                  <span className="block pr-6 font-bold text-ink">{l}</span><span className="text-xs text-muted">{d}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label flex flex-wrap justify-between gap-2" htmlFor="st-tension"><span>Tension</span><span className="normal-case tracking-normal text-sm font-bold text-brand">{f.tension} lbs · {(f.tension * 0.4536).toFixed(1)} kg</span></label>
            <input id="st-tension" type="range" min={15} max={80} value={f.tension} onChange={(e) => setF({ ...f, tension: Number(e.target.value) })} className="w-full accent-[#1F5996]" />
            <div className="mt-1 flex justify-between gap-2 text-xs text-muted"><span>15 lbs · souple</span><span className="hidden sm:inline">Recommandé : 22-26 lbs</span><span>80 lbs · rigide</span></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="st-pattern">Plan de cordage</label>
              <select id="st-pattern" className="input" value={f.stringPattern} onChange={(e) => setF({ ...f, stringPattern: e.target.value })}>
                <option value="16x19">16 × 19</option><option value="18x20">18 × 20</option><option value="16x18">16 × 18</option><option value="OTHER">Autre</option>
              </select></div>
            <div><label className="label" htmlFor="st-date">Date de dépôt</label><input id="st-date" className="input" type="date" min={today} value={f.preferredDate} onChange={(e) => setF({ ...f, preferredDate: e.target.value })} /></div>
          </div>
        </section>

        <section className="card space-y-5 p-6 md:p-8">
          <StepTitle n={3} title="Options" hint="Une remarque pour le cordeur, besoin de votre raquette rapidement ?" />
          <div><label className="label" htmlFor="st-notes">Remarques</label><textarea id="st-notes" className="input" rows={2} placeholder="Ex. garder le même cordage, changer le grip..." value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <label className={`${optionCls(f.urgent)} flex items-center gap-3`}>
            <input type="checkbox" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} className="h-4 w-4 accent-[#1F5996]" />
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.urgent ? "bg-lime text-ink" : "bg-mist text-ink/50"}`}><Zap size={20} /></span>
            <span className="flex-1"><span className="block font-bold text-ink">Service express 24 h</span><span className="text-xs text-muted">Au lieu de 48 h</span></span>
            <span className="whitespace-nowrap font-bold text-brand">+ {xof(5000)}</span>
          </label>
        </section>
      </div>

      <aside className="lg:sticky lg:top-6 lg:col-span-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/15 md:p-7">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/15 blur-3xl" aria-hidden />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Récapitulatif</p>
          <div className="relative mt-3">
            <SummaryRow label="Raquette" value={f.racketBrand || f.racketModel ? `${f.racketBrand} ${f.racketModel}`.trim() : "—"} />
            <SummaryRow label="Cordage" value={typeLabel} />
            <SummaryRow label="Tension" value={`${f.tension} lbs · ${f.stringPattern === "OTHER" ? "Autre plan" : f.stringPattern.replace("x", " × ")}`} />
            <SummaryRow label="Délai" value={f.urgent ? "24 h (express)" : "48 h"} />
          </div>
          <div className="relative mt-5 flex items-end justify-between gap-3">
            <span className="text-sm text-white/60">Total (pose + cordage)</span>
            <span className="tabular font-display text-3xl font-black text-lime">{xof(price)}</span>
          </div>
          {error && <p role="alert" className="relative mt-5 rounded-2xl bg-red-500/90 px-4 py-3 text-sm font-semibold text-white">{error}</p>}
          <button className="btn-accent relative mt-6 w-full" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Réserver et payer</button>
          <p className="relative mt-4 flex items-center justify-center gap-2 text-xs text-white/55"><ShieldCheck size={14} className="text-lime" /> Cordeur certifié · machine électronique</p>
        </div>
      </aside>
    </form>
  );
}
