import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { sendEmail } from "./email";

/** Crée une notification en base et envoie l'e-mail correspondant */
export async function notify(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  emailBody?: string
) {
  await db.insert(t.notifications).values({ userId, type, title, message, link });
  const user = await db.query.users.findFirst({ where: eq(t.users.id, userId) });
  if (user && user.emailNotifications) {
    await sendEmail(user.email, title, title, emailBody ?? `<p>Bonjour ${user.firstName},</p><p>${message}</p>`);
  }
}
