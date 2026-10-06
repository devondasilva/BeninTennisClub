"use client";

import { useState } from "react";

export default function EventActions({ id, registrations }: { id: string; registrations: number }) {
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  async function go() {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (!res.ok) { setMsg(d.message); setConfirm(false); return; }
    window.location.href = `/dashboard/admin/events?ok=${encodeURIComponent(d.message)}`;
  }
  if (msg) return <span className="text-xs font-medium text-red-700">{msg}</span>;
  return confirm ? (
    <span className="text-xs"><span className="text-muted">{registrations ? `Annuler et prévenir ${registrations} inscrit(s) ?` : "Supprimer ?"}</span> <button onClick={go} className="font-semibold text-red-600">Oui</button> · <button onClick={() => setConfirm(false)} className="text-muted">Non</button></span>
  ) : (
    <button onClick={() => setConfirm(true)} className="text-xs font-semibold text-red-600 hover:underline">{registrations ? "Annuler l'événement" : "Supprimer"}</button>
  );
}
