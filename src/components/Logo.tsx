/**
 * Logo officiel du Bénin Tennis Club.
 * - variant "color" : sur fond clair (bleu + raquette citron)
 * - variant "white" : sur fond sombre (lettres blanches + raquette citron)
 * - variant "icon"  : raquette seule, pour les petits emplacements
 */
export default function Logo({ variant = "color", className = "h-10 w-auto" }: { variant?: "color" | "white" | "icon"; className?: string }) {
  const src = variant === "white" ? "/images/logo-btc-blanc.png" : variant === "icon" ? "/images/logo-raquette.png" : "/images/logo-btc.png";
  return <img src={src} alt="Bénin Tennis Club" className={className} />;
}
