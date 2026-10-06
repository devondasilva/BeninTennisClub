"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
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
    <form onSubmit={submit} className="card space-y-4 p-6">
      <h2 className="text-lg font-bold text-primary-400">Faire un don</h2>
      <div className="grid grid-cols-2 gap-2">
        {[5000, 10000, 25000, 50000].map((a) => (
          <button type="button" key={a} onClick={() => setAmount(a)} className={`rounded-xl py-2.5 font-semibold ${amount === a ? "bg-accent-400 text-primary-400" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{xof(a)}</button>
        ))}
      </div>
      <div><label className="label">Autre montant (XOF)</label><input className="input" type="number" min={1000} step="any" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
      <div><label className="label">Nom affiché</label><input className="input" value={name} disabled={anonymous} onChange={(e) => setName(e.target.value)} /></div>
      <div><label className="label">Message de soutien (facultatif)</label><textarea className="input" rows={2} maxLength={280} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} /> Rester anonyme</label>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn-accent w-full py-3" disabled={loading}>{loading ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />} Donner {xof(amount || 0)}</button>
    </form>
  );
}
