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
      <div className="flex flex-col items-center justify-center rounded-3xl bg-emerald-50 p-10 text-center">
        <CheckCircle2 size={56} className="text-emerald-500" />
        <p className="mt-4 text-xl font-bold text-primary-400">Message envoyé !</p>
        <p className="mt-1 text-slate-600">Nous vous répondons sous 24 h, par e-mail ou par téléphone.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-7 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Nom complet</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div><label className="label">Téléphone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+229" /></div>
      </div>
      <div><label className="label">E-mail</label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
      <div>
        <label className="label">Sujet</label>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button type="button" key={s} onClick={() => setF({ ...f, subject: s })}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${f.subject === s ? "bg-primary-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div><label className="label">Message</label><textarea className="input" rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required /></div>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn-accent w-full py-3" disabled={state === "loading"}>{state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer</button>
    </form>
  );
}
