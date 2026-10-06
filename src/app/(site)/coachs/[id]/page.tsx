import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Languages, GraduationCap, Trophy, CalendarDays, MessageSquare, Clock, Wallet, ChevronRight } from "lucide-react";
import { db } from "@/db";
import { indexById, sortBy } from "@/db/relations";
import { getSession } from "@/lib/auth";
import { relativeFr, xof } from "@/lib/format";
import { DAYS, lines, parseAvailability } from "@/lib/coaches";
import Avatar from "@/components/Avatar";
import Stars from "@/components/Stars";
import ReviewForm from "./ReviewForm";
import AdSlot from "@/components/AdSlot";
import { PageBody } from "@/components/site/PageHero";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const c = db.coaches.get((await params).id);
  return { title: c ? `${c.firstName} ${c.lastName} — Coach` : "Coach" };
}

export default async function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const c = db.coaches.get(id);
  if (!c) notFound();

  const users = indexById(db.users.all());
  const reviews = sortBy(db.coachReviews.filter((r) => r.coachId === id), "createdAt", "desc")
    .filter((r) => users.has(r.userId))
    .map((r) => ({ ...r, user: users.get(r.userId)! }));
  const others = db.coaches.filter((o) => o.id !== id && o.status === "ACTIVE").slice(0, 3);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const mine = session ? reviews.find((r) => r.userId === session.userId) : undefined;
  const slots = parseAvailability(c.availability);
  const diplomas = lines(c.diplomas);
  const achievements = lines(c.achievements);
  const isSelf = session && c.userId === session.userId;
  const bookHref = `/dashboard/reservations/new?coach=${c.id}`;
  const facts = [
    { icon: Award, v: `${c.experience} ans`, l: "d'expérience" },
    { icon: Wallet, v: xof(c.hourlyRate), l: "de l'heure" },
    { icon: Languages, v: (c.languages ?? "Français").split(",").length + " langues", l: c.languages ?? "Français" },
  ];

  return (
    <>
      {/* En-tête profil — même langage que les bandeaux des pages */}
      <section className="relative overflow-hidden bg-ink pb-24 pt-14 text-white md:pb-28 md:pt-20">
        <div className="absolute inset-0 opacity-25"><img src="/images/hero-graphic.svg" alt="" className="h-full w-full object-cover" /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <div aria-hidden className="absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-lime/15 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-content items-center gap-10 px-6 md:grid-cols-[300px_1fr] lg:gap-14">
          <Reveal y={20}>
            <div className="relative mx-auto w-full max-w-[300px]">
              <div aria-hidden className="absolute -inset-3 rotate-3 rounded-[2.5rem] bg-lime/80" />
              <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="relative aspect-square w-full rounded-[2rem] object-cover shadow-2xl" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <Link href="/coachs" className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-lime"><ArrowLeft size={15} /> Tous les coachs</Link>
            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-2 backdrop-blur-md">
              <GraduationCap size={15} className="text-lime" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{c.specialization}</span>
            </div>
            <h1 className="font-display text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl md:text-6xl">
              {c.firstName} <span className="text-lime">{c.lastName}</span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-white/75">
              <Stars value={avg} /> <span>{reviews.length ? `${avg.toFixed(1)} / 5 · ${reviews.length} avis` : "Pas encore d'avis"}</span>
            </div>
            <dl className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {facts.map(({ icon: I, v, l }) => (
                <div key={l} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md">
                  <I size={18} className="text-lime" />
                  <dt className="mt-2 truncate font-display text-lg font-black text-white">{v}</dt>
                  <dd className="truncate text-xs text-white/55" title={l}>{l}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={bookHref} className="btn-accent"><CalendarDays size={18} /> Réserver un cours avec {c.firstName}</Link>
              {isSelf && <Link href="/dashboard/settings#coach" className="btn-ghost-dark">Modifier ma fiche</Link>}
            </div>
          </Reveal>
        </div>
      </section>

      <PageBody className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Reveal className="card p-7 md:p-9">
            <p className="eyebrow">Le coach</p>
            <h2 className="section-title mt-2">À propos</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{c.bio}</p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            <Reveal className="card p-7">
              <h3 className="flex items-center gap-3 font-display text-xl font-black text-ink">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand"><GraduationCap size={20} /></span>
                Diplômes & certifications
              </h3>
              <ul className="mt-5 space-y-3">
                {diplomas.length ? diplomas.map((d) => (
                  <li key={d} className="flex gap-3 text-sm text-ink/80"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime-dark" />{d}</li>
                )) : <li className="text-sm text-muted">Non renseigné</li>}
              </ul>
            </Reveal>
            <Reveal className="card p-7" delay={0.08}>
              <h3 className="flex items-center gap-3 font-display text-xl font-black text-ink">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-light text-ink"><Trophy size={20} /></span>
                Palmarès & réalisations
              </h3>
              <ul className="mt-5 space-y-3">
                {achievements.length ? achievements.map((a) => (
                  <li key={a} className="flex gap-3 text-sm text-ink/80"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />{a}</li>
                )) : <li className="text-sm text-muted">Non renseigné</li>}
              </ul>
            </Reveal>
          </div>

          {/* Avis */}
          <Reveal className="card p-7 md:p-9">
            <p className="eyebrow">Ils s'entraînent avec {c.firstName}</p>
            <h2 className="section-title mt-2 flex items-center gap-3"><MessageSquare size={26} className="text-brand" /> Avis des membres</h2>
            <div className="mt-6">
              {session && !isSelf ? (
                <ReviewForm coachId={c.id} existing={mine ? { rating: mine.rating, comment: mine.comment } : undefined} />
              ) : !session ? (
                <p className="rounded-2xl bg-mist p-5 text-sm text-muted">
                  <Link href={`/login?next=/coachs/${c.id}`} className="font-bold text-brand underline decoration-2 underline-offset-4">Connectez-vous</Link> pour laisser un avis.
                </p>
              ) : null}
            </div>
            <ul className="mt-6 divide-y divide-ink/[0.06]">
              {reviews.map((r) => (
                <li key={r.id} className="flex gap-4 py-5">
                  <Avatar src={r.user.avatar} name={`${r.user.firstName} ${r.user.lastName}`} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{r.user.firstName} {r.user.lastName[0]}.</p>
                      <span className="text-xs text-muted">{relativeFr(r.createdAt)}</span>
                    </div>
                    <Stars value={r.rating} size={14} />
                    <p className="mt-1.5 leading-relaxed text-ink/75">{r.comment}</p>
                  </div>
                </li>
              ))}
              {reviews.length === 0 && <li className="py-6 text-muted">Soyez le premier à donner votre avis.</li>}
            </ul>
          </Reveal>
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-7 text-white shadow-xl shadow-ink/20">
            <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
            <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime/15 blur-3xl" />
            <div className="relative">
              <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-lime"><Clock size={16} /> Disponibilités</h3>
              <ul className="mt-4 divide-y divide-white/10 text-sm">
                {DAYS.map((d) => {
                  const s = slots.filter((x) => x.day === d);
                  return (
                    <li key={d} className="flex justify-between gap-3 py-2.5">
                      <span className="font-medium text-white/75">{d}</span>
                      <span className={s.length ? "text-right font-semibold text-white" : "text-white/30"}>{s.length ? s.map((x) => x.hours).join(", ") : "—"}</span>
                    </li>
                  );
                })}
              </ul>
              <Link href={bookHref} className="btn-accent mt-6 w-full">Réserver un créneau</Link>
            </div>
          </div>
          <AdSlot placement="COACHES" variant="compact" />
          {others.length > 0 && (
            <div className="card p-6">
              <p className="eyebrow">L'équipe</p>
              <h3 className="mt-1 font-display text-xl font-black text-ink">Autres coachs</h3>
              <ul className="mt-4 space-y-2">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/coachs/${o.id}`} className="group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-mist">
                      <img src={o.photo ?? ""} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink group-hover:text-brand">{o.firstName} {o.lastName}</p><p className="truncate text-xs text-muted">{o.specialization}</p></div>
                      <ChevronRight size={15} className="shrink-0 text-ink/40 transition group-hover:translate-x-1 group-hover:text-brand" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </PageBody>
    </>
  );
}
