"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

const SUBJECTS = ["Renseignements", "Adhésion", "École de tennis", "Séance d'essai", "Privatisation / entreprise", "Partenariat", "Autre"];

export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  // Sujet présélectionné depuis un lien (ex. /contact?sujet=Partenariat)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("sujet");
    const match = SUBJECTS.find((s) => s.toLowerCase().startsWith((q ?? "").toLowerCase()));
    if (q && match) setF((x) => ({ ...x, subject: match }));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json();
    if (!res.ok) { setError(data.message); setState("idle"); return; }
    setState("done");
  }

  if (state === "done")
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center md:p-14">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime text-ink"><CheckCircle2 size={40} /></span>
        <p className="mt-6 font-display text-3xl font-black tracking-tight text-ink">Message envoyé !</p>
        <p className="mt-2 text-muted">Nous vous répondons sous 24 h, par e-mail ou par téléphone.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="card space-y-5 p-7 md:p-9">
      <div>
        <p className="eyebrow">Formulaire</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink">Écrivez-nous</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="c-name">Nom complet</label><input id="c-name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div><label className="label" htmlFor="c-phone">Téléphone</label><input id="c-phone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+229" /></div>
      </div>
      <div><label className="label" htmlFor="c-email">E-mail</label><input id="c-email" className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
      <div>
        <p className="label">Sujet</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sujet">
          {SUBJECTS.map((s) => (
            <button type="button" key={s} onClick={() => setF({ ...f, subject: s })} aria-pressed={f.subject === s}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${f.subject === s ? "bg-primary-400 text-white shadow-lg shadow-brand/20" : "bg-mist text-ink/70 hover:bg-cloud hover:text-ink"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div><label className="label" htmlFor="c-msg">Message</label><textarea id="c-msg" className="input" rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required /></div>
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button className="btn-accent w-full" disabled={state === "loading"}>{state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer</button>
    </form>
  );
}
