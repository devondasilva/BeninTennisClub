import nodemailer from "nodemailer";

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f5f8;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
    <tr><td style="background:#1e3a5f;padding:20px 28px;color:#fff;font-size:20px;font-weight:bold">
      🎾 Bénin Tennis Club</td></tr>
    <tr><td style="padding:28px;color:#1f2937;font-size:15px;line-height:1.6">
      <h2 style="color:#1e3a5f;margin:0 0 12px">${title}</h2>${body}</td></tr>
    <tr><td style="background:#c8d965;padding:12px 28px;color:#1e3a5f;font-size:12px">
      Akpakpa Dodomey, Cotonou · contact@benintennis.club</td></tr>
  </table></td></tr></table></body></html>`;
}

export async function sendEmail(to: string, subject: string, title: string, body: string) {
  const html = layout(title, body);
  if (!process.env.SMTP_HOST) {
    console.log(`\n📧 [e-mail simulé] À: ${to}\n   Sujet: ${subject}\n   ${body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
  } catch (e) {
    console.error("Erreur d'envoi e-mail:", e);
  }
}
