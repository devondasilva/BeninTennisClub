"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const [v, setV] = useState(status);
  const router = useRouter();
  async function change(next: string) {
    setV(next);
    await fetch(`/api/stringing/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    router.refresh();
  }
  return (
    <select value={v} onChange={(e) => change(e.target.value)} aria-label="Statut de la demande" className="input w-auto shrink-0 rounded-xl px-3 py-1.5 text-xs">
      <option value="PENDING">En attente</option><option value="IN_PROGRESS">En cours</option>
      <option value="READY_FOR_PICKUP">Prêt à récupérer</option><option value="COMPLETED">Terminé</option>
    </select>
  );
}
