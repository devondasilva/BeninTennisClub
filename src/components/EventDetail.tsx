import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, CheckCircle2, Ticket, ArrowRight, Trophy, ShieldCheck } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { getSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import ActionButton from "./ActionButton";
import AdSlot from "./AdSlot";
import { ProgressBar } from "./ui";
import PageHero, { PageBody } from "./site/PageHero";
import { Reveal } from "./motion/Reveal";

export const EVENT_TYPES: Record<string, [string, string]> = {
  TOURNAMENT: ["Tournoi", "bg-amber-100 text-amber-800"],
  STAGE: ["Stage", "bg-lime-light text-ink"],
  SCHOOL: ["École de tennis", "bg-brand-light text-brand-dark"],
  GATHERING: ["Convivialité", "bg-pink-100 text-pink-800"],
};

/** Fiche détaillée d'un événement, partagée entre le site public et l'espace membre */
export default async function EventDetail({ id, base }: { id: string; base: "/evenements" | "/dashboard/events" }) {
  const e = db.events.get(id);
  if (!e) notFound();
  const session = await getSession();
  const now = new Date();
  const n = db.eventRegistrations.count((r) => r.eventId === id && r.status === "CONFIRMED");
  const mine = session ? db.eventRegistrations.find((r) => r.eventId === id && r.userId === session.userId) : undefined;
  const others = sortBy(db.events.filter((o) => o.id !== id && o.endDate >= now), "startDate", "asc").slice(0, 3);

  const left = Math.max(0, e.capacity - n);
  const past = e.endDate < now;
  const multiDay = e.endDate.toDateString() !== e.startDate.toDateString();
  const [type, color] = EVENT_TYPES[e.type] ?? [e.type, "bg-cloud text-ink"];
  const isSite = base === "/evenements";
  const dateLabel = multiDay
    ? `Du ${dateFr(e.startDate, { day: "numeric", month: "long" })} au ${dateFr(e.endDate, { day: "numeric", month: "long" })}`
    : dateFr(e.startDate, { weekday: "long", day: "numeric", month: "long" });

  let cta: React.ReactNode;
  if (mine?.status === "CONFIRMED") cta = <p className="flex items-center justify-center gap-2 rounded-2xl bg-lime py-3.5 text-sm font-bold uppercase tracking-widest text-ink"><CheckCircle2 size={18} /> Vous êtes inscrit(e)</p>;
  else if (e.status === "CANCELLED") cta = <p className="rounded-2xl bg-red-50 py-3.5 text-center font-semibold text-red-700">Événement annulé</p>;
  else if (past) cta = <p className="rounded-2xl bg-white/10 py-3.5 text-center font-semibold text-white/70">Événement terminé</p>;
  else if (left === 0) cta = <p className="rounded-2xl bg-white/10 py-3.5 text-center font-semibold text-white/70">Complet</p>;
  else if (!session) cta = <Link href={`/login?next=${base}/${e.id}`} className="btn-accent w-full"><Ticket size={18} /> Se connecter pour s'inscrire</Link>;
  else cta = <ActionButton url={`/api/events/${e.id}/register`} className="btn-accent">{mine ? "Finaliser le paiement" : e.price ? `S'inscrire · ${xof(e.price)}` : "S'inscrire gratuitement"}</ActionButton>;

  const infos = [
    { icon: CalendarDays, k: "Date", v: dateLabel },
    { icon: Clock, k: "Horaires", v: `${timeFr(e.startDate)} – ${timeFr(e.endDate)}` },
    { icon: MapPin, k: "Lieu", v: e.location },
  ];

  const main = (
    <div className="space-y-6 lg:col-span-2">
      <div className="card overflow-hidden p-3">
        <div className="group relative overflow-hidden rounded-[1.6rem]">
          <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
          <span className={`chip absolute left-4 top-4 font-bold ${color}`}>{type}</span>
        </div>
        <div className="p-5 md:p-7">
          {!isSite && <h1 className="font-display text-3xl font-black tracking-tight text-ink md:text-4xl">{e.title}</h1>}
          <p className="eyebrow mt-1">Le programme</p>
          <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-muted">{e.description}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {infos.map(({ icon: I, k, v }) => (
          <div key={k} className="card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand"><I size={18} /></span>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-ink/50">{k}</p>
            <p className="mt-0.5 font-semibold text-ink first-letter:uppercase">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const aside = (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white shadow-xl shadow-ink/20">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Participation</p>
          <p className="mt-2 font-display text-4xl font-black tracking-tight text-white">{e.price ? xof(e.price) : "Gratuit"}</p>
          <div className="mt-6">
            <div className="mb-2 flex justify-between gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-white/70"><Users size={15} /> {n} inscrits</span>
              <span className="font-semibold text-lime">{left} places restantes</span>
            </div>
            <ProgressBar value={(n / e.capacity) * 100} />
          </div>
          <div className="mt-6">{cta}</div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-white/55"><ShieldCheck size={13} /> Paiement MTN Mobile Money ou carte · confirmation par e-mail</p>
        </div>
      </div>
      <AdSlot placement="EVENTS" variant="compact" />
      {others.length > 0 && (
        <div className="card p-6">
          <p className="eyebrow">À ne pas manquer</p>
          <p className="mt-1 font-display text-xl font-black text-ink">Autres événements</p>
          <ul className="mt-4 space-y-2">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`${base}/${o.id}`} className="group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-mist">
                  <img src={o.image ?? ""} alt="" className="h-12 w-20 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink group-hover:text-brand">{o.title}</span><span className="text-xs text-muted">{dateFr(o.startDate, { day: "numeric", month: "long" })}</span></span>
                  <ArrowRight size={15} className="shrink-0 text-ink/40 transition group-hover:translate-x-1 group-hover:text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );

  if (!isSite) {
    return (
      <div>
        <Link href={base} className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-brand"><ArrowLeft size={15} /> Tous les événements</Link>
        <div className="grid gap-8 lg:grid-cols-3">{main}{aside}</div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        kicker={type}
        icon={<Trophy size={15} />}
        title={e.title}
        text={<span className="first-letter:uppercase">{dateLabel} · {e.location}</span>}
        image={e.image ?? "/images/events/tournament.svg"}
        crumbs={[{ href: "/", label: "Accueil" }, { href: "/evenements", label: "Événements" }]}
      >
        <Link href={base} className="btn-ghost-dark btn-sm"><ArrowLeft size={15} /> Tous les événements</Link>
      </PageHero>
      <PageBody>
        <Reveal className="grid gap-8 lg:grid-cols-3">{main}{aside}</Reveal>
      </PageBody>
    </>
  );
}
