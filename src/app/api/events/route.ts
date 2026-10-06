import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { parse } from "@/lib/api";
import { storeImage } from "@/lib/uploads";
import { eventSchema, IMAGES } from "./shared";

export async function POST(req: Request) {
  const { session, error } = await apiSession("events.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, eventSchema);
  if (e2) return e2;
  const startDate = new Date(data.startDate), endDate = new Date(data.endDate);
  if (endDate < startDate) return NextResponse.json({ message: "La fin doit être après le début" }, { status: 400 });
  const event = db.events.insert({ ...data, startDate, endDate, image: (await storeImage(data.image)) || IMAGES[data.type] });
  await logAction(session, "Événement créé", event.title);
  return NextResponse.json({ event }, { status: 201 });
}
