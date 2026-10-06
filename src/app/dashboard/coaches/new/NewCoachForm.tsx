"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle2, Copy } from "lucide-react";
import ImagePicker from "@/components/ImagePicker";
import { PRESET_COACH_PHOTOS } from "@/lib/images";

export default function NewCoachForm() {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "+229 ", specialization: "", experience: 3, hourlyRate: 10000, commissionRate: 25, bio: "", languages: "Français", diplomas: "", photo: null as string | null, createAccount: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ id: string; name: string; password: string | null; linked: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF({ ...f, [k]: v }); setError(""); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/coaches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message);
    setDone({ id: data.coach.id, name: `${data.coach.firstName} ${data.coach.lastName}`, password: data.tempPassword, linked: data.linkedExisting });
  }

  if (done)
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
        <h2 className="mt-4 text-2xl font-bold text-primary-400">{done.name} fait partie de l'équipe</h2>
        <p className="mt-1 text-slate-500">Sa fiche est en ligne sur la page « Nos coachs ».</p>
        {done.password && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-dashed border-accent-500 bg-accent-50 p-5 text-left">
            <p className="flex items-center gap-2 font-semibold text-primary-400"><KeyRound size={18} /> Accès à l'espace coach</p>
            <p className="mt-2 text-sm text-slate-600">Identifiant : <b>{f.email}</b></p>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              Mot de passe provisoire : <code className="rounded bg-white px-2 py-1 font-mono text-base font-bold text-primary-400">{done.password}</code>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(done.password!); setCopied(true); }} className="text-primary-400" aria-label="Copier"><Copy size={16} /></button>
              {copied && <span className="text-xs text-emerald-700">Copié</span>}
            </div>
            <p className="mt-2 text-xs text-slate-500">Transmettez-le au coach : il pourra le changer dans « Mon profil ». Il ne sera plus affiché.</p>
          </div>
        )}
        {done.linked && <p className="mt-4 text-sm text-slate-600">Ce coach avait déjà un compte membre : il est maintenant relié à sa fiche coach.</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/coachs/${done.id}`} className="btn-ghost">Voir sa fiche publique</Link>
          <Link href={`/dashboard/coaches/${done.id}/edit`} className="btn-primary">Compléter sa fiche</Link>
          <Link href="/dashboard/coaches/new" onClick={() => window.location.reload()} className="btn-accent">Ajouter un autre coach</Link>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-primary-400">Photo</h2>
        <ImagePicker value={f.photo} onChange={(v) => set("photo", v)} presets={PRESET_COACH_PHOTOS} name={`${f.firstName || "Nouveau"} ${f.lastName || "coach"}`} rounded={false} />
      </section>
      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold text-primary-400">Identité & contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Prénom</label><input className="input" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} required /></div>
          <div><label className="label">Nom</label><input className="input" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} required /></div>
          <div><label className="label">E-mail</label><input className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><label className="label">Téléphone</label><input className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
        </div>
      </section>
      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold text-primary-400">Profil sportif</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2"><label className="label">Spécialité</label><input className="input" value={f.specialization} onChange={(e) => set("specialization", e.target.value)} required placeholder="Ex. Mini-tennis, compétition..." /></div>
          <div><label className="label">Années d'expérience</label><input className="input" type="number" min={0} value={f.experience} onChange={(e) => set("experience", Number(e.target.value))} /></div>
        </div>
        <div><label className="label">Biographie</label><textarea className="input" rows={3} value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Parcours, approche pédagogique..." /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Langues</label><input className="input" value={f.languages} onChange={(e) => set("languages", e.target.value)} /></div>
          <div><label className="label">Diplômes <span className="font-normal text-slate-400">(un par ligne)</span></label><textarea className="input" rows={2} value={f.diplomas} onChange={(e) => set("diplomas", e.target.value)} /></div>
        </div>
      </section>
      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold text-primary-400">Tarifs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Tarif horaire (XOF)</label><input className="input" type="number" min={1000} step="any" value={f.hourlyRate} onChange={(e) => set("hourlyRate", Number(e.target.value))} /></div>
          <div><label className="label">Commission reversée au coach (%)</label><input className="input" type="number" min={0} max={100} value={f.commissionRate} onChange={(e) => set("commissionRate", Number(e.target.value))} /></div>
        </div>
        <label className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 ${f.createAccount ? "border-accent-500 bg-accent-50" : "border-slate-100"}`}>
          <input type="checkbox" checked={f.createAccount} onChange={(e) => set("createAccount", e.target.checked)} className="mt-1 h-4 w-4" />
          <span><span className="block font-semibold text-primary-400">Créer son accès à l'espace coach</span><span className="text-sm text-slate-500">Il pourra se connecter, modifier sa fiche et suivre ses commissions. Un mot de passe provisoire vous sera affiché.</span></span>
        </label>
      </section>
      <button className="btn-accent w-full py-3 text-base" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Ajouter le coach</button>
    </form>
  );
}
