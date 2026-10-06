import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { parse } from "@/lib/api";
import { storeImage } from "@/lib/uploads";
import { campaignSchema, IMAGES } from "./shared";

export async function POST(req: Request) {
  const { session, error } = await apiSession("fundraising.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, campaignSchema);
  if (e2) return e2;
  const deadline = new Date(`${data.deadline}T23:59:59`);
  if (deadline < new Date()) return NextResponse.json({ message: "La date limite doit être dans le futur" }, { status: 400 });
  const c = db.campaigns.insert({ ...data, deadline, createdById: session.userId, image: (await storeImage(data.image)) || IMAGES[data.category] });
  await logAction(session, "Collecte lancée", c.title);
  return NextResponse.json({ campaign: c }, { status: 201 });
}
