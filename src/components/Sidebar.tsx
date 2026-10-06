"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, Trophy, ShoppingBag, Users, Wrench, HeartHandshake, CreditCard, Bell,
  UserCog, BadgePercent, BarChart3, Handshake, LogOut, Menu, X, UserCircle, Mail, Globe, IdCard, ShieldCheck,
} from "lucide-react";
import Avatar from "./Avatar";
import Logo from "./Logo";

type Item = { href: string; label: string; icon: React.ElementType; show?: boolean; badge?: number };

export default function Sidebar({ name, roleLabel, role, unread, avatar, newMessages = 0, perms }: { name: string; roleLabel: string; role: string; unread: number; avatar: string | null; newMessages?: number; perms: string[] }) {
  const can = (p: string) => perms.includes(p);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const main: Item[] = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dashboard/reservations", label: "Réservations", icon: CalendarDays },
    { href: "/dashboard/events", label: "Événements", icon: Trophy },
    { href: "/dashboard/shop", label: "Boutique", icon: ShoppingBag },
    { href: "/dashboard/coaches", label: "Coachs", icon: Users },
    { href: "/dashboard/stringing", label: "Cordage", icon: Wrench },
    { href: "/dashboard/fundraising", label: "Collectes", icon: HeartHandshake },
    { href: "/dashboard/payments", label: "Paiements", icon: CreditCard },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: unread },
    { href: "/dashboard/settings", label: "Mon profil", icon: UserCircle },
  ];
  const admin: Item[] = [
    { href: "/dashboard/admin", label: "Centre de contrôle", icon: ShieldCheck, show: perms.length > 0 },
    { href: "/dashboard/settings#coach", label: "Ma fiche coach", icon: IdCard, show: role === "COACH" },
    { href: "/dashboard/messages", label: "Messages du site", icon: Mail, show: can("messages.manage"), badge: newMessages },
    { href: "/dashboard/members", label: "Adhérents & accès", icon: UserCog, show: can("members.manage") },
    { href: "/dashboard/coaches/commissions", label: "Commissions", icon: BadgePercent, show: can("commissions.manage") || role === "COACH" },
    { href: "/dashboard/analytics", label: "Statistiques", icon: BarChart3, show: can("analytics.view") },
    { href: "/dashboard/partners", label: "Partenaires & pub", icon: Handshake, show: can("partners.manage") || role === "SPONSOR" },
  ].filter((i) => i.show);

  const isActive = (href: string) =>
    href.includes("#") || href === "/" ? false : href === "/dashboard" ? pathname === href : pathname === href || (pathname.startsWith(href + "/") && !(href === "/dashboard/coaches" && pathname.startsWith("/dashboard/coaches/commissions")));

  const link = (i: Item) => {
    const on = isActive(i.href);
    return (
      <Link key={i.href} href={i.href} prefetch={false} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined}
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
          on ? "bg-white/10 text-white ring-1 ring-white/10" : "text-white/70 hover:bg-white/[0.06] hover:text-white"}`}>
        {on && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-lime" />}
        <i.icon size={18} className={on ? "text-lime" : ""} />
        <span className="flex-1">{i.label}</span>
        {!!i.badge && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1.5 text-[11px] font-bold text-ink">{i.badge}</span>}
      </Link>
    );
  };
  const section = (label: string) => <p className="px-3 pb-2 pt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</p>;

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" prefetch={false} className="block border-b border-white/10 px-6 py-5">
        <Logo variant="white" className="h-10 w-auto" />
        <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">Espace membre</span>
      </Link>
      <nav className="scroll-thin-dark flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {section("Mon espace")}
        {main.map(link)}
        {admin.length > 0 && section(perms.length ? "Gestion du club" : role === "COACH" ? "Espace coach" : "Partenaire")}
        {admin.map(link)}
        {section("Le site")}
        {link({ href: "/", label: "Voir le site public", icon: Globe })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" prefetch={false} onClick={() => setOpen(false)} title="Changer ma photo"><Avatar src={avatar} name={name} size={40} /></Link>
          <Link href="/dashboard/settings" prefetch={false} onClick={() => setOpen(false)} className="min-w-0 flex-1" title="Mon profil">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-white/50">{roleLabel} · Profil</p>
          </Link>
          <form action="/api/auth/logout" method="post">
            <button title="Se déconnecter" className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"><LogOut size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Link href="/dashboard" prefetch={false} aria-label="Tableau de bord"><Logo variant="white" className="h-8 w-auto" /></Link>
        <div className="flex items-center gap-3"><Link href="/dashboard/settings" prefetch={false}><Avatar src={avatar} name={name} size={32} /></Link>
        <button onClick={() => setOpen(true)} className="text-white" aria-label="Menu"><Menu /></button></div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-6 text-white" aria-label="Fermer"><X /></button>
            {content}
          </aside>
        </div>
      )}
      <div className="hidden w-72 shrink-0 bg-ink lg:block">
        <aside className="sticky top-0 h-screen">{content}</aside>
      </div>
    </>
  );
}
