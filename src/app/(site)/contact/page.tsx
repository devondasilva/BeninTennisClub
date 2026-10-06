import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import PageHero, { PageBody, HeroPanel } from "@/components/site/PageHero";
import ContactForm from "./ContactForm";
import { getClubInfo } from "@/lib/settings";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const info = await getClubInfo();
  const INFOS = [
    { icon: MapPin, label: "Adresse", value: info.address, hint: info.addressHint },
    { icon: Phone, label: "Téléphone", value: info.phone, hint: "Accueil du club" },
    { icon: MessageCircle, label: "WhatsApp", value: info.whatsapp, hint: "Réponse rapide" },
    { icon: Mail, label: "E-mail", value: info.email, hint: "Réponse sous 24 h" },
    { icon: Clock, label: "Horaires", value: info.hours, hint: "" },
  ];
  return (
    <>
      <PageHero
        kicker="Contact"
        icon={<Send size={15} />}
        title="Parlons"
        accent="tennis"
        text="Une question sur l'adhésion, les cours pour les enfants ou un événement ? Écrivez-nous ou passez nous voir."
        image="/images/courts/court-1.svg"
        crumbs={[{ href: "/", label: "Accueil" }]}
        aside={
          <HeroPanel
            items={[
              { icon: <Mail size={18} />, text: "Réponse sous 24 h, par e-mail ou par téléphone" },
              { icon: <MessageCircle size={18} />, text: "WhatsApp pour les questions rapides" },
              { icon: <MapPin size={18} />, text: info.address },
            ]}
          />
        }
      />
      <PageBody className="grid gap-8 lg:grid-cols-5">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-2">
          <Stagger className="space-y-4">
            {INFOS.map(({ icon: Icon, label, value, hint }) => (
              <StaggerItem key={label}>
                <div className="card flex gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-lime"><Icon size={20} /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-ink/50">{label}</p>
                    <p className="break-words font-semibold text-ink">{value}</p>
                    {hint && <p className="text-sm text-muted">{hint}</p>}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-ink">
              <img src="/images/courts/court-2.svg" alt="Plan d'accès" className="aspect-[12/7] w-full object-cover opacity-60" />
              <span className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink shadow-xl">
                <MapPin size={16} /> Bénin Tennis Club
              </span>
            </div>
          </Reveal>
        </div>
        <Reveal className="order-1 lg:order-2 lg:col-span-3"><ContactForm /></Reveal>
      </PageBody>
    </>
  );
}
