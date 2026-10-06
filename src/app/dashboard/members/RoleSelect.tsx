"use client";

import { useState } from "react";
import { ROLE_LABELS } from "@/lib/roles";

export default function RoleSelect({ id, role }: { id: string; role: string }) {
  const [v, setV] = useState(role);
  const [saved, setSaved] = useState(false);
  async function change(r: string) {
    setV(r);
    const res = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: r }) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 1500); }
  }
  return (
    <span className="flex items-center gap-2">
      <select value={v} onChange={(e) => change(e.target.value)} className="input w-auto py-1.5 text-xs">
        {Object.entries(ROLE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      {saved && <span className="text-xs text-emerald-600">✓</span>}
    </span>
  );
}
