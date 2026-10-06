import { NextResponse } from "next/server";
import { dbInfo } from "@/db";
import pkg from "../../../../package.json";

export const dynamic = "force-dynamic";

/** Contrôle de santé : http://localhost:3000/api/health */
export async function GET() {
  try {
    const info = dbInfo();
    return NextResponse.json({
      status: "ok",
      version: pkg.version,
      node: process.version,
      timezone: process.env.TZ,
      dataDir: "data/",
      database: { counts: info.counts },
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ status: "error", message: (e as Error).message }, { status: 503 });
  }
}
