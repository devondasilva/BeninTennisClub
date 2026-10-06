import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { requireSession, ROLE_LABELS } from "@/lib/auth";
import { dateFr } from "@/lib/format";
import { toCoachForm } from "@/lib/coach-form";
import Avatar from "@/components/Avatar";
import CoachProfileForm from "@/components/CoachProfileForm";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Mon profil" };

export default async function SettingsPage() {
  const s = await requireSession();
  const u = (await db.query.users.findFirst({ where: eq(t.users.id, s.userId) }))!;
  const coach = await db.query.coaches.findFirst({ where: eq(t.coaches.userId, u.id) });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4 rounded-3xl bg-primary-400 p-6 text-white">
        <Avatar src={u.avatar} name={`${u.firstName} ${u.lastName}`} size={72} className="ring-4 ring-accent-400" />
        <div>
          <h1 className="text-2xl font-bold">{u.firstName} {u.lastName}</h1>
          <p className="text-slate-300">{ROLE_LABELS[u.role]} · membre depuis {dateFr(u.createdAt, { month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <ProfileForm initial={{
        firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone ?? "", address: u.address ?? "",
        level: u.level ?? "", playingHand: u.playingHand ?? "RIGHT", bio: u.bio ?? "", emailNotifications: u.emailNotifications, avatar: u.avatar,
      }} />

      {coach && (
        <div id="coach" className="mt-12 scroll-mt-6">
          <h2 className="mb-1 text-2xl font-bold text-primary-400">Ma fiche coach</h2>
          <p className="mb-6 text-slate-500">Ces informations apparaissent sur votre page publique « Nos coachs ».</p>
          <CoachProfileForm coach={toCoachForm(coach)} staff={false} />
        </div>
      )}
    </div>
  );
}
