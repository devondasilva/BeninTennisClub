"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Apparition au scroll (fondu + glissement). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const child: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Conteneur dont les enfants <StaggerItem> apparaissent en cascade. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={child}>
      {children}
    </motion.div>
  );
}

/**
 * Titre dont chaque mot remonte depuis un masque (révélation éditoriale).
 * `lines` : une entrée par ligne ; une ligne peut porter sa propre classe.
 */
export function SplitHeadline({
  lines,
  className = "",
  delay = 0,
  animateOnMount = false,
}: {
  lines: { text: string; className?: string }[];
  className?: string;
  delay?: number;
  animateOnMount?: boolean;
}) {
  let wordIndex = 0;
  const trigger = animateOnMount
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-40px" } };
  return (
    <motion.span className={`block ${className}`} {...trigger}>
      {lines.map((line, li) => (
        <span key={li} className={`block ${line.className ?? ""}`}>
          {line.text.split(" ").map((w, wi) => {
            const i = wordIndex++;
            return (
              <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.08em] pr-[0.06em] -mb-[0.08em]">
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "110%", rotate: 4 },
                    show: {
                      y: "0%",
                      rotate: 0,
                      transition: { duration: 0.9, ease: EASE, delay: delay + i * 0.06 },
                    },
                  }}
                >
                  {w}
                  {" "}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </motion.span>
  );
}
