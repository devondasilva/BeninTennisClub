"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, Trophy, ShoppingBag, Users, Wrench, HeartHandshake, CreditCard, Bell,
  UserCog, BadgePercent, BarChart3, Handshake, LogOut, Menu, X, UserCircle, Mail, Globe, IdCard, ShieldCheck,
} from "lucide-react";
import Avatar from "./Avatar";

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

  const link = (i: Item) => (
    <Link key={i.href} href={i.href} onClick={() => setOpen(false)}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        isActive(i.href) ? "bg-accent-400 text-primary-400" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
      <i.icon size={18} />
      <span className="flex-1">{i.label}</span>
      {!!i.badge && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{i.badge}</span>}
    </Link>
  );

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-6">
        <img src="/images/logo.svg" alt="" className="h-9 w-9" />
        <span className="font-bold text-white">Bénin Tennis Club</span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {main.map(link)}
        {admin.length > 0 && <p className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">{perms.length ? "Gestion du club" : role === "COACH" ? "Espace coach" : "Mon espace"}</p>}
        {admin.map(link)}
        <p className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Le site</p>
        {link({ href: "/", label: "Voir le site public", icon: Globe })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" onClick={() => setOpen(false)} title="Changer ma photo"><Avatar src={avatar} name={name} size={40} /></Link>
          <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="min-w-0 flex-1" title="Mon profil">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-slate-400">{roleLabel} · Profil</p>
          </Link>
          <form action="/api/auth/logout" method="post">
            <button title="Se déconnecter" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><LogOut size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-primary-400 px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
          <img src="/images/logo.svg" alt="" className="h-8 w-8" /> BTC
        </Link>
        <div className="flex items-center gap-3"><Link href="/dashboard/settings"><Avatar src={avatar} name={name} size={32} /></Link>
        <button onClick={() => setOpen(true)} className="text-white" aria-label="Menu"><Menu /></button></div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-primary-400">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-6 text-white" aria-label="Fermer"><X /></button>
            {content}
          </aside>
        </div>
      )}
      <div className="hidden w-64 shrink-0 bg-primary-400 lg:block">
        <aside className="sticky top-0 h-screen">{content}</aside>
      </div>
    </>
  );
}
