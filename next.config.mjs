// Heure du club (Bénin, UTC+1) : horaires de réservation et dates affichés dans ce fuseau,
// même si le serveur d'hébergement est réglé sur UTC.
process.env.TZ = process.env.CLUB_TIMEZONE || "Africa/Porto-Novo";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: { dangerouslyAllowSVG: true },
};
export default nextConfig;
