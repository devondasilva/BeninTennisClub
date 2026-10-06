"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import ImagePicker from "./ImagePicker";
import { PRESET_COACH_PHOTOS } from "@/lib/images";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export type CoachFormData = {
  id: string; firstName: string; lastName: string; specialization: string; bio: string; languages: string;
  diplomas: string; achievements: string; experience: number; photo: string | null;
  availability: { day: string; hours: string }[]; hourlyRate: number; commissionRate: number; status: string;
};

export default function CoachProfileForm({ coach, staff }: { coach: CoachFormData; staff: boolean }) {
  const [f, setF] = useState(coach);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const set = <K extends keyof CoachFormData>(k: K, v: CoachFormData[K]) => setF({ ...f, [k]: v });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { id, firstName, lastName, ...body } = f;
    const payload = staff ? body : { ...body, hourlyRate: undefined, commissionRate: undefined, status: undefined };
    const res = await fetch(`/api/coaches/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setMsg({ ok: res.ok, text: data.message });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-black tracking-tight text-ink">Photo de la fiche</h2>
          <Link href={`/coachs/${f.id}`} target="_blank" className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">Voir la fiche publique <ExternalLink size={14} /></Link>
        </div>
        <ImagePicker value={f.photo} onChange={(v) => set("photo", v ?? coach.photo)} presets={PRESET_COACH_PHOTOS} name={`${f.firstName} ${f.lastName}`} rounded={false} />
      </section>

      <section className="card space-y-4 p-6 md:p-8">
        <h2 className="mb-2 font-display text-xl font-black tracking-tight text-ink">Présentation</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2"><label className="label" htmlFor="cp-1">Spécialité</label><input id="cp-1" className="input" value={f.specialization} onChange={(e) => set("specialization", e.target.value)} required /></div>
          <div><label className="label" htmlFor="cp-2">Années d'expérience</label><input id="cp-2" className="input" type="number" min={0} max={60} value={f.experience} onChange={(e) => set("experience", Number(e.target.value))} /></div>
        </div>
        <div><label className="label" htmlFor="cp-3">Biographie <span className="font-medium normal-case tracking-normal text-ink/45">({f.bio.length}/1200)</span></label><textarea id="cp-3" className="input" rows={5} maxLength={1200} value={f.bio} onChange={(e) => set("bio", e.target.value)} required /></div>
        <div><label className="label" htmlFor="cp-4">Langues parlées</label><input id="cp-4" className="input" value={f.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Français, Fon, Anglais" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label" htmlFor="cp-5">Diplômes <span className="font-medium normal-case tracking-normal text-ink/45">(un par ligne)</span></label><textarea id="cp-5" className="input" rows={4} value={f.diplomas} onChange={(e) => set("diplomas", e.target.value)} /></div>
          <div><label className="label" htmlFor="cp-6">Palmarès <span className="font-medium normal-case tracking-normal text-ink/45">(un par ligne)</span></label><textarea id="cp-6" className="input" rows={4} value={f.achievements} onChange={(e) => set("achievements", e.target.value)} /></div>
        </div>
      </section>

      <section className="card p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-black tracking-tight text-ink">Disponibilités</h2>
          <button type="button" onClick={() => set("availability", [...f.availability, { day: "Lundi", hours: "08:00 – 12:00" }])} className="btn-ghost btn-sm"><Plus size={14} /> Ajouter un créneau</button>
        </div>
        <div className="space-y-2">
          {f.availability.length === 0 && <p className="rounded-2xl border-2 border-dashed border-ink/10 p-5 text-center text-sm text-muted">Aucun créneau : ajoutez vos disponibilités habituelles.</p>}
          {f.availability.map((a, i) => (
            <div key={i} className="flex flex-wrap gap-2 sm:flex-nowrap">
              <select aria-label="Jour" className="input w-full sm:w-44" value={a.day} onChange={(e) => set("availability", f.availability.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input aria-label="Horaires" className="input min-w-0 flex-1" value={a.hours} onChange={(e) => set("availability", f.availability.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))} placeholder="08:00 – 12:00" />
              <button type="button" onClick={() => set("availability", f.availability.filter((_, j) => j !== i))} className="btn-ghost shrink-0 !px-3.5" aria-label="Supprimer ce créneau"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      {staff && (
        <section className="card p-6 md:p-8">
          <h2 className="mb-5 font-display text-xl font-black tracking-tight text-ink">Réservé à l'équipe du club</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="cp-7">Tarif horaire (XOF)</label><input id="cp-7" className="input" type="number" min={1000} step="any" value={f.hourlyRate} onChange={(e) => set("hourlyRate", Number(e.target.value))} /></div>
            <div><label className="label" htmlFor="cp-8">Commission (%)</label><input id="cp-8" className="input" type="number" min={0} max={100} value={f.commissionRate} onChange={(e) => set("commissionRate", Number(e.target.value))} /></div>
            <div><label className="label" htmlFor="cp-9">Statut</label>
              <select id="cp-9" className="input" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="ACTIVE">Actif (visible)</option><option value="INACTIVE">Inactif (masqué)</option></select></div>
          </div>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-[1.5rem] border border-ink/[0.08] bg-white/95 p-3 pl-5 shadow-medium backdrop-blur">
        {msg && <p role="status" className={`mr-auto text-sm font-semibold ${msg.ok ? "text-emerald-800" : "text-red-700"}`}>{msg.text}</p>}
        <button className="btn-primary" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer la fiche</button>
      </div>
    </form>
  );
}
