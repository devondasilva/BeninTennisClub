import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { error } = await apiSession();
  if (error) return error;
  const date = new URL(req.url).searchParams.get("date");
  if (!date) return NextResponse.json({ message: "date requise" }, { status: 400 });
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start.getTime() + 86400000);

  const courts = db.courts.filter((c) => c.isActive);
  const coaches = db.coaches.filter((c) => c.status === "ACTIVE");
  const booked = db.reservations
    .filter((r) => r.startTime >= start && r.startTime < end && r.status !== "CANCELLED")
    .map((r) => ({ courtId: r.courtId, startTime: r.startTime, endTime: r.endTime }));
  return NextResponse.json({ courts, coaches, booked });
}
