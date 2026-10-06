"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";

const DEMO = [
  { email: "client@btc.bj", label: "Adhérent" },
  { email: "admin@btc.bj", label: "Administrateur" },
  { email: "manager@btc.bj", label: "Gestionnaire" },
  { email: "coach@btc.bj", label: "Coach" },
  { email: "boutique@btc.bj", label: "Accès boutique seulement" },
];

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent, creds?: { email: string; password: string }) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds ?? { email, password }),
    });
    if (res.ok) {
      window.location.href = params.get("next") || "/dashboard";
    } else {
      setError((await res.json()).message);
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label">E-mail</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.bj" />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading && <Loader2 className="animate-spin" size={16} />} Se connecter
        </button>
        <p className="text-center text-sm text-slate-500">
          Pas encore membre ? <Link href="/register" className="font-semibold text-primary-400 hover:underline">Créer un compte</Link>
        </p>
      </form>
      <div className="mt-6 rounded-2xl border border-dashed border-accent-500 bg-accent-50 p-4">
        <p className="text-sm font-semibold text-primary-400">Comptes de démonstration (mot de passe : demo1234)</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DEMO.map((d) => (
            <button key={d.email} type="button" onClick={() => submit(undefined, { email: d.email, password: "demo1234" })}
              className="rounded-xl bg-white px-3 py-2 text-left text-xs shadow-soft hover:bg-accent-100">
              <span className="block font-semibold text-primary-400">{d.label}</span>
              <span className="text-slate-500">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Bon retour !" subtitle="Connectez-vous pour réserver, payer et suivre vos activités.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
