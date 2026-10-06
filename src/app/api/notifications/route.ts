import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";

// PATCH { id } : marque une notification comme lue · PATCH {} : tout marquer comme lu
export async function PATCH(req: Request) {
  const { session, error } = await apiSession();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  await db.update(t.notifications).set({ read: true })
    .where(and(eq(t.notifications.userId, session.userId), body.id ? eq(t.notifications.id, body.id) : undefined));
  return NextResponse.json({ ok: true });
}
