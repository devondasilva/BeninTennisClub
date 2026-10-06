import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";

// PATCH { id } : marque une notification comme lue · PATCH {} : tout marquer comme lu
export async function PATCH(req: Request) {
  const { session, error } = await apiSession();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  db.notifications.updateWhere((n) => n.userId === session.userId && (!body?.id || n.id === body.id) && !n.read, { read: true });
  return NextResponse.json({ ok: true });
}
