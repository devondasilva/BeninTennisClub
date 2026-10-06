import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { createTransaction } from "@/lib/payments";

const schema = z.object({
  amount: z.number().min(1000, "Don minimum : 1 000 XOF"),
  donorName: z.string().optional(),
  message: z.string().max(280).optional(),
  anonymous: z.boolean(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const c = db.campaigns.get(id);
  if (!c) return bad("Collecte introuvable", 404);
  if (c.status !== "ACTIVE" || c.deadline < new Date()) return bad("Cette collecte est terminée");
  const d = db.donations.insert({
    campaignId: id, userId: session.userId, amount: data.amount, anonymous: data.anonymous,
    donorName: data.anonymous ? null : data.donorName || `${session.firstName} ${session.lastName}`, message: data.message || null,
  });
  const tx = await createTransaction(session.userId, "DONATION", d.id, data.amount, `Don — ${c.title}`);
  return NextResponse.json({ paymentUrl: `/dashboard/payments/${tx.id}` }, { status: 201 });
}
