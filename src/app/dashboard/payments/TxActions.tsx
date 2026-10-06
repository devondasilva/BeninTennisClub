"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TxActions({ id, status }: { id: string; status: string }) {
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const action = status === "PENDING" ? "cash" : status === "COMPLETED" ? "refund" : null;
  if (!action) return null;
  async function go() {
    const res = await fetch(`/api/admin/transactions/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setMsg((await res.json()).message);
    setConfirm(false);
    router.refresh();
  }
  if (msg) return <span role="status" className="inline-flex rounded-full bg-lime-light px-2.5 py-1 text-xs font-semibold text-ink">{msg}</span>;
  if (confirm)
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs">
        <span className="text-muted">{action === "cash" ? "Encaissé ?" : "Rembourser ?"}</span>
        <button type="button" onClick={go} className="rounded-full bg-ink px-3 py-1 font-bold text-white hover:bg-brand">Oui</button>
        <button type="button" onClick={() => setConfirm(false)} className="rounded-full px-2 py-1 font-semibold text-muted hover:text-ink">Non</button>
      </span>
    );
  return (
    <button type="button" onClick={() => setConfirm(true)}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold transition-colors ${action === "cash" ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-red-200 bg-white text-red-700 hover:bg-red-50"}`}>
      {action === "cash" ? "Encaisser (espèces)" : "Rembourser"}
    </button>
  );
}
