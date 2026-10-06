"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { safeNext } from "@/lib/safe-redirect";

const DEMO = [
  { email: "client@btc.bj", label: "Adhérent" },
  { email: "admin@btc.bj", label: "Administrateur" },
  { email: "manager@btc.bj", label: "Gestionnaire" },
  { email: "coach@btc.bj", label: "Coach" },
  { email: "boutique@btc.bj", label: "Accès boutique seulement" },
];

function LoginForm({ notice }: { notice?: string }) {
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
      window.location.href = safeNext(params.get("next"));
    } else {
      setError((await res.json()).message);
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card space-y-5 p-7 md:p-8">
        {notice && !error && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{notice}</p>}
        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div>
          <label className="label">E-mail</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.bj" />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" size={16} />} Se connecter
        </button>
        <p className="text-center text-sm text-muted">
          Pas encore membre ? <Link href="/register" className="font-bold text-brand underline decoration-2 underline-offset-4 hover:text-ink">Créer un compte</Link>
        </p>
      </form>
      <div className="relative mt-6 overflow-hidden rounded-[2rem] bg-ink p-6 text-white">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-lime">Comptes de démonstration (mot de passe : demo1234)</p>
        <div className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DEMO.map((d) => (
            <button key={d.email} type="button" onClick={() => submit(undefined, { email: d.email, password: "demo1234" })}
              className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.07] px-3.5 py-2.5 text-left text-xs transition-colors hover:border-lime/40 hover:bg-white/15">
              <span className="block font-bold text-white">{d.label}</span>
              <span className="block truncate text-white/60">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function LoginPage({ notice }: { notice?: string }) {
  return (
    <AuthShell title="Bon retour !" subtitle="Connectez-vous pour réserver, payer et suivre vos activités.">
      <Suspense>
        <LoginForm notice={notice} />
      </Suspense>
    </AuthShell>
  );
}
