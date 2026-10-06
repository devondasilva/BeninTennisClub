import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { parse } from "@/lib/api";
import { storeImage } from "@/lib/uploads";
import { courtSchema } from "./schema";

export async function POST(req: Request) {
  const { session, error } = await apiSession("courts.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, courtSchema);
  if (e2) return e2;
  const c = db.courts.insert({ ...data, description: data.description ?? null, image: (await storeImage(data.image)) ?? "/images/courts/court-1.svg" });
  await logAction(session, "Court ajouté", c.name);
  return NextResponse.json({ message: "Court ajouté" }, { status: 201 });
}
