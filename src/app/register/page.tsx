"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "+229 ", password: "", role: "CLIENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) window.location.href = "/dashboard";
    else {
      setError((await res.json()).message);
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Devenir membre" subtitle="Créez votre compte en une minute.">
      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Prénom</label><input className="input" value={form.firstName} onChange={set("firstName")} required /></div>
          <div><label className="label">Nom</label><input className="input" value={form.lastName} onChange={set("lastName")} required /></div>
        </div>
        <div><label className="label">E-mail</label><input className="input" type="email" value={form.email} onChange={set("email")} required /></div>
        <div><label className="label">Téléphone (MTN Money)</label><input className="input" value={form.phone} onChange={set("phone")} required /></div>
        <div>
          <label className="label">Je suis</label>
          <select className="input" value={form.role} onChange={set("role")}>
            <option value="CLIENT">Joueur / joueuse</option>
            <option value="PARENT">Parent d'un jeune joueur</option>
          </select>
        </div>
        <div><label className="label">Mot de passe</label><input className="input" type="password" value={form.password} onChange={set("password")} minLength={8} required /></div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading && <Loader2 className="animate-spin" size={16} />} Créer mon compte
        </button>
        <p className="text-center text-sm text-slate-500">
          Déjà membre ? <Link href="/login" className="font-semibold text-primary-400 hover:underline">Se connecter</Link>
        </p>
      </form>
    </AuthShell>
  );
}
