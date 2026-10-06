import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession, logAction, ROLES, type Access } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { PERMISSIONS } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/roles";

const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("info"),
    firstName: z.string().trim().min(2), lastName: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email("E-mail invalide"), phone: z.string().trim().min(8, "Téléphone invalide"),
    address: z.string().trim().max(200).optional().nullable(),
  }),
  z.object({ kind: z.literal("access"), role: z.enum(ROLES), permissions: z.array(z.string()) }),
  z.object({ kind: z.literal("status"), status: z.enum(["ACTIVE", "SUSPENDED"]) }),
]);

async function target(a: Access, id: string) {
  const u = await db.query.users.findFirst({ where: eq(t.users.id, id) });
  if (!u) return { u: null, err: bad("Membre introuvable", 404) };
  if (u.role === "ADMIN" && !a.isAdmin) return { u: null, err: bad("Seul un administrateur peut modifier un compte administrateur", 403) };
  return { u, err: null };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.clone().json().catch(() => ({}));
  const needed = body?.kind === "access" ? "access.manage" : "members.manage";
  const { session, error } = await apiSession(needed);
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const { u, err } = await target(session, id);
  if (err) return err;
  const name = `${u.firstName} ${u.lastName}`;

  if (data.kind === "info") {
    const taken = await db.query.users.findFirst({ where: and(eq(t.users.email, data.email), ne(t.users.id, id)) });
    if (taken) return bad("Cet e-mail est déjà utilisé par un autre compte", 409);
    const { kind, ...fields } = data;
    await db.update(t.users).set(fields).where(eq(t.users.id, id));
    await db.update(t.coaches).set({ firstName: fields.firstName, lastName: fields.lastName, email: fields.email, phone: fields.phone }).where(eq(t.coaches.userId, id));
    await logAction(session, "Informations d'un membre modifiées", name);
    return NextResponse.json({ message: "Informations enregistrées" });
  }
  if (id === session.userId) return bad("Vous ne pouvez pas modifier vos propres accès ou suspendre votre propre compte");
  if (data.kind === "access") {
    const perms = data.permissions.filter((p) => p in PERMISSIONS);
    await db.update(t.users).set({ role: data.role, permissions: perms.join(",") }).where(eq(t.users.id, id));
    await logAction(session, "Rôle et accès modifiés", `${name} : ${ROLE_LABELS[data.role]}${perms.length ? ` + ${perms.map((p) => PERMISSIONS[p as keyof typeof PERMISSIONS].label).join(", ")}` : ""}`);
    return NextResponse.json({ message: "Rôle et accès enregistrés. Ils s'appliquent immédiatement." });
  }
  await db.update(t.users).set({ status: data.status }).where(eq(t.users.id, id));
  await logAction(session, data.status === "SUSPENDED" ? "Compte suspendu" : "Compte réactivé", name);
  return NextResponse.json({ message: data.status === "SUSPENDED" ? "Compte suspendu : le membre ne peut plus se connecter." : "Compte réactivé." });
}

// Suppression définitive d'un compte (administrateur uniquement)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("access.manage");
  if (error) return error;
  const { id } = await params;
  if (id === session.userId) return bad("Vous ne pouvez pas supprimer votre propre compte");
  const { u, err } = await target(session, id);
  if (err) return err;
  await db.update(t.coaches).set({ userId: null }).where(eq(t.coaches.userId, id));
  await db.update(t.campaigns).set({ createdById: session.userId }).where(eq(t.campaigns.createdById, id));
  for (const table of [t.notifications, t.coachReviews, t.donations, t.stringingRequests, t.transactions, t.eventRegistrations, t.reservations]) {
    await db.delete(table).where(eq((table as typeof t.notifications).userId, id));
  }
  const orders = await db.query.orders.findMany({ where: eq(t.orders.userId, id) });
  for (const o of orders) await db.delete(t.orderItems).where(eq(t.orderItems.orderId, o.id));
  await db.delete(t.orders).where(eq(t.orders.userId, id));
  await db.delete(t.users).where(eq(t.users.id, id));
  await logAction(session, "Compte supprimé", `${u.firstName} ${u.lastName} (${u.email})`);
  return NextResponse.json({ message: "Compte supprimé" });
}
