import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";

// Sert le logo ou la bannière d'un partenaire envoyés depuis l'espace de gestion
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kind = new URL(req.url).searchParams.get("kind") === "logo" ? "logo" : "banner";
  const p = await db.query.partners.findFirst({ where: eq(t.partners.id, id), columns: { logo: true, banner: true } });
  const v = p?.[kind];
  if (!v) return new NextResponse("Not found", { status: 404 });
  if (v.startsWith("/")) return NextResponse.redirect(new URL(v, req.url));
  const m = v.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (!m) return new NextResponse("Bad image", { status: 400 });
  return new NextResponse(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=86400" },
  });
}
