import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { apiSession, ROLES } from "@/lib/auth";
import { bad, parse } from "@/lib/api";

const schema = z.object({ role: z.enum(ROLES) });

// Changement de rôle (administrateur uniquement)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("access.manage");
  if (error) return error;
  const { id } = await params;
  if (id === session.userId) return bad("Vous ne pouvez pas modifier votre propre rôle");
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;

  const user = db.users.get(id);
  if (!user) return bad("Utilisateur introuvable");

  db.users.update(id, { role: data.role });
  return NextResponse.json({ ok: true });
}
