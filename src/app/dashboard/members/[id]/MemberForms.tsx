"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Lock, KeyRound, Ban, RotateCcw, Trash2, Copy, Check } from "lucide-react";
import { PERMISSIONS, ROLE_PRESETS } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/roles";

async function patch(id: string, body: object) {
  const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, message: (await res.json()).message as string };
}

function Msg({ m }: { m: { ok: boolean; message: string } | null }) {
  if (!m) return null;
  return <p className={`text-sm font-medium ${m.ok ? "text-emerald-700" : "text-red-600"}`}>{m.message}</p>;
}

export function InfoForm({ id, initial }: { id: string; initial: { firstName: string; lastName: string; email: string; phone: string; address: string } }) {
  const [f, setF] = useState(initial);
  const [m, setM] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); const r = await patch(id, { kind: "info", ...f }); setM(r); setLoading(false); if (r.ok) router.refresh(); }} className="card space-y-4 p-6">
      <h2 className="text-lg font-bold text-primary-400">Informations</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Prénom</label><input className="input" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} required /></div>
        <div><label className="label">Nom</label><input className="input" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} required /></div>
        <div><label className="label">E-mail</label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div><label className="label">Téléphone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required /></div>
        <div className="sm:col-span-2"><label className="label">Adresse</label><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      </div>
      <div className="flex items-center justify-end gap-3"><Msg m={m} /><button className="btn-primary" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer</button></div>
    </form>
  );
}

const GROUPS = ["Club", "Activités", "Ventes"];

export function AccessForm({ id, initialRole, initialPerms, self }: { id: string; initialRole: string; initialPerms: string[]; self: boolean }) {
  const [role, setRole] = useState(initialRole);
  const [extra, setExtra] = useState<string[]>(initialPerms);
  const [m, setM] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const preset = new Set<string>(ROLE_PRESETS[role] ?? []);
  const toggle = (p: string) => { setExtra(extra.includes(p) ? extra.filter((x) => x !== p) : [...extra, p]); setM(null); };
  const total = new Set([...preset, ...extra].filter((p) => p in PERMISSIONS)).size;

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); const r = await patch(id, { kind: "access", role, permissions: extra.filter((p) => !preset.has(p)) }); setM(r); setLoading(false); if (r.ok) router.refresh(); }} className="card space-y-5 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-primary-400"><ShieldCheck size={20} /> Rôle & accès</h2>
        <p className="text-sm text-slate-500">Le rôle donne un ensemble d'accès par défaut. Vous pouvez y ajouter des accès précis, un par un.</p>
      </div>
      {self && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Vous ne pouvez pas modifier vos propres accès.</p>}
      <div>
        <label className="label">Rôle</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(ROLE_LABELS).map(([k, l]) => (
            <button type="button" key={k} disabled={self} onClick={() => { setRole(k); setM(null); }}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${role === k ? "border-accent-500 bg-accent-50 text-primary-400" : "border-slate-100 text-slate-600 hover:border-slate-200"}`}>{l}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {role === "ADMIN" ? "Administrateur : contrôle total, y compris la gestion des accès." : role === "MANAGER" ? "Gestionnaire : tous les outils de gestion, sauf l'attribution des accès." : preset.size ? `Inclut : ${[...preset].map((p) => PERMISSIONS[p as keyof typeof PERMISSIONS]?.label).filter(Boolean).join(", ")}.` : "Aucun accès de gestion par défaut."}
        </p>
      </div>
      {role !== "ADMIN" && (
        <div className="space-y-4">
          <p className="label mb-0">Accès précis <span className="font-normal text-slate-400">({total} accès au total)</span></p>
          {GROUPS.map((g) => (
            <div key={g}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{g}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(PERMISSIONS).filter(([, v]) => v.group === g).map(([k, v]) => {
                  const inPreset = preset.has(k);
                  const on = inPreset || extra.includes(k);
                  return (
                    <label key={k} className={`flex gap-3 rounded-xl border-2 p-3 transition ${on ? "border-accent-500 bg-accent-50" : "border-slate-100"} ${inPreset || self ? "cursor-default" : "cursor-pointer hover:border-slate-200"}`}>
                      <input type="checkbox" checked={on} disabled={inPreset || self} onChange={() => toggle(k)} className="mt-0.5 h-4 w-4" />
                      <span>
                        <span className="block text-sm font-semibold text-primary-400">{v.label} {inPreset && <span className="ml-1 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">inclus avec le rôle</span>}</span>
                        <span className="text-xs text-slate-500">{v.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-end gap-3"><Msg m={m} /><button className="btn-accent" disabled={loading || self}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer les accès</button></div>
    </form>
  );
}

export function AccountActions({ id, status, self, canDelete, name }: { id: string; status: string; self: boolean; canDelete: boolean; name: string }) {
  const [m, setM] = useState<{ ok: boolean; message: string } | null>(null);
  const [pwd, setPwd] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<"" | "suspend" | "delete">("");
  const router = useRouter();

  async function setStatus(s: string) { const r = await patch(id, { kind: "status", status: s }); setM(r); setConfirm(""); router.refresh(); }
  async function reset() {
    const res = await fetch(`/api/admin/users/${id}/password`, { method: "POST" });
    const d = await res.json();
    if (res.ok) setPwd(d.tempPassword); else setM({ ok: false, message: d.message });
  }
  async function remove() {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (res.ok) window.location.href = `/dashboard/members?ok=${encodeURIComponent(`${name} : ${d.message}`)}`;
    else { setM({ ok: false, message: d.message }); setConfirm(""); }
  }

  return (
    <div className="card space-y-4 p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-primary-400"><Lock size={20} /> Compte</h2>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-ghost"><KeyRound size={16} /> Réinitialiser le mot de passe</button>
        {!self && (status === "ACTIVE" ? (
          confirm === "suspend"
            ? <span className="self-center text-sm">Suspendre ce compte ? <button onClick={() => setStatus("SUSPENDED")} className="font-semibold text-red-600">Oui</button> · <button onClick={() => setConfirm("")} className="text-slate-500">Non</button></span>
            : <button type="button" onClick={() => setConfirm("suspend")} className="btn bg-amber-100 text-amber-900 hover:bg-amber-200"><Ban size={16} /> Suspendre le compte</button>
        ) : (
          <button type="button" onClick={() => setStatus("ACTIVE")} className="btn bg-emerald-100 text-emerald-900 hover:bg-emerald-200"><RotateCcw size={16} /> Réactiver le compte</button>
        ))}
        {!self && canDelete && (confirm === "delete"
          ? <span className="self-center text-sm">Supprimer définitivement {name} et tout son historique ? <button onClick={remove} className="font-semibold text-red-600">Oui, supprimer</button> · <button onClick={() => setConfirm("")} className="text-slate-500">Non</button></span>
          : <button type="button" onClick={() => setConfirm("delete")} className="btn bg-red-50 text-red-700 hover:bg-red-100"><Trash2 size={16} /> Supprimer le compte</button>)}
      </div>
      {pwd && (
        <div className="rounded-xl border-2 border-dashed border-accent-500 bg-accent-50 p-4 text-sm">
          Mot de passe provisoire : <code className="rounded bg-white px-2 py-1 font-mono text-base font-bold text-primary-400">{pwd}</code>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(pwd); setCopied(true); }} className="ml-2 inline-flex items-center text-primary-400" aria-label="Copier">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
          <p className="mt-1 text-xs text-slate-500">Transmettez-le au membre ; il pourra le changer dans « Mon profil ».</p>
        </div>
      )}
      <Msg m={m} />
    </div>
  );
}
