"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Smartphone, Loader2, ShieldCheck } from "lucide-react";
import { xof } from "@/lib/format";
import { optionCls } from "@/lib/ui";
import { SelectedTick, StepTitle } from "../../_member/ui";

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
      <div className="card p-8 text-center md:p-10" role="status" aria-live="polite">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFCC00]/25">
          <Smartphone className="animate-pulse text-ink" size={36} />
        </div>
        <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-ink">Validez sur votre téléphone</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Une demande de paiement de <b className="text-ink">{xof(amount)}</b> a été envoyée au <b className="text-ink">{tel}</b>. Composez votre code secret MTN Mobile Money pour confirmer.
        </p>
        {!mtnLive && <p className="mt-4 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Mode démo : la validation est simulée automatiquement en quelques secondes.</p>}
        <Loader2 className="mx-auto mt-6 animate-spin text-brand" />
      </div>
    );

  return (
    <div className="card p-6 md:p-8">
      <StepTitle n={1} title="Moyen de paiement" hint="Choisissez comment régler." />
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Moyen de paiement">
        <button type="button" role="radio" aria-checked={method === "MTN_MONEY"} onClick={() => setMethod("MTN_MONEY")} className={`${optionCls(method === "MTN_MONEY")} flex items-center gap-3 text-left`}>
          <SelectedTick show={method === "MTN_MONEY"} />
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFCC00] text-xs font-black text-ink">MTN</span>
          <span className="pr-6"><span className="block font-bold text-ink">MTN Mobile Money</span><span className="text-xs text-muted">Validation sur votre téléphone</span></span>
        </button>
        <button type="button" role="radio" aria-checked={method === "STRIPE"} onClick={() => setMethod("STRIPE")} className={`${optionCls(method === "STRIPE")} flex items-center gap-3 text-left`}>
          <SelectedTick show={method === "STRIPE"} />
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white"><CreditCard size={20} /></span>
          <span className="pr-6"><span className="block font-bold text-ink">Carte bancaire</span><span className="text-xs text-muted">Visa, Mastercard via Stripe</span></span>
        </button>
      </div>

      <div className="mt-6 border-t border-ink/[0.06] pt-6">
        <StepTitle n={2} title={method === "MTN_MONEY" ? "Votre numéro" : "Confirmation"} />
        {method === "MTN_MONEY" ? (
          <div>
            <label className="label" htmlFor="pay-tel">Numéro MTN Mobile Money</label>
            <input id="pay-tel" className="input" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="+229 96 12 34 56" />
          </div>
        ) : (
          <p className="rounded-2xl bg-brand-light p-4 text-sm text-ink">
            {stripeLive ? "Vous allez être redirigé(e) vers la page de paiement sécurisée Stripe." : "Mode démo : aucune carte n'est débitée, le paiement est simulé."}
          </p>
        )}
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <button type="button" onClick={method === "MTN_MONEY" ? payMtn : payCard} disabled={step === "processing"} className="btn-primary mt-6 w-full">
        {step === "processing" && <Loader2 size={18} className="animate-spin" />} Payer {xof(amount)}
      </button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck size={14} className="text-brand" /> Paiement sécurisé · aucune donnée bancaire stockée par le club</p>
    </div>
  );
}
