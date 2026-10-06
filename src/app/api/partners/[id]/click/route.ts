import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";

// Compte le clic sur une bannière puis redirige vers le site du partenaire
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.query.partners.findFirst({ where: eq(t.partners.id, id) });
  if (!p) return NextResponse.redirect(new URL("/partenaires", req.url));
  await db.update(t.partners).set({ clicks: sql`${t.partners.clicks} + 1` }).where(eq(t.partners.id, id));
  return NextResponse.redirect(p.website || new URL(`/partenaires#${p.id}`, req.url).toString());
}
