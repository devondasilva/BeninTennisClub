"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import { ROLE_LABELS } from "@/lib/roles";

export default function NewMemberForm({ canSetRole }: { canSetRole: boolean }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "+229 ", role: "CLIENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ id: string; pwd: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const roles = canSetRole ? Object.entries(ROLE_LABELS) : Object.entries(ROLE_LABELS).filter(([k]) => ["CLIENT", "PARENT"].includes(k));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) return setError(d.message);
    setDone({ id: d.id, pwd: d.tempPassword });
  }

  if (done)
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
        <h2 className="mt-4 text-2xl font-bold text-primary-400">Compte créé</h2>
        <div className="mx-auto mt-5 max-w-md rounded-2xl border-2 border-dashed border-accent-500 bg-accent-50 p-5 text-left text-sm">
          <p>Identifiant : <b>{f.email}</b></p>
          <p className="mt-1">Mot de passe provisoire : <code className="rounded bg-white px-2 py-1 font-mono text-base font-bold text-primary-400">{done.pwd}</code>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(done.pwd); setCopied(true); }} className="ml-2 inline-flex text-primary-400" aria-label="Copier">{copied ? <Check size={16} /> : <Copy size={16} />}</button></p>
          <p className="mt-2 text-xs text-slate-500">Il ne sera plus affiché : transmettez-le au membre.</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/dashboard/members/${done.id}`} className="btn-primary">Ouvrir sa fiche (accès précis)</Link>
          <Link href="/dashboard/members" className="btn-ghost">Retour aux adhérents</Link>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Prénom</label><input className="input" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} required /></div>
        <div><label className="label">Nom</label><input className="input" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} required /></div>
        <div><label className="label">E-mail</label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div><label className="label">Téléphone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required /></div>
      </div>
      <div>
        <label className="label">Rôle</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {roles.map(([k, l]) => <button type="button" key={k} onClick={() => setF({ ...f, role: k })} className={`rounded-xl border-2 py-2.5 text-sm font-semibold ${f.role === k ? "border-accent-500 bg-accent-50 text-primary-400" : "border-slate-100 text-slate-600"}`}>{l}</button>)}
        </div>
        <p className="mt-1 text-xs text-slate-400">Vous pourrez ajouter des accès précis depuis sa fiche après la création.</p>
      </div>
      <button className="btn-accent w-full py-3" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Créer le compte</button>
    </form>
  );
}
