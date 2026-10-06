"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CancelButton({ url, label = "Annuler", confirmText = "Confirmer l'annulation ?" }: { url: string; label?: string; confirmText?: string }) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function go() {
    setStep("loading");
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      setError((await res.json()).message);
      setStep("idle");
      return;
    }
    router.refresh();
  }

  if (step === "confirm")
    return (
      <span className="inline-flex items-center justify-end gap-2 whitespace-nowrap text-xs">
        <span className="text-muted">{confirmText}</span>
        <button type="button" onClick={go} className="rounded-full bg-red-600 px-3 py-1 font-bold text-white hover:bg-red-700">Oui</button>
        <button type="button" onClick={() => setStep("idle")} className="rounded-full px-2 py-1 font-semibold text-muted hover:text-ink">Non</button>
      </span>
    );
  return (
    <span className="inline-flex flex-col items-end">
      <button type="button" onClick={() => setStep("confirm")} disabled={step === "loading"}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60">
        {step === "loading" && <Loader2 size={12} className="animate-spin" />}{label}
      </button>
      {error && <span role="alert" className="mt-1 text-xs font-semibold text-red-700">{error}</span>}
    </span>
  );
}
