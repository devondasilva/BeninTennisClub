import { desc, like, or, sql, eq } from "drizzle-orm";
import { Search, Users, UserPlus, Baby, Dumbbell, Plus } from "lucide-react";
import { db, t } from "@/db";
import { requireSession, ROLE_LABELS } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import Flash from "@/components/admin/Flash";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata = { title: "Adhérents" };

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-primary-400 text-white", MANAGER: "bg-primary-100 text-primary-400", COACH: "bg-accent-200 text-primary-400",
  PARENT: "bg-pink-100 text-pink-800", CLIENT: "bg-slate-100 text-slate-700", STAFF: "bg-orange-100 text-orange-800", SPONSOR: "bg-amber-100 text-amber-800",
};

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; ok?: string }> }) {
  const s = await requireSession("members.manage");
  const { q, role, ok } = await searchParams;
  const users = await db.query.users.findMany({
    where: (u, { and }) => and(
      q ? or(like(u.firstName, `%${q}%`), like(u.lastName, `%${q}%`), like(u.email, `%${q}%`)) : undefined,
      role ? eq(u.role, role) : undefined
    ),
    orderBy: desc(t.users.createdAt),
  });
  const spend = await db.select({ userId: t.transactions.userId, v: sql<number>`sum(${t.transactions.amount})` }).from(t.transactions)
    .where(eq(t.transactions.status, "COMPLETED")).groupBy(t.transactions.userId);
  const resCount = await db.select({ userId: t.reservations.userId, n: sql<number>`count(*)` }).from(t.reservations)
    .where(eq(t.reservations.status, "CONFIRMED")).groupBy(t.reservations.userId);
  const all = await db.select({ role: t.users.role, createdAt: t.users.createdAt }).from(t.users);
  const monthAgo = Date.now() - 30 * 86400000;

  return (
    <div>
      <PageHeader title="Adhérents & accès" subtitle={`${all.length} comptes enregistrés · cliquez sur un membre pour gérer ses accès`}
        action={<Link href="/dashboard/members/new" className="btn-accent"><Plus size={16} /> Nouveau membre</Link>} />
      <Flash text={ok} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Membres" value={String(all.length)} icon={Users} tone="navy" />
        <StatCard label="Nouveaux (30 j)" value={String(all.filter((u) => u.createdAt.getTime() > monthAgo).length)} icon={UserPlus} tone="lime" />
        <StatCard label="Parents" value={String(all.filter((u) => u.role === "PARENT").length)} icon={Baby} tone="sky" />
        <StatCard label="Coachs" value={String(all.filter((u) => u.role === "COACH").length)} icon={Dumbbell} tone="clay" />
      </div>
      <form className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input name="q" defaultValue={q} className="input pl-9" placeholder="Nom, prénom ou e-mail..." />
        </div>
        <select name="role" defaultValue={role ?? ""} className="input w-auto">
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button className="btn-primary">Filtrer</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Membre</th><th>Contact</th><th>Rôle & accès</th><th>Réservations</th><th>Dépenses</th><th>Inscrit le</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} name={`${u.firstName} ${u.lastName}`} size={36} />
                    <Link href={`/dashboard/members/${u.id}`} className="font-semibold text-primary-400 hover:underline">{u.firstName} {u.lastName}</Link>
                    {u.status !== "ACTIVE" && <span className="chip bg-red-100 text-red-700">Suspendu</span>}
                  </div>
                </td>
                <td><p>{u.email}</p><p className="text-xs text-slate-400">{u.phone}</p></td>
                <td>
                  <span className={`chip ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                  {u.permissions && <span className="chip ml-1 bg-accent-200 text-primary-400" title={u.permissions.split(",").map((p) => PERMISSIONS[p as keyof typeof PERMISSIONS]?.label).join(", ")}>+{u.permissions.split(",").filter(Boolean).length} accès</span>}
                </td>
                <td>{resCount.find((r) => r.userId === u.id)?.n ?? 0}</td>
                <td className="whitespace-nowrap font-semibold">{xof(spend.find((x) => x.userId === u.id)?.v ?? 0)}</td>
                <td className="whitespace-nowrap text-slate-500">{dateFr(u.createdAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="text-right"><Link href={`/dashboard/members/${u.id}`} className="btn-primary px-3 py-1.5 text-xs">Gérer</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
