import Link from "next/link";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { SITE_LINKS } from "./links";
import { getClubInfo } from "@/lib/settings";

export default async function SiteFooter() {
  const info = await getClubInfo();
  return (
    <footer className="bg-primary-400 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-white">
            <img src="/images/logo.svg" alt="" className="h-9 w-9" />
            <span className="font-bold">Bénin Tennis Club</span>
          </div>
          <p className="mt-3 max-w-sm text-sm">Le club de tennis de référence à Cotonou depuis 1998 : compétition, école de tennis, loisir et tennis fauteuil.</p>
          <Link href="/register" className="btn-accent mt-5">Rejoindre le club</Link>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Le site</p>
          <ul className="space-y-2 text-sm">
            {SITE_LINKS.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-accent-400">{l.label}</Link></li>)}
          </ul>
        </div>
        <div className="space-y-2.5 text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wider text-white">Nous trouver</p>
          <p className="flex items-center gap-2"><MapPin size={16} className="text-accent-400" /> {info.address}</p>
          <p className="flex items-center gap-2"><Phone size={16} className="text-accent-400" /> {info.phone}</p>
          <p className="flex items-center gap-2"><Mail size={16} className="text-accent-400" /> {info.email}</p>
          <p className="flex items-center gap-2"><Clock size={16} className="text-accent-400" /> {info.hours}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Bénin Tennis Club</div>
    </footer>
  );
}
