import { NextResponse } from "next/server";
import { z } from "zod";
import { apiSession, logAction } from "@/lib/auth";
import { parse } from "@/lib/api";
import { setSetting } from "@/lib/settings";

const schema = z.object({
  clubInfo: z.object({
    phone: z.string().trim().min(8), whatsapp: z.string().trim(), email: z.string().trim().email("E-mail du club invalide"),
    address: z.string().trim().min(3), addressHint: z.string().trim(), hours: z.string().trim().min(3),
  }),
  memberships: z.array(z.object({
    name: z.string().trim().min(2), price: z.number().min(0), period: z.string().trim().min(1), tag: z.string().trim(),
    highlight: z.boolean().optional(), perks: z.array(z.string().trim().min(1)).max(8),
  })).min(1).max(6),
});

export async function PUT(req: Request) {
  const { session, error } = await apiSession("content.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  await setSetting("club_info", data.clubInfo);
  await setSetting("memberships", data.memberships);
  await logAction(session, "Infos du club modifiées");
  return NextResponse.json({ message: "Enregistré : le site public est à jour." });
}
