"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Lock, KeyRound, Ban, RotateCcw, Trash2, Copy, Check, UserRound } from "lucide-react";
import { PERMISSIONS, ROLE_PRESETS } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/roles";
import { tileCls } from "@/components/admin/kit";

async function patch(id: string, body: object) {
  const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, message: (await res.json()).message as string };
}

function Msg({ m }: { m: { ok: boolean; message: string } | null }) {
  if (!m) return null;
  return <p role="status" className={`text-sm font-semibold ${m.ok ? "text-emerald-700" : "text-red-600"}`}>{m.message}</p>;
}

function Title({ icon: Icon, children, tone = "bg-brand-light text-brand" }: { icon: React.ElementType; children: React.ReactNode; tone?: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-ink">
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}><Icon size={18} /></span>{children}
    </h2>
  );
}

export function InfoForm({ id, initial }: { id: string; initial: { firstName: string; lastName: string; email: string; phone: string; address: string } }) {
  const [f, setF] = useState(initial);
  const [m, setM] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); const r = await patch(id, { kind: "info", ...f }); setM(r); setLoading(false); if (r.ok) router.refresh(); }} className="card space-y-5 p-6 md:p-8">
      <Title icon={UserRound}>Informations</Title>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="mi-first">Prénom</label><input id="mi-first" className="input" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} required /></div>
        <div><label className="label" htmlFor="mi-last">Nom</label><input id="mi-last" className="input" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} required /></div>
        <div><label className="label" htmlFor="mi-email">E-mail</label><input id="mi-email" className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div><label className="label" htmlFor="mi-phone">Téléphone</label><input id="mi-phone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="mi-address">Adresse</label><input id="mi-address" className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3"><Msg m={m} /><button className="btn-primary" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer</button></div>
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
    <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); const r = await patch(id, { kind: "access", role, permissions: extra.filter((p) => !preset.has(p)) }); setM(r); setLoading(false); if (r.ok) router.refresh(); }} className="card space-y-6 p-6 md:p-8">
      <div>
        <Title icon={ShieldCheck} tone="bg-ink text-lime">Rôle & accès</Title>
        <p className="mt-2 text-sm text-muted">Le rôle donne un ensemble d'accès par défaut. Vous pouvez y ajouter des accès précis, un par un.</p>
      </div>
      {self && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Vous ne pouvez pas modifier vos propres accès.</p>}
      <div>
        <p className="label">Rôle</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(ROLE_LABELS).map(([k, l]) => (
            <button type="button" key={k} disabled={self} aria-pressed={role === k} onClick={() => { setRole(k); setM(null); }} className={tileCls(role === k)}>{l}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {role === "ADMIN" ? "Administrateur : contrôle total, y compris la gestion des accès." : role === "MANAGER" ? "Gestionnaire : tous les outils de gestion, sauf l'attribution des accès." : preset.size ? `Inclut : ${[...preset].map((p) => PERMISSIONS[p as keyof typeof PERMISSIONS]?.label).filter(Boolean).join(", ")}.` : "Aucun accès de gestion par défaut."}
        </p>
      </div>
      {role !== "ADMIN" && (
        <div className="space-y-5">
          <p className="label mb-0">Accès précis <span className="ml-1 rounded-full bg-ink px-2 py-0.5 text-[10px] tracking-wider text-white">{total} accès au total</span></p>
          {GROUPS.map((g) => (
            <div key={g}>
              <p className="eyebrow mb-2.5">{g}</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {Object.entries(PERMISSIONS).filter(([, v]) => v.group === g).map(([k, v]) => {
                  const inPreset = preset.has(k);
                  const on = inPreset || extra.includes(k);
                  return (
                    <label key={k} className={`flex gap-3 rounded-2xl border-2 p-3.5 transition ${on ? "border-brand bg-brand/[0.05]" : "border-ink/[0.08] bg-white"} ${inPreset || self ? "cursor-default" : "cursor-pointer hover:border-ink/20"}`}>
                      <input type="checkbox" checked={on} disabled={inPreset || self} onChange={() => toggle(k)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#1F5996]" />
                      <span>
                        <span className="block text-sm font-semibold text-ink">{v.label} {inPreset && <span className="ml-1 rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">inclus avec le rôle</span>}</span>
                        <span className="text-xs text-muted">{v.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-end gap-3"><Msg m={m} /><button className="btn-primary" disabled={loading || self}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer les accès</button></div>
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
    <div className="card space-y-5 p-6 md:p-8">
      <Title icon={Lock} tone="bg-orange-50 text-orange-600">Compte</Title>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-ghost btn-sm"><KeyRound size={16} /> Réinitialiser le mot de passe</button>
        {!self && (status === "ACTIVE" ? (
          confirm === "suspend"
            ? <span className="self-center text-sm">Suspendre ce compte ? <button onClick={() => setStatus("SUSPENDED")} className="font-semibold text-red-600">Oui</button> · <button onClick={() => setConfirm("")} className="text-muted">Non</button></span>
            : <button type="button" onClick={() => setConfirm("suspend")} className="btn btn-sm bg-amber-100 text-amber-900 hover:bg-amber-200"><Ban size={16} /> Suspendre le compte</button>
        ) : (
          <button type="button" onClick={() => setStatus("ACTIVE")} className="btn btn-sm bg-emerald-100 text-emerald-900 hover:bg-emerald-200"><RotateCcw size={16} /> Réactiver le compte</button>
        ))}
        {!self && canDelete && (confirm === "delete"
          ? <span className="self-center text-sm">Supprimer définitivement {name} et tout son historique ? <button onClick={remove} className="font-semibold text-red-600">Oui, supprimer</button> · <button onClick={() => setConfirm("")} className="text-muted">Non</button></span>
          : <button type="button" onClick={() => setConfirm("delete")} className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100"><Trash2 size={16} /> Supprimer le compte</button>)}
      </div>
      {pwd && (
        <div className="rounded-[1.5rem] border-2 border-dashed border-brand/30 bg-mist p-5 text-sm">
          <p className="flex flex-wrap items-center gap-2 text-muted">Mot de passe provisoire : <code className="rounded-lg bg-white px-2.5 py-1 font-mono text-base font-bold text-ink ring-1 ring-ink/10">{pwd}</code>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(pwd); setCopied(true); }} className="inline-flex items-center rounded-lg p-1.5 text-brand hover:bg-white" aria-label="Copier">{copied ? <Check size={16} /> : <Copy size={16} />}</button></p>
          <p className="mt-2 text-xs text-muted">Transmettez-le au membre ; il pourra le changer dans « Mon profil ».</p>
        </div>
      )}
      <Msg m={m} />
    </div>
  );
}
