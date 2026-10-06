"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, User, Trophy, Bell, Lock } from "lucide-react";
import ImagePicker from "@/components/ImagePicker";
import { PRESET_AVATARS } from "@/lib/images";

export type ProfileData = {
  firstName: string; lastName: string; email: string; phone: string; address: string; level: string;
  playingHand: string; bio: string; emailNotifications: boolean; avatar: string | null;
};

const LEVELS = [["DEBUTANT", "Débutant"], ["INTERMEDIAIRE", "Intermédiaire"], ["CONFIRME", "Confirmé"], ["COMPETITION", "Compétition"]];

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-primary-400"><Icon size={20} /> {title}</h2>
      {children}
    </section>
  );
}

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const [f, setF] = useState(initial);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const set = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) => { setF({ ...f, [k]: v }); setMsg(null); };
  const dirty = JSON.stringify(f) !== JSON.stringify(initial) || !!pw.newPassword;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.newPassword && pw.newPassword !== pw.confirm) return setMsg({ ok: false, text: "Les deux nouveaux mots de passe ne correspondent pas" });
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, level: f.level || null, playingHand: f.playingHand || null, currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
    });
    const data = await res.json();
    setMsg({ ok: res.ok, text: data.message });
    setLoading(false);
    if (res.ok) { setPw({ currentPassword: "", newPassword: "", confirm: "" }); router.refresh(); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section icon={Camera} title="Photo de profil">
        <ImagePicker value={f.avatar} onChange={(v) => set("avatar", v)} presets={PRESET_AVATARS} name={`${f.firstName} ${f.lastName}`} />
      </Section>

      <Section icon={User} title="Informations personnelles">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Prénom</label><input className="input" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} required /></div>
          <div><label className="label">Nom</label><input className="input" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} required /></div>
          <div><label className="label">E-mail</label><input className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><label className="label">Téléphone (MTN Mobile Money)</label><input className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
          <div className="sm:col-span-2"><label className="label">Adresse / quartier <span className="font-normal text-slate-400">(livraisons boutique)</span></label><input className="input" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Ex. Akpakpa, rue 12.045" /></div>
        </div>
      </Section>

      <Section icon={Trophy} title="Profil de joueur">
        <div className="space-y-4">
          <div>
            <label className="label">Niveau</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LEVELS.map(([k, l]) => (
                <button type="button" key={k} onClick={() => set("level", f.level === k ? "" : k)}
                  className={`rounded-xl border-2 py-2.5 text-sm font-semibold ${f.level === k ? "border-accent-500 bg-accent-50 text-primary-400" : "border-slate-100 text-slate-600"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Je joue</label>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {[["RIGHT", "Droitier"], ["LEFT", "Gaucher"]].map(([k, l]) => (
                <button type="button" key={k} onClick={() => set("playingHand", k)} className={`rounded-lg px-5 py-2 text-sm font-semibold ${f.playingHand === k ? "bg-white text-primary-400 shadow-soft" : "text-slate-500"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div><label className="label">À propos de moi <span className="font-normal text-slate-400">({f.bio.length}/300)</span></label>
            <textarea className="input" rows={3} maxLength={300} value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Ex. Je cherche des partenaires de double le samedi matin." /></div>
        </div>
      </Section>

      <Section icon={Bell} title="Notifications">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span><span className="block font-medium text-slate-800">Recevoir les e-mails</span><span className="text-sm text-slate-500">Confirmations de réservation, de commande et de paiement. Les notifications restent visibles dans l'application.</span></span>
          <button type="button" role="switch" aria-checked={f.emailNotifications} onClick={() => set("emailNotifications", !f.emailNotifications)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${f.emailNotifications ? "bg-accent-500" : "bg-slate-300"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${f.emailNotifications ? "left-6" : "left-1"}`} />
          </button>
        </label>
      </Section>

      <Section icon={Lock} title="Mot de passe">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label">Mot de passe actuel</label><input className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
          <div><label className="label">Nouveau</label><input className="input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          <div><label className="label">Confirmer</label><input className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
        </div>
        <p className="mt-2 text-xs text-slate-400">Laissez vide pour garder votre mot de passe actuel.</p>
      </Section>

      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-medium backdrop-blur">
        {msg ? <p className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p> : dirty && <p className="text-sm text-slate-500">Modifications non enregistrées</p>}
        <button className="btn-accent" disabled={loading || !dirty}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer</button>
      </div>
    </form>
  );
}
