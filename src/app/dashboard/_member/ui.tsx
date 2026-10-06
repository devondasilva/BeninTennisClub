// Petits éléments de design partagés par les pages de l'espace membre
// (même langage que le parcours de réservation Beach Tennis Bénin : étapes numérotées,
// cartes-options, récapitulatif sombre, filtres en pilule segmentée).
// Pas de hooks ni d'accès aux données : utilisable depuis une page serveur ou un composant client.
import Link from "next/link";
import { Check, type LucideIcon } from "lucide-react";

/** Titre d'étape numéroté (formulaires en plusieurs parties) */
export function StepTitle({ n, title, hint, aside }: { n: number; title: string; hint?: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink font-display font-black text-lime" aria-hidden>{n}</span>
        <div>
          <h2 className="font-display text-xl font-black leading-tight tracking-tight text-ink md:text-2xl">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
        </div>
      </div>
      {aside}
    </div>
  );
}

/** Pastille « sélectionné » dans le coin d'une carte-option */
export function SelectedTick({ show }: { show: boolean }) {
  return (
    <span aria-hidden
      className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white transition-all duration-200 ${show ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
      <Check size={14} strokeWidth={3} />
    </span>
  );
}

/** Ligne du récapitulatif (carte sombre) */
export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 text-sm last:border-0">
      <span className="text-white/55">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

/** Carte sombre (bleu nuit + lignes de terrain + halo citron) */
export function DarkCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-ink text-white shadow-xl shadow-ink/15 ${className}`}>
      <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/15 blur-3xl" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

/** En-tête d'une grande carte */
export function CardHead({ title, subtitle, action, icon: Icon }: { title: string; subtitle?: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && <span className="rounded-xl bg-brand-light p-2.5 text-brand"><Icon size={18} /></span>}
        <div>
          <h2 className="font-display text-xl font-black tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Lien « Tout voir » discret en en-tête de carte */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">{children}</Link>;
}

/** Pilule segmentée (filtres, onglets) */
export const segWrap = "scroll-thin inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-ink/[0.08] bg-white p-1 shadow-sm";
export const segItem = (active: boolean) =>
  `whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${active ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`;

export function SegLinks({ items, label }: { items: { href: string; label: string; active: boolean }[]; label: string }) {
  return (
    <nav aria-label={label} className={segWrap}>
      {items.map((i) => (
        <Link key={i.href + i.label} href={i.href} aria-current={i.active ? "page" : undefined} className={segItem(i.active)}>{i.label}</Link>
      ))}
    </nav>
  );
}

/** Message de confirmation (?ok=…) */
export function OkFlash({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <p role="status" className="mb-6 flex items-center gap-2 rounded-2xl bg-lime-light px-4 py-3 text-sm font-semibold text-ink">
      <Check size={18} className="text-accent-700" /> {text}
    </p>
  );
}
