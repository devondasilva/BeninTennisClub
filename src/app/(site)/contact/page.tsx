import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import ContactForm from "./ContactForm";
import { getClubInfo } from "@/lib/settings";

export const metadata = { title: "Contact" };



export default async function ContactPage() {
  const info = await getClubInfo();
  const INFOS = [
    [MapPin, "Adresse", info.address, info.addressHint],
    [Phone, "Téléphone", info.phone, "Accueil du club"],
    [MessageCircle, "WhatsApp", info.whatsapp, "Réponse rapide"],
    [Mail, "E-mail", info.email, "Réponse sous 24 h"],
    [Clock, "Horaires", info.hours, ""],
  ] as const;
  return (
    <>
      <PageHero kicker="Contact" title="Parlons tennis" text="Une question sur l'adhésion, l'école de tennis ou un événement ? Écrivez-nous ou passez nous voir." image="/images/courts/court-1.svg" />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {INFOS.map(([Icon, label, value, hint]) => (
            <div key={label} className="flex gap-4 rounded-2xl bg-slate-50 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-400 text-accent-400"><Icon size={20} /></span>
              <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="font-semibold text-primary-400">{value}</p><p className="text-sm text-slate-500">{hint}</p></div>
            </div>
          ))}
          <div className="relative overflow-hidden rounded-2xl">
            <img src="/images/courts/court-2.svg" alt="Plan d'accès" className="aspect-[12/7] w-full object-cover opacity-70" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400 px-4 py-2 text-sm font-bold text-accent-400 shadow-medium">📍 Bénin Tennis Club</span>
          </div>
        </div>
        <div className="lg:col-span-3"><ContactForm /></div>
      </section>
    </>
  );
}
