// Heure du club (Bénin, UTC+1) : horaires de réservation et dates affichés dans ce fuseau,
// même si le serveur d'hébergement est réglé sur UTC.
process.env.TZ = process.env.CLUB_TIMEZONE || "Africa/Porto-Novo";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { dangerouslyAllowSVG: true },
  poweredByHeader: false,
  // En-têtes de sécurité appliqués à toutes les pages
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default nextConfig;
