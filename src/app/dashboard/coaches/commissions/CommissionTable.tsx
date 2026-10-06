"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui";
import { xof } from "@/lib/format";

type Row = { id: string; coach: string; client: string; date: string; base: number; rate: number; amount: number; status: string; paidAt: string | null };

export default function CommissionTable({ rows, canPay }: { rows: Row[]; canPay: boolean }) {
  const [sel, setSel] = useState<string[]>([]);
  const [method, setMethod] = useState("MTN_MONEY");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const payable = rows.filter((r) => r.status === "COMPLETED");
  const selTotal = rows.filter((r) => sel.includes(r.id)).reduce((s, r) => s + r.amount, 0);

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/coaches/commissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: sel, paymentMethod: method }) });
    setMsg((await res.json()).message);
    setSel([]);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      {canPay && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            {sel.length ? <><b>{sel.length}</b> sélectionnée(s) · <b>{xof(selTotal)}</b></> : "Cochez les commissions terminées à régler"}
            {msg && <span className="ml-3 font-semibold text-emerald-700">{msg}</span>}
          </p>
          <div className="flex items-center gap-2">
            <select className="input w-auto py-2" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="MTN_MONEY">MTN Mobile Money</option><option value="TRANSFER">Virement</option><option value="CASH">Espèces</option>
            </select>
            <button onClick={pay} disabled={!sel.length || loading} className="btn-accent">{loading && <Loader2 size={16} className="animate-spin" />} Marquer comme payées</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {canPay && <th><input type="checkbox" checked={sel.length > 0 && sel.length === payable.length} onChange={(e) => setSel(e.target.checked ? payable.map((p) => p.id) : [])} /></th>}
              <th>Coach</th><th>Client</th><th>Séance</th><th>Base</th><th>Taux</th><th>Commission</th><th>Statut</th><th>Payée le</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {canPay && <td>{r.status === "COMPLETED" && <input type="checkbox" checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} />}</td>}
                <td className="whitespace-nowrap font-medium text-primary-400">{r.coach}</td>
                <td className="whitespace-nowrap">{r.client}</td>
                <td className="whitespace-nowrap">{r.date}</td>
                <td className="whitespace-nowrap">{xof(r.base)}</td>
                <td>{r.rate} %</td>
                <td className="whitespace-nowrap font-semibold">{xof(r.amount)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="whitespace-nowrap text-slate-500">{r.paidAt ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
