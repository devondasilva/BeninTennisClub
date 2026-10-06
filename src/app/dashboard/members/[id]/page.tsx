import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, Receipt } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, xof, relativeFr } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/roles";
import Avatar from "@/components/Avatar";
import BackLink from "@/components/admin/BackLink";
import { PageHeader, StatusBadge } from "@/components/ui";
import { InfoForm, AccessForm, AccountActions } from "./MemberForms";

export const metadata = { title: "Fiche membre" };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSession("members.manage");
  const { id } = await params;
  const u = db.users.get(id);
  if (!u) notFound();
  const spent = db.transactions.sum("amount", (t) => t.userId === id && t.status === "COMPLETED");
  const resCount = db.reservations.count((r) => r.userId === id && r.status === "CONFIRMED");
  const lastTx = sortBy(db.transactions.filter((t) => t.userId === id), "createdAt", "desc").slice(0, 5);
  const coach = db.coaches.find((c) => c.userId === id);
  const self = u.id === s.userId;
  const lockedAdmin = u.role === "ADMIN" && !s.isAdmin;
  const name = `${u.firstName} ${u.lastName}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackLink href="/dashboard/members" label="Adhérents" />
      <PageHeader eyebrow="Back-office · Fiche membre" title={name} subtitle={`${ROLE_LABELS[u.role] ?? u.role} · ${u.email}`} />

      <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/20 md:p-8">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-6">
          <Avatar src={u.avatar} name={name} size={84} className="ring-4 ring-lime" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">{ROLE_LABELS[u.role] ?? u.role}</p>
            <p className="mt-1 font-display text-2xl font-black tracking-tight md:text-3xl">{u.firstName} <span className="text-lime">{u.lastName}</span></p>
            <p className="mt-1 text-sm text-white/65">Membre depuis {dateFr(u.createdAt, { month: "long", year: "numeric" })}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {u.status !== "ACTIVE" && <span className="chip bg-red-500 text-white">Compte suspendu</span>}
              {coach && <Link href={`/dashboard/coaches/${coach.id}/edit`} className="text-sm font-semibold text-lime hover:underline">Fiche coach →</Link>}
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 text-center sm:w-auto">
            <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/10"><p className="tabular text-2xl font-extrabold">{resCount}</p><p className="text-[11px] font-bold uppercase tracking-widest text-white/55">réservations</p></div>
            <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/10"><p className="tabular text-2xl font-extrabold">{xof(spent)}</p><p className="text-[11px] font-bold uppercase tracking-widest text-white/55">dépensés</p></div>
          </div>
        </div>
      </section>

      {lockedAdmin ? (
        <p className="card flex items-center gap-3 p-6 text-muted"><Lock size={18} className="shrink-0 text-ink" aria-hidden /> Ce compte est un compte administrateur : seul un administrateur peut le modifier.</p>
      ) : (
        <>
          <InfoForm id={u.id} initial={{ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone ?? "", address: u.address ?? "" }} />
          {s.can("access.manage") ? (
            <AccessForm id={u.id} initialRole={u.role} initialPerms={u.permissions.split(",").filter(Boolean)} self={self} />
          ) : (
            <p className="card p-6 text-sm text-muted">Rôle : <b className="text-ink">{ROLE_LABELS[u.role]}</b>. Seul l'administrateur peut modifier les rôles et les accès.</p>
          )}
          <AccountActions id={u.id} status={u.status} self={self} canDelete={s.can("access.manage")} name={name} />
        </>
      )}

      <section className="card p-6 md:p-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light text-brand"><Receipt size={18} /></span>
          <h2 className="text-lg font-bold text-ink">Derniers paiements</h2>
        </div>
        {lastTx.length === 0 ? <p className="text-sm text-muted">Aucun paiement.</p> : (
          <ul className="divide-y divide-ink/[0.06] text-sm">
            {lastTx.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0"><span className="text-ink">{x.description}</span> <span className="text-muted">· {relativeFr(x.createdAt)}</span></span>
                <span className="flex items-center gap-3"><StatusBadge status={x.status} /><span className="tabular font-semibold text-ink">{xof(x.amount)}</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
