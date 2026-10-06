"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Bouton qui appelle une API en POST puis redirige (paymentUrl) ou rafraîchit la page */
export default function ActionButton({ url, children, className = "btn-accent", body }: { url: string; children: React.ReactNode; className?: string; body?: object }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function go() {
    setLoading(true);
    setError("");
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setLoading(false); return; }
    if (data.paymentUrl) window.location.href = data.paymentUrl;
    else { router.refresh(); setLoading(false); }
  }

  return (
    <div className="w-full">
      <button type="button" onClick={go} disabled={loading} aria-busy={loading} className={`${className} w-full`}>
        {loading && <Loader2 size={16} className="animate-spin" />} {children}
      </button>
      {error && <p role="alert" className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
