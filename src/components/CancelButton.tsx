"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <span className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">{confirmText}</span>
        <button onClick={go} className="font-semibold text-red-600 hover:underline">Oui</button>
        <button onClick={() => setStep("idle")} className="text-slate-500 hover:underline">Non</button>
      </span>
    );
  return (
    <span className="flex flex-col items-end">
      <button onClick={() => setStep("confirm")} disabled={step === "loading"} className="text-xs font-semibold text-red-600 hover:underline">{label}</button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
