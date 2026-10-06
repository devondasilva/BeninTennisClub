// Petites briques du back-office (langage Beach Tennis Bénin, couleurs du club).
// Composants serveur sans état : utilisables depuis les pages comme depuis les composants client.
import Link from "next/link";

/** Grande carte blanche avec en-tête (titre, sous-titre, action) */
export function Panel({
  title, subtitle, action, children, className = "", bodyClassName = "p-6 pt-5",
}: { title?: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6">
          <div>
            {title && <h2 className="text-[15px] font-bold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Sélecteur en pilule (onglets / périodes) à base de liens */
export function Pills({ items, label }: { items: { href: string; label: string; active: boolean; count?: number }[]; label: string }) {
  return (
    <nav aria-label={label} className="scroll-thin -mx-1 overflow-x-auto px-1">
      <div className="inline-flex gap-1 rounded-full bg-ink/[0.05] p-1">
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={i.active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
              i.active ? "bg-ink text-white shadow-sm" : "text-muted hover:bg-white hover:text-ink"}`}>
            {i.label}
            {i.count !== undefined && (
              <span className={`tabular rounded-full px-1.5 text-[11px] ${i.active ? "bg-lime text-ink" : "bg-ink/[0.07] text-ink/70"}`}>{i.count}</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const TONES = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
  red: "bg-red-50 text-red-700 ring-red-600/15",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  slate: "bg-ink/[0.05] text-ink/70 ring-ink/10",
  blue: "bg-brand-light text-brand ring-brand/15",
  lime: "bg-lime-light text-ink ring-lime-dark/30",
  ink: "bg-ink text-white ring-ink",
} as const;
export type Tone = keyof typeof TONES;

/** Badge arrondi avec pastille */
export function Badge({ tone = "slate", children, dot = true, className = "" }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />}
      {children}
    </span>
  );
}

/** Sur-titre de section (capitales espacées) */
export function Overline({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45 ${className}`}>{children}</p>;
}

/** Interrupteur on/off (role="switch") */
export function switchCls(on: boolean) {
  return `relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-ink/20"}`;
}
export function switchKnob(on: boolean) {
  return `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`;
}

/** Bouton-pilule de choix (catégorie, type…) */
export function choiceCls(on: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${on ? "bg-ink text-white shadow-sm" : "bg-mist text-muted ring-1 ring-inset ring-ink/[0.08] hover:bg-cloud hover:text-ink"}`;
}

/** Carte-option à bordure (rôle, niveau…) */
export function tileCls(on: boolean) {
  return `rounded-2xl border-2 px-3 py-2.5 text-sm font-semibold transition ${on ? "border-brand bg-brand/[0.06] text-ink shadow-sm" : "border-ink/[0.08] bg-white text-muted hover:border-ink/20"}`;
}

/** Barre d'actions collante en bas des formulaires */
export const stickyBar = "sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-ink/[0.08] bg-white/95 p-3 pl-5 shadow-medium backdrop-blur";
