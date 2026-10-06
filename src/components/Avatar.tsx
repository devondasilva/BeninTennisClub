/** Photo de profil : image choisie / envoyée, sinon initiales */
export default function Avatar({ src, name, size = 40, className = "" }: { src?: string | null; name: string; size?: number; className?: string }) {
  const initials = name.split(" ").filter(Boolean).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.36) };
  if (src) return <img src={src} alt={name} style={style} className={`shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <span style={style} className={`flex shrink-0 items-center justify-center rounded-full bg-accent-400 font-bold text-primary-400 ${className}`}>
      {initials}
    </span>
  );
}
