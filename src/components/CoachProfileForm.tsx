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
      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-400">Photo de la fiche</h2>
          <Link href={`/coachs/${f.id}`} target="_blank" className="flex items-center gap-1 text-sm font-semibold text-primary-400 hover:underline">Voir la fiche publique <ExternalLink size={14} /></Link>
        </div>
        <ImagePicker value={f.photo} onChange={(v) => set("photo", v ?? coach.photo)} presets={PRESET_COACH_PHOTOS} name={`${f.firstName} ${f.lastName}`} rounded={false} />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold text-primary-400">Présentation</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2"><label className="label">Spécialité</label><input className="input" value={f.specialization} onChange={(e) => set("specialization", e.target.value)} required /></div>
          <div><label className="label">Années d'expérience</label><input className="input" type="number" min={0} max={60} value={f.experience} onChange={(e) => set("experience", Number(e.target.value))} /></div>
        </div>
        <div><label className="label">Biographie <span className="font-normal text-slate-400">({f.bio.length}/1200)</span></label><textarea className="input" rows={5} maxLength={1200} value={f.bio} onChange={(e) => set("bio", e.target.value)} required /></div>
        <div><label className="label">Langues parlées</label><input className="input" value={f.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Français, Fon, Anglais" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Diplômes <span className="font-normal text-slate-400">(un par ligne)</span></label><textarea className="input" rows={4} value={f.diplomas} onChange={(e) => set("diplomas", e.target.value)} /></div>
          <div><label className="label">Palmarès <span className="font-normal text-slate-400">(un par ligne)</span></label><textarea className="input" rows={4} value={f.achievements} onChange={(e) => set("achievements", e.target.value)} /></div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-400">Disponibilités</h2>
          <button type="button" onClick={() => set("availability", [...f.availability, { day: "Lundi", hours: "08:00 – 12:00" }])} className="btn-ghost px-3 py-2 text-xs"><Plus size={14} /> Ajouter un créneau</button>
        </div>
        <div className="space-y-2">
          {f.availability.length === 0 && <p className="text-sm text-slate-400">Aucun créneau : ajoutez vos disponibilités habituelles.</p>}
          {f.availability.map((a, i) => (
            <div key={i} className="flex gap-2">
              <select className="input w-40" value={a.day} onChange={(e) => set("availability", f.availability.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input className="input" value={a.hours} onChange={(e) => set("availability", f.availability.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))} placeholder="08:00 – 12:00" />
              <button type="button" onClick={() => set("availability", f.availability.filter((_, j) => j !== i))} className="btn-ghost px-3" aria-label="Supprimer"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      {staff && (
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-primary-400">Réservé à l'équipe du club</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label">Tarif horaire (XOF)</label><input className="input" type="number" min={1000} step="any" value={f.hourlyRate} onChange={(e) => set("hourlyRate", Number(e.target.value))} /></div>
            <div><label className="label">Commission (%)</label><input className="input" type="number" min={0} max={100} value={f.commissionRate} onChange={(e) => set("commissionRate", Number(e.target.value))} /></div>
            <div><label className="label">Statut</label>
              <select className="input" value={f.status} onChange={(e) => set("status", e.target.value)}><option value="ACTIVE">Actif (visible)</option><option value="INACTIVE">Inactif (masqué)</option></select></div>
          </div>
        </section>
      )}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-medium backdrop-blur">
        {msg && <p className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
        <button className="btn-accent" disabled={loading}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer la fiche</button>
      </div>
    </form>
  );
}
