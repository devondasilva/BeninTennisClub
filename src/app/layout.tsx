import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bénin Tennis Club", template: "%s · Bénin Tennis Club" },
  description: "Réservez un court, inscrivez-vous aux tournois, équipez-vous et soutenez le club.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>{children}</body>
    </html>
  );
}
