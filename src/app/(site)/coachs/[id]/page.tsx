import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { ArrowLeft, Award, Languages, GraduationCap, Trophy, CalendarDays, MessageSquare, Clock, Wallet } from "lucide-react";
import { db, t } from "@/db";
import { getSession } from "@/lib/auth";
import { relativeFr, xof } from "@/lib/format";
import { DAYS, lines, parseAvailability } from "@/lib/coaches";
import Avatar from "@/components/Avatar";
import Stars from "@/components/Stars";
import ReviewForm from "./ReviewForm";
import AdSlot from "@/components/AdSlot";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const c = await db.query.coaches.findFirst({ where: eq(t.coaches.id, (await params).id) });
  return { title: c ? `${c.firstName} ${c.lastName} — Coach` : "Coach" };
}

export default async function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const c = await db.query.coaches.findFirst({ where: eq(t.coaches.id, id) });
  if (!c) notFound();

  const [reviews, others] = await Promise.all([
    db.query.coachReviews.findMany({ where: eq(t.coachReviews.coachId, id), with: { user: true }, orderBy: desc(t.coachReviews.createdAt) }),
    db.query.coaches.findMany({ where: and(ne(t.coaches.id, id), eq(t.coaches.status, "ACTIVE")), limit: 3 }),
  ]);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const mine = session ? reviews.find((r) => r.userId === session.userId) : undefined;
  const slots = parseAvailability(c.availability);
  const diplomas = lines(c.diplomas);
  const achievements = lines(c.achievements);
  const isSelf = session && c.userId === session.userId;
  const bookHref = `/dashboard/reservations/new?coach=${c.id}`;

  return (
    <>
      {/* En-tête profil */}
      <section className="bg-primary-400">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[320px_1fr] md:px-8 md:py-16">
          <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="aspect-square w-full max-w-xs rounded-3xl object-cover shadow-medium ring-4 ring-accent-400" />
          <div>
            <Link href="/coachs" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white"><ArrowLeft size={16} /> Tous les coachs</Link>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent-400">{c.specialization}</p>
            <h1 className="mt-2 text-4xl font-extrabold text-white md:text-5xl">{c.firstName} {c.lastName}</h1>
            <div className="mt-3 flex items-center gap-2 text-slate-300">
              <Stars value={avg} /> <span>{reviews.length ? `${avg.toFixed(1)} / 5 · ${reviews.length} avis` : "Pas encore d'avis"}</span>
            </div>
            <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4">
              {[[Award, `${c.experience} ans`, "d'expérience"], [Wallet, xof(c.hourlyRate), "de l'heure"], [Languages, (c.languages ?? "Français").split(",").length + " langues", c.languages ?? "Français"]].map(([Icon, v, l]) => {
                const I = Icon as typeof Award;
                return (
                  <div key={l as string} className="rounded-2xl bg-white/10 p-4">
                    <I size={18} className="text-accent-400" />
                    <dt className="mt-2 text-lg font-bold text-white">{v as string}</dt>
                    <dd className="truncate text-xs text-slate-400" title={l as string}>{l as string}</dd>
                  </div>
                );
              })}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={bookHref} className="btn-accent px-6 py-3 text-base"><CalendarDays size={18} /> Réserver un cours avec {c.firstName}</Link>
              {isSelf && <Link href="/dashboard/settings#coach" className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">Modifier ma fiche</Link>}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:px-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="text-2xl font-bold text-primary-400">À propos</h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">{c.bio}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-bold text-primary-400"><GraduationCap size={20} /> Diplômes & certifications</h3>
              <ul className="mt-4 space-y-2.5">
                {diplomas.length ? diplomas.map((d) => (
                  <li key={d} className="flex gap-2.5 text-sm text-slate-600"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />{d}</li>
                )) : <li className="text-sm text-slate-400">Non renseigné</li>}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-100 p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-bold text-primary-400"><Trophy size={20} /> Palmarès & réalisations</h3>
              <ul className="mt-4 space-y-2.5">
                {achievements.length ? achievements.map((a) => (
                  <li key={a} className="flex gap-2.5 text-sm text-slate-600"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-400" />{a}</li>
                )) : <li className="text-sm text-slate-400">Non renseigné</li>}
              </ul>
            </div>
          </div>

          {/* Avis */}
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary-400"><MessageSquare size={22} /> Avis des membres</h2>
            <div className="mt-4">
              {session && !isSelf ? (
                <ReviewForm coachId={c.id} existing={mine ? { rating: mine.rating, comment: mine.comment } : undefined} />
              ) : !session ? (
                <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                  <Link href={`/login?next=/coachs/${c.id}`} className="font-semibold text-primary-400 underline">Connectez-vous</Link> pour laisser un avis.
                </p>
              ) : null}
            </div>
            <ul className="mt-6 divide-y divide-slate-100">
              {reviews.map((r) => (
                <li key={r.id} className="flex gap-4 py-5">
                  <Avatar src={r.user.avatar} name={`${r.user.firstName} ${r.user.lastName}`} size={44} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">{r.user.firstName} {r.user.lastName[0]}.</p>
                      <span className="text-xs text-slate-400">{relativeFr(r.createdAt)}</span>
                    </div>
                    <Stars value={r.rating} size={14} />
                    <p className="mt-1.5 text-slate-600">{r.comment}</p>
                  </div>
                </li>
              ))}
              {reviews.length === 0 && <li className="py-6 text-slate-500">Soyez le premier à donner votre avis.</li>}
            </ul>
          </div>
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-100 p-6 shadow-soft">
            <h3 className="flex items-center gap-2 font-bold text-primary-400"><Clock size={20} /> Disponibilités</h3>
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {DAYS.map((d) => {
                const s = slots.filter((x) => x.day === d);
                return (
                  <li key={d} className="flex justify-between py-2.5">
                    <span className="font-medium text-slate-700">{d}</span>
                    <span className={s.length ? "font-semibold text-primary-400" : "text-slate-300"}>{s.length ? s.map((x) => x.hours).join(", ") : "—"}</span>
                  </li>
                );
              })}
            </ul>
            <Link href={bookHref} className="btn-accent mt-5 w-full">Réserver un créneau</Link>
          </div>
          <AdSlot placement="COACHES" variant="compact" />
          {others.length > 0 && (
            <div className="rounded-2xl bg-slate-50 p-6">
              <h3 className="font-bold text-primary-400">Autres coachs</h3>
              <ul className="mt-4 space-y-3">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/coachs/${o.id}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-white">
                      <img src={o.photo ?? ""} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div><p className="text-sm font-semibold text-primary-400">{o.firstName} {o.lastName}</p><p className="text-xs text-slate-500">{o.specialization}</p></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
