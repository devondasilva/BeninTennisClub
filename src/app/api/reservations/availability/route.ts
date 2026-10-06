import { and, eq, gte, lt, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { error } = await apiSession();
  if (error) return error;
  const date = new URL(req.url).searchParams.get("date");
  if (!date) return NextResponse.json({ message: "date requise" }, { status: 400 });
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start.getTime() + 86400000);

  const [courts, coaches, booked] = await Promise.all([
    db.query.courts.findMany({ where: eq(t.courts.isActive, true) }),
    db.query.coaches.findMany({ where: eq(t.coaches.status, "ACTIVE") }),
    db.select({ courtId: t.reservations.courtId, startTime: t.reservations.startTime, endTime: t.reservations.endTime })
      .from(t.reservations)
      .where(and(gte(t.reservations.startTime, start), lt(t.reservations.startTime, end), ne(t.reservations.status, "CANCELLED"))),
  ]);
  return NextResponse.json({ courts, coaches, booked });
}
