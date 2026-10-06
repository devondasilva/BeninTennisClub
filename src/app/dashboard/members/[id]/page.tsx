import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, xof, relativeFr } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/roles";
import Avatar from "@/components/Avatar";
import BackLink from "@/components/admin/BackLink";
import { InfoForm, AccessForm, AccountActions } from "./MemberForms";

export const metadata = { title: "Fiche membre" };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSession("members.manage");
  const { id } = await params;
  const u = await db.query.users.findFirst({ where: eq(t.users.id, id) });
  if (!u) notFound();
  const [[spent], [resCount], lastTx, coach] = await Promise.all([
    db.select({ v: sql<number>`coalesce(sum(${t.transactions.amount}),0)` }).from(t.transactions).where(sql`${t.transactions.userId} = ${id} and ${t.transactions.status} = 'COMPLETED'`),
    db.select({ n: sql<number>`count(*)` }).from(t.reservations).where(sql`${t.reservations.userId} = ${id} and ${t.reservations.status} = 'CONFIRMED'`),
    db.query.transactions.findMany({ where: eq(t.transactions.userId, id), orderBy: desc(t.transactions.createdAt), limit: 5 }),
    db.query.coaches.findFirst({ where: eq(t.coaches.userId, id) }),
  ]);
  const self = u.id === s.userId;
  const lockedAdmin = u.role === "ADMIN" && !s.isAdmin;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackLink href="/dashboard/members" label="Adhérents" />
      <div className="flex flex-wrap items-center gap-5 rounded-3xl bg-primary-400 p-6 text-white">
        <Avatar src={u.avatar} name={`${u.firstName} ${u.lastName}`} size={80} className="ring-4 ring-accent-400" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{u.firstName} {u.lastName}</h1>
          <p className="text-slate-300">{ROLE_LABELS[u.role]} · membre depuis {dateFr(u.createdAt, { month: "long", year: "numeric" })}</p>
          {u.status !== "ACTIVE" && <span className="chip mt-2 bg-red-500 text-white">Compte suspendu</span>}
          {coach && <Link href={`/dashboard/coaches/${coach.id}/edit`} className="mt-2 inline-block text-sm font-semibold text-accent-400 hover:underline">Fiche coach →</Link>}
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-xl font-bold">{resCount.n}</p><p className="text-xs text-slate-300">réservations</p></div>
          <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-xl font-bold">{xof(spent.v)}</p><p className="text-xs text-slate-300">dépensés</p></div>
        </div>
      </div>

      {lockedAdmin ? (
        <p className="card p-6 text-slate-600">Ce compte est un compte administrateur : seul un administrateur peut le modifier.</p>
      ) : (
        <>
          <InfoForm id={u.id} initial={{ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone ?? "", address: u.address ?? "" }} />
          {s.can("access.manage") ? (
            <AccessForm id={u.id} initialRole={u.role} initialPerms={u.permissions.split(",").filter(Boolean)} self={self} />
          ) : (
            <p className="card p-6 text-sm text-slate-600">Rôle : <b>{ROLE_LABELS[u.role]}</b>. Seul l'administrateur peut modifier les rôles et les accès.</p>
          )}
          <AccountActions id={u.id} status={u.status} self={self} canDelete={s.can("access.manage")} name={`${u.firstName} ${u.lastName}`} />
        </>
      )}

      <div className="card p-6">
        <h2 className="mb-3 text-lg font-bold text-primary-400">Derniers paiements</h2>
        {lastTx.length === 0 ? <p className="text-sm text-slate-500">Aucun paiement.</p> : (
          <ul className="divide-y divide-slate-100 text-sm">
            {lastTx.map((x) => <li key={x.id} className="flex justify-between gap-3 py-2"><span>{x.description} <span className="text-slate-400">· {relativeFr(x.createdAt)}</span></span><span className="font-semibold">{xof(x.amount)}</span></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
