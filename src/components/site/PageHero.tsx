"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Bandeau d'en-tête des pages : fond bleu nuit, image voilée en parallaxe, badge citron,
 * grand titre Fraunces avec un mot en citron. Même langage que Beach Tennis Bénin.
 */
export default function PageHero({
  kicker,
  icon,
  title,
  accent,
  text,
  image,
  crumbs,
  children,
  aside,
}: {
  kicker: string;
  icon?: ReactNode;
  title: string;
  /** Fin du titre affichée en citron */
  accent?: string;
  text?: ReactNode;
  image?: string;
  crumbs?: { href: string; label: string }[];
  /** Contenu sous le texte (boutons, filtres…) */
  children?: ReactNode;
  /** Colonne de droite (encart) */
  aside?: ReactNode;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  return (
    <section className="relative overflow-hidden bg-ink pb-24 pt-14 text-white md:pb-28 md:pt-20">
      {image && (
        <motion.div style={{ y }} className="absolute inset-0 opacity-35">
          <img src={image} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
      <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <motion.div
        aria-hidden
        className="absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-lime/15 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto grid max-w-content grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12">
        <div className={aside ? "lg:col-span-7" : "lg:col-span-9"}>
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Fil d'Ariane" className="mb-5 flex items-center gap-1.5 text-xs text-white/50">
              {crumbs.map((c) => (
                <span key={c.href} className="inline-flex items-center gap-1.5">
                  <Link href={c.href} className="transition-colors hover:text-lime">{c.label}</Link>
                  <ChevronRight size={12} />
                </span>
              ))}
            </nav>
          )}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-2 backdrop-blur-md"
          >
            {icon && <span className="inline-flex text-lime">{icon}</span>}
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{kicker}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
            className="font-display text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            {title} {accent && <span className="text-lime">{accent}</span>}
          </motion.h1>

          {text && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.18 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
            >
              {text}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.28 }}
              className="mt-8"
            >
              {children}
            </motion.div>
          )}
        </div>

        {aside && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
            className="lg:col-span-5"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** Contenu qui remonte sur le bandeau (comme la bande de chiffres de l'accueil) */
export function PageBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative z-10 mx-auto -mt-12 max-w-content px-6 pb-24 md:-mt-14 md:pb-28 ${className}`}>{children}</div>;
}

/** Encart vitré pour la colonne de droite du bandeau (liste d'atouts, étapes…) */
export function HeroPanel({ items }: { items: { icon: ReactNode; text: ReactNode }[] }) {
  return (
    <div className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md">
      <ul className="space-y-4">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-white/85">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime">{it.icon}</span>
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
