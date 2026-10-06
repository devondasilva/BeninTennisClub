import { notFound } from "next/navigation";
import { db } from "@/db";
import { requireSession, ROLE_LABELS } from "@/lib/auth";
import { dateFr } from "@/lib/format";
import { toCoachForm } from "@/lib/coach-form";
import Avatar from "@/components/Avatar";
import CoachProfileForm from "@/components/CoachProfileForm";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Mon profil" };

export default async function SettingsPage() {
  const s = await requireSession();
  const u = db.users.get(s.userId);
  if (!u) notFound();
  const coach = db.coaches.find((c) => c.userId === u.id);

  return (
    <div className="mx-auto max-w-3xl">
      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/20 md:p-8">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lime/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar src={u.avatar} name={`${u.firstName} ${u.lastName}`} size={80} className="ring-4 ring-lime" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lime">Mon profil</p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-white md:text-4xl">{u.firstName} <span className="text-lime">{u.lastName}</span></h1>
            <p className="mt-1 text-white/70">{ROLE_LABELS[u.role]} · membre depuis {dateFr(u.createdAt, { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </section>

      <ProfileForm initial={{
        firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone ?? "", address: u.address ?? "",
        level: u.level ?? "", playingHand: u.playingHand ?? "RIGHT", bio: u.bio ?? "", emailNotifications: u.emailNotifications, avatar: u.avatar,
      }} />

      {coach && (
        <div id="coach" className="mt-14 scroll-mt-6">
          <p className="eyebrow">Espace coach</p>
          <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-ink">Ma fiche <span className="text-brand">coach</span></h2>
          <p className="mb-6 mt-2 text-muted">Ces informations apparaissent sur votre page publique « Nos coachs ».</p>
          <CoachProfileForm coach={toCoachForm(coach)} staff={false} />
        </div>
      )}
    </div>
  );
}
