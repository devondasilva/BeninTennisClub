import { NextResponse } from "next/server";
import { db } from "@/db";

// Compte le clic sur une bannière puis redirige vers le site du partenaire
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = db.partners.get(id);
  if (!p) return NextResponse.redirect(new URL("/partenaires", req.url));
  try {
    db.partners.update(id, (x) => ({ clicks: x.clicks + 1 }));
  } catch (e) {
    console.warn("[BTC] Clic de bannière non compté :", (e as Error).message);
  }
  return NextResponse.redirect(p.website || new URL(`/partenaires#${p.id}`, req.url).toString());
}
