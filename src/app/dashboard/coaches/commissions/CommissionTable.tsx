"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
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
    <section className="card overflow-hidden">
      {canPay && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] p-5 md:p-6">
          <div>
            <h2 className="font-display text-xl font-black tracking-tight text-ink">Règlement</h2>
            <p className="text-sm text-muted">
              {sel.length ? <><b className="text-ink">{sel.length}</b> sélectionnée(s) · <b className="text-ink">{xof(selTotal)}</b></> : "Cochez les commissions terminées à régler"}
            </p>
            {msg && <p role="status" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-lime-light px-3 py-1 text-sm font-semibold text-ink"><CheckCircle2 size={15} className="text-accent-700" /> {msg}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Moyen de paiement" className="input w-auto py-2.5" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="MTN_MONEY">MTN Mobile Money</option><option value="TRANSFER">Virement</option><option value="CASH">Espèces</option>
            </select>
            <button onClick={pay} disabled={!sel.length || loading} className="btn-primary">{loading && <Loader2 size={16} className="animate-spin" />} Marquer comme payées</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {canPay && <th><input type="checkbox" aria-label="Tout sélectionner" className="h-4 w-4 accent-[#1F5996]" checked={sel.length > 0 && sel.length === payable.length} onChange={(e) => setSel(e.target.checked ? payable.map((p) => p.id) : [])} /></th>}
              <th>Coach</th><th>Client</th><th>Séance</th><th>Base</th><th>Taux</th><th>Commission</th><th>Statut</th><th>Payée le</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={sel.includes(r.id) ? "bg-brand/[0.04]" : "transition-colors hover:bg-mist/60"}>
                {canPay && <td>{r.status === "COMPLETED" && <input type="checkbox" aria-label={`Sélectionner la commission de ${r.coach}`} className="h-4 w-4 accent-[#1F5996]" checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} />}</td>}
                <td className="whitespace-nowrap font-bold text-ink">{r.coach}</td>
                <td className="whitespace-nowrap">{r.client}</td>
                <td className="whitespace-nowrap">{r.date}</td>
                <td className="tabular whitespace-nowrap">{xof(r.base)}</td>
                <td>{r.rate} %</td>
                <td className="tabular whitespace-nowrap font-bold text-ink">{xof(r.amount)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="whitespace-nowrap text-muted">{r.paidAt ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-12 text-center text-muted">Aucune commission pour ces filtres.</p>}
      </div>
    </section>
  );
}
