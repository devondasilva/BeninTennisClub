"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, UserCircle } from "lucide-react";
import Avatar from "@/components/Avatar";
import Logo from "@/components/Logo";
import { SITE_LINKS } from "./links";

/** Barre de navigation du site : bleu nuit, liens en capitales, soulignement citron animé */
export default function SiteHeader({ user }: { user: { name: string; avatar: string | null } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-ink/95 shadow-lg shadow-ink/20 backdrop-blur-md" : "bg-ink"}`}>
      <nav className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="shrink-0 rounded-xl bg-white px-2.5 py-1.5" aria-label="Bénin Tennis Club — accueil">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {SITE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}
              className={`relative whitespace-nowrap py-2 text-[13px] font-medium uppercase tracking-widest transition-colors hover:text-lime ${active(l.href) ? "text-lime" : "text-white/85"}`}>
              {l.label}
              {active(l.href) && (
                <motion.span layoutId="nav-underline" className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-lime"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }} />
              )}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 rounded-2xl bg-white/10 py-1.5 pl-1.5 pr-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/20">
              <Avatar src={user.avatar} name={user.name} size={30} /> <span className="hidden sm:inline">Mon espace</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white hover:text-lime sm:inline-flex">
                <UserCircle size={18} /> Connexion
              </Link>
              <Link href="/register" className="btn-accent btn-sm whitespace-nowrap">Devenir membre</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="p-2 text-white lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-ink px-6 pb-4 lg:hidden">
          {SITE_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`flex min-h-[52px] items-center border-b border-white/10 text-base font-bold uppercase tracking-widest ${active(l.href) ? "text-lime" : "text-white"}`}>{l.label}</Link>
          ))}
          {!user && <Link href="/login" className="flex min-h-[52px] items-center text-base font-bold uppercase tracking-widest text-white">Connexion</Link>}
        </div>
      )}
    </header>
  );
}
