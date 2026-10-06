"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Smartphone, Loader2, ShieldCheck } from "lucide-react";
import { xof } from "@/lib/format";

export default function PayPanel({ id, amount, phone, stripeLive, mtnLive }: { id: string; amount: number; phone: string; stripeLive: boolean; mtnLive: boolean }) {
  const [method, setMethod] = useState<"MTN_MONEY" | "STRIPE">("MTN_MONEY");
  const [tel, setTel] = useState(phone);
  const [step, setStep] = useState<"form" | "waiting" | "processing">("form");
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function payMtn() {
    setError("");
    setStep("processing");
    const res = await fetch(`/api/payments/${id}/mtn`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: tel }) });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setStep("form"); return; }
    setStep("waiting");
    timer.current = setInterval(async () => {
      const r = await fetch(`/api/payments/${id}/mtn`);
      const d = await r.json();
      if (d.status === "COMPLETED") { clearInterval(timer.current!); window.location.reload(); }
      if (d.status === "FAILED") { clearInterval(timer.current!); setError("Paiement refusé ou expiré. Réessayez."); setStep("form"); }
    }, 2000);
  }

  async function payCard() {
    setError("");
    setStep("processing");
    const res = await fetch(`/api/payments/${id}/stripe`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setStep("form"); return; }
    if (data.url) window.location.href = data.url;
    else window.location.reload();
  }

  if (step === "waiting")
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
          <Smartphone className="animate-pulse text-yellow-600" size={36} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-primary-400">Validez sur votre téléphone</h2>
        <p className="mx-auto mt-2 max-w-sm text-slate-500">
          Une demande de paiement de <b>{xof(amount)}</b> a été envoyée au <b>{tel}</b>. Composez votre code secret MTN Mobile Money pour confirmer.
        </p>
        {!mtnLive && <p className="mt-3 text-xs text-amber-700">Mode démo : la validation est simulée automatiquement en quelques secondes.</p>}
        <Loader2 className="mx-auto mt-6 animate-spin text-slate-400" />
      </div>
    );

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-primary-400">Moyen de paiement</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button onClick={() => setMethod("MTN_MONEY")}
          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${method === "MTN_MONEY" ? "border-yellow-400 bg-yellow-50" : "border-slate-100"}`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-400 text-xs font-black text-slate-900">MTN</span>
          <span><span className="block font-semibold">MTN Mobile Money</span><span className="text-xs text-slate-500">Validation sur votre téléphone</span></span>
        </button>
        <button onClick={() => setMethod("STRIPE")}
          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${method === "STRIPE" ? "border-primary-400 bg-primary-50" : "border-slate-100"}`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-400 text-white"><CreditCard size={20} /></span>
          <span><span className="block font-semibold">Carte bancaire</span><span className="text-xs text-slate-500">Visa, Mastercard via Stripe</span></span>
        </button>
      </div>

      {method === "MTN_MONEY" ? (
        <div className="mt-5">
          <label className="label">Numéro MTN Mobile Money</label>
          <input className="input" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="+229 96 12 34 56" />
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          {stripeLive ? "Vous allez être redirigé(e) vers la page de paiement sécurisée Stripe." : "Mode démo : aucune carte n'est débitée, le paiement est simulé."}
        </p>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button onClick={method === "MTN_MONEY" ? payMtn : payCard} disabled={step === "processing"} className="btn-accent mt-5 w-full py-3 text-base">
        {step === "processing" && <Loader2 size={18} className="animate-spin" />} Payer {xof(amount)}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck size={14} /> Paiement sécurisé · aucune donnée bancaire stockée par le club</p>
    </div>
  );
}
