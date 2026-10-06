"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, User, Trophy, Bell, Lock } from "lucide-react";
import ImagePicker from "@/components/ImagePicker";
import { PRESET_AVATARS } from "@/lib/images";
import { optionCls } from "@/lib/ui";
import { segItem } from "../_member/ui";

export type ProfileData = {
  firstName: string; lastName: string; email: string; phone: string; address: string; level: string;
  playingHand: string; bio: string; emailNotifications: boolean; avatar: string | null;
};

const LEVELS = [["DEBUTANT", "Débutant"], ["INTERMEDIAIRE", "Intermédiaire"], ["CONFIRME", "Confirmé"], ["COMPETITION", "Compétition"]];

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 md:p-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-xl font-black tracking-tight text-ink">
        <span className="rounded-xl bg-brand-light p-2.5 text-brand"><Icon size={18} /></span> {title}
      </h2>
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
          <div><label className="label" htmlFor="pf-1">Prénom</label><input id="pf-1" className="input" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} required /></div>
          <div><label className="label" htmlFor="pf-2">Nom</label><input id="pf-2" className="input" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} required /></div>
          <div><label className="label" htmlFor="pf-3">E-mail</label><input id="pf-3" className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><label className="label" htmlFor="pf-4">Téléphone (MTN Mobile Money)</label><input id="pf-4" className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="pf-5">Adresse / quartier <span className="font-medium normal-case tracking-normal text-ink/45">(livraisons boutique)</span></label><input id="pf-5" className="input" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Ex. Akpakpa, rue 12.045" /></div>
        </div>
      </Section>

      <Section icon={Trophy} title="Profil de joueur">
        <div className="space-y-4">
          <div>
            <span className="label">Niveau</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LEVELS.map(([k, l]) => (
                <button type="button" key={k} onClick={() => set("level", f.level === k ? "" : k)}
                  aria-pressed={f.level === k} className={`${optionCls(f.level === k)} !py-3 text-center text-sm font-bold ${f.level === k ? "text-brand" : "text-ink/75"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Je joue</span>
            <div className="inline-flex gap-1 rounded-full border border-ink/[0.08] bg-white p-1 shadow-sm" role="group" aria-label="Je joue">
              {[["RIGHT", "Droitier"], ["LEFT", "Gaucher"]].map(([k, l]) => (
                <button type="button" key={k} onClick={() => set("playingHand", k)} aria-pressed={f.playingHand === k} className={segItem(f.playingHand === k)}>{l}</button>
              ))}
            </div>
          </div>
          <div><label className="label" htmlFor="pf-6">À propos de moi <span className="font-medium normal-case tracking-normal text-ink/45">({f.bio.length}/300)</span></label>
            <textarea id="pf-6" className="input" rows={3} maxLength={300} value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Ex. Je cherche des partenaires de double le samedi matin." /></div>
        </div>
      </Section>

      <Section icon={Bell} title="Notifications">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span><span className="block font-bold text-ink">Recevoir les e-mails</span><span className="text-sm text-muted">Confirmations de réservation, de commande et de paiement. Les notifications restent visibles dans l'application.</span></span>
          <button type="button" role="switch" aria-label="Recevoir les e-mails" aria-checked={f.emailNotifications} onClick={() => set("emailNotifications", !f.emailNotifications)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${f.emailNotifications ? "bg-brand" : "bg-ink/20"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${f.emailNotifications ? "left-6" : "left-1"}`} />
          </button>
        </label>
      </Section>

      <Section icon={Lock} title="Mot de passe">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="pf-7">Mot de passe actuel</label><input id="pf-7" className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
          <div><label className="label" htmlFor="pf-8">Nouveau</label><input id="pf-8" className="input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></div>
          <div><label className="label" htmlFor="pf-9">Confirmer</label><input id="pf-9" className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
        </div>
        <p className="mt-3 text-xs text-muted">Laissez vide pour garder votre mot de passe actuel.</p>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-[1.5rem] border border-ink/[0.08] bg-white/95 p-3 pl-5 shadow-medium backdrop-blur">
        {msg ? <p role="status" className={`mr-auto text-sm font-semibold ${msg.ok ? "text-emerald-800" : "text-red-700"}`}>{msg.text}</p> : dirty && <p className="mr-auto text-sm text-muted">Modifications non enregistrées</p>}
        <button className="btn-primary" disabled={loading || !dirty}>{loading && <Loader2 size={16} className="animate-spin" />} Enregistrer</button>
      </div>
    </form>
  );
}
