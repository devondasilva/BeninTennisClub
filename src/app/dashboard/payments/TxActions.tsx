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
  if (msg) return <span className="text-xs text-emerald-700">{msg}</span>;
  if (confirm) return <span className="whitespace-nowrap text-xs">{action === "cash" ? "Encaissé ?" : "Rembourser ?"} <button onClick={go} className="font-semibold text-primary-400">Oui</button> · <button onClick={() => setConfirm(false)} className="text-slate-500">Non</button></span>;
  return (
    <button onClick={() => setConfirm(true)} className={`whitespace-nowrap text-xs font-semibold hover:underline ${action === "cash" ? "text-emerald-700" : "text-red-600"}`}>
      {action === "cash" ? "Encaisser (espèces)" : "Rembourser"}
    </button>
  );
}
