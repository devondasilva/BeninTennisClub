"use client";

import { useState } from "react";
import { Heart, Loader2, ShieldCheck } from "lucide-react";
import { xof } from "@/lib/format";

export default function DonateForm({ id, defaultName }: { id: string; defaultName: string }) {
  const [amount, setAmount] = useState(25000);
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/fundraising/${id}/donate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, donorName: name, message, anonymous }) });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setLoading(false); return; }
    window.location.href = data.paymentUrl;
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 md:p-7">
      <div>
        <p className="eyebrow">Soutenir le projet</p>
        <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-ink">Faire un don</h2>
      </div>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Montant suggéré">
        {[5000, 10000, 25000, 50000].map((a) => (
          <button type="button" key={a} onClick={() => setAmount(a)} aria-pressed={amount === a}
            className={`tabular rounded-2xl border-2 py-3 text-sm font-bold transition-all ${amount === a ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink/75 hover:border-ink/30"}`}>{xof(a)}</button>
        ))}
      </div>
      <div><label className="label" htmlFor="don-amount">Autre montant (XOF)</label><input id="don-amount" className="input" type="number" min={1000} step="any" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
      <div><label className="label" htmlFor="don-name">Nom affiché</label><input id="don-name" className="input disabled:bg-mist disabled:text-ink/40" value={name} disabled={anonymous} onChange={(e) => setName(e.target.value)} /></div>
      <div><label className="label" htmlFor="don-msg">Message de soutien (facultatif)</label><textarea id="don-msg" className="input" rows={2} maxLength={280} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
      <label className="flex items-center gap-2.5 text-sm font-semibold text-ink"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 accent-[#1F5996]" /> Rester anonyme</label>
      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />} Donner {xof(amount || 0)}</button>
      <p className="flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-brand" /> Paiement par MTN Mobile Money ou carte</p>
    </form>
  );
}
