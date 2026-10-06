import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { parse } from "@/lib/api";
import { storeImage } from "@/lib/uploads";
import { productSchema } from "./schema";

export async function POST(req: Request) {
  const { session, error } = await apiSession("shop.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, productSchema);
  if (e2) return e2;
  const [p] = await db.insert(t.products).values({ ...data, image: (await storeImage(data.image)) ?? null }).returning();
  await logAction(session, "Article ajouté", p.name);
  return NextResponse.json({ message: "Article ajouté", id: p.id }, { status: 201 });
}
