import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Sert les images envoyées depuis l'administration (articles, courts...)
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = name.match(/^[a-f0-9-]{36}\.(jpg|png|webp)$/);
  if (!m) return new NextResponse("Not found", { status: 404 });
  try {
    const buf = await readFile(join(UPLOAD_DIR, name));
    return new NextResponse(buf, { headers: { "Content-Type": TYPES[m[1]], "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
