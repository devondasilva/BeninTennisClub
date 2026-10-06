"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import { ROLE_LABELS } from "@/lib/roles";
import { tileCls } from "@/components/admin/kit";

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
      <div className="card p-8 text-center md:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-lime"><CheckCircle2 size={32} /></span>
        <h2 className="mt-5 font-display text-3xl font-black tracking-tight text-ink">Compte créé</h2>
        <div className="mx-auto mt-6 max-w-md rounded-[1.5rem] border-2 border-dashed border-brand/30 bg-mist p-5 text-left text-sm">
          <p className="text-muted">Identifiant : <b className="text-ink">{f.email}</b></p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-muted">Mot de passe provisoire : <code className="rounded-lg bg-white px-2.5 py-1 font-mono text-base font-bold text-ink ring-1 ring-ink/10">{done.pwd}</code>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(done.pwd); setCopied(true); }} className="inline-flex rounded-lg p-1.5 text-brand hover:bg-white" aria-label="Copier">{copied ? <Check size={16} /> : <Copy size={16} />}</button></p>
          <p className="mt-3 text-xs text-muted">Il ne sera plus affiché : transmettez-le au membre.</p>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={`/dashboard/members/${done.id}`} className="btn-primary">Ouvrir sa fiche (accès précis)</Link>
          <Link href="/dashboard/members" className="btn-ghost">Retour aux adhérents</Link>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="card space-y-6 p-6 md:p-8">
      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="nm-first">Prénom</label><input id="nm-first" className="input" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} required /></div>
        <div><label className="label" htmlFor="nm-last">Nom</label><input id="nm-last" className="input" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} required /></div>
        <div><label className="label" htmlFor="nm-email">E-mail</label><input id="nm-email" className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div><label className="label" htmlFor="nm-phone">Téléphone</label><input id="nm-phone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required /></div>
      </div>
      <div>
        <p className="label">Rôle</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {roles.map(([k, l]) => <button type="button" key={k} aria-pressed={f.role === k} onClick={() => setF({ ...f, role: k })} className={tileCls(f.role === k)}>{l}</button>)}
        </div>
        <p className="mt-2 text-xs text-muted">Vous pourrez ajouter des accès précis depuis sa fiche après la création.</p>
      </div>
      <button className="btn-primary w-full" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Créer le compte</button>
    </form>
  );
}
