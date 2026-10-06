import type { Metadata } from "next";
// Polices auto-hébergées (fonctionnent hors ligne) — même duo que Beach Tennis Bénin
import "@fontsource/fraunces/700.css";
import "@fontsource/fraunces/900.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bénin Tennis Club", template: "%s · Bénin Tennis Club" },
  description: "Réservez un court, inscrivez-vous aux tournois, équipez-vous et soutenez le club.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
