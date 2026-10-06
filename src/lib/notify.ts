import { db } from "@/db";
import { sendEmail } from "./email";

/** Crée une notification et envoie l'e-mail correspondant */
export async function notify(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  emailBody?: string
) {
  db.notifications.insert({ userId, type, title, message, link: link ?? null });
  const user = db.users.get(userId);
  if (user && user.emailNotifications) {
    await sendEmail(user.email, title, title, emailBody ?? `<p>Bonjour ${user.firstName},</p><p>${message}</p>`);
  }
}
