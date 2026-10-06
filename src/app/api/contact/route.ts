import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { apiSession, usersWith } from "@/lib/auth";
import { parse } from "@/lib/api";
import { notify } from "@/lib/notify";

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom"),
  email: z.string().email("E-mail invalide"),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().trim().min(10, "Votre message est trop court").max(2000),
});

// Formulaire de contact public : le message est enregistré et l'équipe est prévenue
export async function POST(req: Request) {
  const { data, error } = await parse(req, schema);
  if (error) return error;
  await db.insert(t.contactMessages).values(data);
  const staff = await usersWith("messages.manage");
  for (const u of staff) await notify(u.id, "CONTACT", `Nouveau message : ${data.subject}`, `${data.name} (${data.email}) vous a écrit.`, "/dashboard/messages");
  return NextResponse.json({ message: "Message envoyé ! Nous vous répondons sous 24 h." }, { status: 201 });
}

// Marquer un message comme lu (équipe du club)
export async function PATCH(req: Request) {
  const { error } = await apiSession("messages.manage");
  if (error) return error;
  const { id } = await req.json();
  await db.update(t.contactMessages).set({ status: "READ" }).where(eq(t.contactMessages.id, id));
  return NextResponse.json({ ok: true });
}
