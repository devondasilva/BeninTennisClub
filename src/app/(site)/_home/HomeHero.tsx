"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronRight, Clock, GraduationCap, MapPin, Sparkles, Trophy } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export type HeroEvent = { id: string; title: string; date: string } | null;

/** Bandeau immersif de l'accueil : illustration voilée en parallaxe, titre Fraunces, carte vitrée */
export default function HomeHero({ open, hours, address, nextEvent }: { open: boolean; hours: string; address: string; nextEvent: HeroEvent }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink pb-24 pt-14 text-white md:pb-36 md:pt-24">
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 opacity-50">
        <img src="/images/hero.svg" alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/55" />
      <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-lime/15 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto grid max-w-content grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="lg:col-span-7">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-2 backdrop-blur-md">
              <Trophy size={15} className="text-lime" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Club de tennis · Cotonou</span>
            </span>
            <Link href="/contact?sujet=Séance" className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-ink shadow-lg shadow-lime/20 transition-colors hover:bg-white">
              <Sparkles size={15} /> Séance d'essai offerte
            </Link>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="mb-6 font-display text-5xl font-black leading-[1] tracking-tight text-white md:text-7xl"
          >
            Jouez. Progressez.{" "}
            <motion.span
              className="inline-block text-lime"
              initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
            >
              Gagnez.
            </motion.span>
          </motion.h1>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            Trois courts éclairés, six coachs et formateurs diplômés et toute la vie du club dans une seule application :
            réservation, tournois, boutique, paiement MTN Mobile Money ou carte.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/reservations/new" className="btn-accent group">
              Réserver un court <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/evenements" className="btn-ghost-dark">Découvrir les événements</Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="lg:col-span-5">
          <div className="animate-float space-y-6 rounded-[2.5rem] border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime/20 text-lime"><Clock size={20} /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">{open ? "Ouvert maintenant" : "Prochaine ouverture"}</p>
                  <p className="text-sm font-bold text-white">{open ? "Jusqu'à minuit" : "Dès 6 h ce matin"}</p>
                </div>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${open ? "bg-lime text-ink" : "bg-white/15 text-white"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${open ? "animate-pulse-dot bg-ink" : "bg-white"}`} />
                {open ? "Ouvert" : "Fermé"}
              </span>
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-white/80"><CalendarDays size={18} className="shrink-0 text-lime" /> {hours}</li>
              <li className="flex items-center gap-3 text-white/80"><GraduationCap size={18} className="shrink-0 text-lime" /> Coachs diplômés, de l'école de tennis à la compétition</li>
              <li className="flex items-center gap-3 text-white/80"><MapPin size={18} className="shrink-0 text-lime" /> {address}</li>
              {nextEvent && (
                <li>
                  <Link href={`/evenements/${nextEvent.id}`} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
                    <Trophy size={18} className="shrink-0 text-lime" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-white/50">Prochain tournoi · {nextEvent.date}</span>
                      <span className="block truncate font-bold text-white">{nextEvent.title}</span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-lime transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              )}
            </ul>

            <Link href="/dashboard/reservations/new" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime py-3.5 text-xs font-bold uppercase tracking-widest text-ink transition-colors hover:bg-white">
              Voir les disponibilités <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
