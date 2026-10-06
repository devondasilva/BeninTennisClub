import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
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
  db.contactMessages.insert({ ...data, phone: data.phone ?? null });
  const staff = await usersWith("messages.manage");
  for (const u of staff) await notify(u.id, "CONTACT", `Nouveau message : ${data.subject}`, `${data.name} (${data.email}) vous a écrit.`, "/dashboard/messages");
  return NextResponse.json({ message: "Message envoyé ! Nous vous répondons sous 24 h." }, { status: 201 });
}

// Marquer un message comme lu (équipe du club)
export async function PATCH(req: Request) {
  const { error } = await apiSession("messages.manage");
  if (error) return error;
  const { id } = await req.json();
  if (typeof id === "string") db.contactMessages.update(id, { status: "READ" });
  return NextResponse.json({ ok: true });
}
