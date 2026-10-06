import Link from "next/link";
import { Search, Users, UserPlus, Baby, Dumbbell, Plus } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession, ROLE_LABELS } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatCard, Empty } from "@/components/ui";
import Avatar from "@/components/Avatar";
import Flash from "@/components/admin/Flash";
import { Badge } from "@/components/admin/kit";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata = { title: "Adhérents" };

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-ink text-white", MANAGER: "bg-brand-light text-brand", COACH: "bg-lime-light text-ink",
  PARENT: "bg-pink-50 text-pink-800", CLIENT: "bg-ink/[0.05] text-ink/70", STAFF: "bg-orange-50 text-orange-800", SPONSOR: "bg-amber-50 text-amber-800",
};

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; ok?: string }> }) {
  await requireSession("members.manage");
  const { q, role, ok } = await searchParams;
  const needle = q?.toLowerCase();
  const all = db.users.all();
  const users = sortBy(
    all.filter((u) => (!needle || [u.firstName, u.lastName, u.email].some((v) => v.toLowerCase().includes(needle))) && (!role || u.role === role)),
    "createdAt", "desc"
  );
  const spend = new Map<string, number>();
  for (const t of db.transactions.filter((t) => t.status === "COMPLETED")) spend.set(t.userId, (spend.get(t.userId) ?? 0) + t.amount);
  const resCount = new Map<string, number>();
  for (const r of db.reservations.filter((r) => r.status === "CONFIRMED")) resCount.set(r.userId, (resCount.get(r.userId) ?? 0) + 1);
  const monthAgo = Date.now() - 30 * 86400000;

  return (
    <div>
      <PageHeader eyebrow="Back-office · Club" title="Adhérents & accès" subtitle={`${all.length} comptes enregistrés · cliquez sur un membre pour gérer ses accès`}
        action={<Link href="/dashboard/members/new" className="btn-primary"><Plus size={16} /> Nouveau membre</Link>} />
      <Flash text={ok} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Membres" value={String(all.length)} icon={Users} tone="navy" hint={`${all.filter((u) => u.status !== "ACTIVE").length} suspendu(s)`} />
        <StatCard label="Nouveaux (30 j)" value={String(all.filter((u) => u.createdAt.getTime() > monthAgo).length)} icon={UserPlus} tone="lime" />
        <StatCard label="Parents" value={String(all.filter((u) => u.role === "PARENT").length)} icon={Baby} tone="sky" />
        <StatCard label="Coachs" value={String(all.filter((u) => u.role === "COACH").length)} icon={Dumbbell} tone="clay" />
      </div>
      <form className="card mb-5 flex flex-wrap items-end gap-3 p-4" role="search">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden />
          <input name="q" defaultValue={q} className="input pl-11" placeholder="Nom, prénom ou e-mail..." aria-label="Rechercher un membre" />
        </div>
        <select name="role" defaultValue={role ?? ""} className="input w-full sm:w-auto" aria-label="Filtrer par rôle">
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button className="btn-primary">Filtrer</button>
      </form>
      {users.length === 0 ? <Empty>Aucun membre ne correspond à votre recherche.</Empty> : (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink/50">{users.length} résultat{users.length > 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[920px]">
              <thead><tr><th>Membre</th><th>Contact</th><th>Rôle & accès</th><th>Réservations</th><th>Dépenses</th><th>Inscrit le</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {users.map((u) => {
                  const extra = u.permissions.split(",").filter(Boolean);
                  return (
                    <tr key={u.id} className="transition hover:bg-mist/60">
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={`${u.firstName} ${u.lastName}`} size={38} />
                          <div className="min-w-0">
                            <Link href={`/dashboard/members/${u.id}`} className="font-semibold text-ink hover:text-brand hover:underline">{u.firstName} {u.lastName}</Link>
                            {u.status !== "ACTIVE" && <div className="mt-0.5"><Badge tone="red">Suspendu</Badge></div>}
                          </div>
                        </div>
                      </td>
                      <td><p className="text-ink">{u.email}</p><p className="text-xs text-muted">{u.phone}</p></td>
                      <td>
                        <span className={`chip ${ROLE_COLORS[u.role] ?? "bg-ink/[0.05] text-ink/70"}`}>{ROLE_LABELS[u.role] ?? u.role}</span>
                        {extra.length > 0 && <span className="chip ml-1 bg-brand-light text-brand" title={extra.map((p) => PERMISSIONS[p as keyof typeof PERMISSIONS]?.label).join(", ")}>+{extra.length} accès</span>}
                      </td>
                      <td className="tabular">{resCount.get(u.id) ?? 0}</td>
                      <td className="tabular whitespace-nowrap font-semibold">{xof(spend.get(u.id) ?? 0)}</td>
                      <td className="whitespace-nowrap text-muted">{dateFr(u.createdAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="text-right"><Link href={`/dashboard/members/${u.id}`} className="btn-primary btn-sm">Gérer</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
