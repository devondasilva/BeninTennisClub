import Link from "next/link";
import { MapPin, Phone, Clock, Mail, CalendarDays } from "lucide-react";
import { SITE_LINKS } from "./links";
import { getClubInfo } from "@/lib/settings";
import Logo from "@/components/Logo";

export default async function SiteFooter() {
  const info = await getClubInfo();
  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div aria-hidden className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-lime/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-content gap-10 px-6 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo variant="white" className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Le club de tennis de référence à Cotonou depuis 1998 : compétition, école de tennis, loisir et tennis fauteuil.
          </p>
          <Link href="/dashboard/reservations/new" className="btn-accent btn-sm mt-6"><CalendarDays size={15} /> Réserver un court</Link>
        </div>
        <div className="md:col-span-3">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-lime">Navigation</p>
          <ul className="space-y-2.5 text-sm">
            {SITE_LINKS.map((l) => <li key={l.href}><Link href={l.href} className="transition-colors hover:text-lime">{l.label}</Link></li>)}
          </ul>
        </div>
        <div className="space-y-3 text-sm md:col-span-4">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-lime">Nous trouver</p>
          <p className="flex items-center gap-3"><MapPin size={16} className="shrink-0 text-lime" /> {info.address}</p>
          <p className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-lime" /> {info.phone}</p>
          <p className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-lime" /> {info.email}</p>
          <p className="flex items-center gap-3"><Clock size={16} className="shrink-0 text-lime" /> {info.hours}</p>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} Bénin Tennis Club — Tous droits réservés.</div>
    </footer>
  );
}
