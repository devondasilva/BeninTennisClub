"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle2, Copy } from "lucide-react";
import ImagePicker from "@/components/ImagePicker";
import { PRESET_COACH_PHOTOS } from "@/lib/images";
import { optionCls } from "@/lib/ui";
import { SelectedTick, StepTitle } from "../../_member/ui";

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
      <div className="card p-8 text-center md:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime text-ink"><CheckCircle2 size={34} /></span>
        <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-ink md:text-3xl">{done.name} fait partie de l'équipe</h2>
        <p className="mt-1 text-muted">Sa fiche est en ligne sur la page « Nos coachs ».</p>
        {done.password && (
          <div className="mx-auto mt-6 max-w-md rounded-[1.75rem] bg-ink p-6 text-left text-white">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-lime"><KeyRound size={16} /> Accès à l'espace coach</p>
            <p className="mt-3 text-sm text-white/75">Identifiant : <b>{f.email}</b></p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/75">
              Mot de passe provisoire : <code className="rounded-lg bg-white px-2.5 py-1 font-mono text-base font-bold text-ink">{done.password}</code>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(done.password!); setCopied(true); }} className="rounded-lg p-1.5 text-lime hover:bg-white/10" aria-label="Copier"><Copy size={16} /></button>
              {copied && <span className="text-xs text-lime">Copié</span>}
            </div>
            <p className="mt-3 text-xs text-white/55">Transmettez-le au coach : il pourra le changer dans « Mon profil ». Il ne sera plus affiché.</p>
          </div>
        )}
        {done.linked && <p className="mt-4 text-sm text-muted">Ce coach avait déjà un compte membre : il est maintenant relié à sa fiche coach.</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/coachs/${done.id}`} className="btn-ghost">Voir sa fiche publique</Link>
          <Link href={`/dashboard/coaches/${done.id}/edit`} className="btn-primary">Compléter sa fiche</Link>
          <Link href="/dashboard/coaches/new" onClick={() => window.location.reload()} className="btn-accent">Ajouter un autre coach</Link>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <section className="card p-6 md:p-8">
        <StepTitle n={1} title="Photo" hint="Importez une photo ou choisissez une illustration." />
        <ImagePicker value={f.photo} onChange={(v) => set("photo", v)} presets={PRESET_COACH_PHOTOS} name={`${f.firstName || "Nouveau"} ${f.lastName || "coach"}`} rounded={false} />
      </section>
      <section className="card space-y-4 p-6 md:p-8">
        <StepTitle n={2} title="Identité & contact" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="nc-1">Prénom</label><input id="nc-1" className="input" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} required /></div>
          <div><label className="label" htmlFor="nc-2">Nom</label><input id="nc-2" className="input" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} required /></div>
          <div><label className="label" htmlFor="nc-3">E-mail</label><input id="nc-3" className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><label className="label" htmlFor="nc-4">Téléphone</label><input id="nc-4" className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
        </div>
      </section>
      <section className="card space-y-4 p-6 md:p-8">
        <StepTitle n={3} title="Profil sportif" hint="Affiché sur la page publique « Nos coachs »." />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2"><label className="label" htmlFor="nc-5">Spécialité</label><input id="nc-5" className="input" value={f.specialization} onChange={(e) => set("specialization", e.target.value)} required placeholder="Ex. Mini-tennis, compétition..." /></div>
          <div><label className="label" htmlFor="nc-6">Années d'expérience</label><input id="nc-6" className="input" type="number" min={0} value={f.experience} onChange={(e) => set("experience", Number(e.target.value))} /></div>
        </div>
        <div><label className="label" htmlFor="nc-7">Biographie</label><textarea id="nc-7" className="input" rows={3} value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Parcours, approche pédagogique..." /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="nc-8">Langues</label><input id="nc-8" className="input" value={f.languages} onChange={(e) => set("languages", e.target.value)} /></div>
          <div><label className="label" htmlFor="nc-9">Diplômes <span className="font-medium normal-case tracking-normal text-ink/45">(un par ligne)</span></label><textarea id="nc-9" className="input" rows={2} value={f.diplomas} onChange={(e) => set("diplomas", e.target.value)} /></div>
        </div>
      </section>
      <section className="card space-y-4 p-6 md:p-8">
        <StepTitle n={4} title="Tarifs & accès" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="nc-10">Tarif horaire (XOF)</label><input id="nc-10" className="input" type="number" min={1000} step="any" value={f.hourlyRate} onChange={(e) => set("hourlyRate", Number(e.target.value))} /></div>
          <div><label className="label" htmlFor="nc-11">Commission reversée au coach (%)</label><input id="nc-11" className="input" type="number" min={0} max={100} value={f.commissionRate} onChange={(e) => set("commissionRate", Number(e.target.value))} /></div>
        </div>
        <label className={`${optionCls(f.createAccount)} flex gap-3`}>
          <SelectedTick show={f.createAccount} />
          <input type="checkbox" checked={f.createAccount} onChange={(e) => set("createAccount", e.target.checked)} className="mt-1 h-4 w-4 accent-[#1F5996]" />
          <span className="pr-8"><span className="block font-bold text-ink">Créer son accès à l'espace coach</span><span className="text-sm text-muted">Il pourra se connecter, modifier sa fiche et suivre ses commissions. Un mot de passe provisoire vous sera affiché.</span></span>
        </label>
      </section>
      <button className="btn-primary w-full" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Ajouter le coach</button>
    </form>
  );
}
