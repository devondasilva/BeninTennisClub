"use client";

import { useState } from "react";
import { Truck, PackageCheck, XCircle, Loader2 } from "lucide-react";

export default function OrderStatus({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState("");

  async function set(next: string) {
    setLoading(next);
    setError("");
    const res = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    if (!res.ok) { setError((await res.json()).message); setLoading(""); setConfirmCancel(false); return; }
    const url = new URL(window.location.href);
    url.searchParams.set("ok", { SHIPPED: "Commande marquée expédiée, le client est prévenu.", DELIVERED: "Commande marquée livrée.", CANCELLED: "Commande annulée, articles remis en stock.", PAID: "Commande mise à jour." }[next] ?? "Commande mise à jour.");
    window.location.href = url.toString();
  }

  if (status === "CANCELLED" || status === "DELIVERED") return null;
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {status === "PAID" && <button onClick={() => set("SHIPPED")} disabled={!!loading} className="btn-primary px-3 py-1.5 text-xs">{loading === "SHIPPED" ? <Loader2 size={13} className="animate-spin" /> : <Truck size={13} />} Marquer expédiée</button>}
      {status === "SHIPPED" && <button onClick={() => set("DELIVERED")} disabled={!!loading} className="btn-accent px-3 py-1.5 text-xs">{loading === "DELIVERED" ? <Loader2 size={13} className="animate-spin" /> : <PackageCheck size={13} />} Marquer livrée</button>}
      {confirmCancel ? (
        <span className="text-xs"><span className="text-slate-500">Annuler et remettre en stock ?</span> <button onClick={() => set("CANCELLED")} className="font-semibold text-red-600">Oui</button> · <button onClick={() => setConfirmCancel(false)} className="text-slate-500">Non</button></span>
      ) : (
        <button onClick={() => setConfirmCancel(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"><XCircle size={13} /> Annuler</button>
      )}
      {error && <p className="w-full text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
