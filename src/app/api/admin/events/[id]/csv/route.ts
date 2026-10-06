import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { apiSession } from "@/lib/auth";

// Export de la liste des inscrits (CSV lisible par Excel)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await apiSession("events.manage");
  if (error) return error;
  const { id } = await params;
  const e = db.events.get(id);
  if (!e) return new Response("Not found", { status: 404 });
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["Nom", "Prénom", "E-mail", "Téléphone", "Statut", "Inscrit le"].join(";")];
  for (const r of sortBy(db.eventRegistrations.filter((x) => x.eventId === id), "createdAt")) {
    const user = db.users.get(r.userId);
    if (!user) continue;
    rows.push([user.lastName, user.firstName, user.email, user.phone ?? "", r.status === "CONFIRMED" ? "Confirmé" : "En attente de paiement", r.createdAt.toLocaleDateString("fr-FR")].map(esc).join(";"));
  }
  return new Response("﻿" + rows.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inscrits-${e.title.replace(/[^\w]+/g, "-").toLowerCase()}.csv"` },
  });
}
