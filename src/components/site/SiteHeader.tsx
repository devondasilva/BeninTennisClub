"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import { SITE_LINKS } from "./links";


export default function SiteHeader({ user }: { user: { name: string; avatar: string | null } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 bg-primary-400/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <img src="/images/logo.svg" alt="" className="h-10 w-10" />
          <span className="whitespace-nowrap text-base font-bold sm:text-lg">Bénin Tennis Club</span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {SITE_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${active(l.href) ? "bg-white/10 text-accent-400" : "text-slate-300 hover:text-white"}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-white/10 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-white hover:bg-white/20">
              <Avatar src={user.avatar} name={user.name} size={30} /> <span className="hidden sm:inline">Mon espace</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn hidden text-white hover:bg-white/10 sm:inline-flex">Connexion</Link>
              <Link href="/register" className="btn-accent whitespace-nowrap">Devenir membre</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="p-2 text-white lg:hidden" aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4 lg:hidden">
          {SITE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 font-medium ${active(l.href) ? "text-accent-400" : "text-slate-200"}`}>{l.label}</Link>
          ))}
          {!user && <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-3 font-medium text-slate-200">Connexion</Link>}
        </div>
      )}
    </header>
  );
}
