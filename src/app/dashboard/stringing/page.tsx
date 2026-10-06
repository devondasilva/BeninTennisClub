import { Clock, Wrench, ShieldCheck, Zap, Inbox, Hourglass, PackageCheck } from "lucide-react";
import { db } from "@/db";
import { indexById, sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import StringingForm from "./StringingForm";
import StatusSelect from "./StatusSelect";

export const metadata = { title: "Cordage" };

const TYPE: Record<string, string> = { SYNTHETIC: "Synthétique", POLYESTER: "Polyester", NATURAL: "Boyau naturel", HYBRID: "Hybride" };

const PERKS: [typeof Clock, string, string][] = [
  [Clock, "48 h (24 h en express)", "Délai de pose"],
  [Wrench, "Machine électronique", "Tension au dixième près"],
  [ShieldCheck, "Cordeur certifié", "Plus de 2 000 raquettes cordées"],
];

export default async function StringingPage() {
  const s = await requireSession();
  const workshop = s.can("stringing.manage");
  const users = indexById(db.users.all());
  const list = sortBy(
    db.stringingRequests.filter((r) => (workshop ? r.status !== "PENDING_PAYMENT" : r.userId === s.userId) && users.has(r.userId)),
    "createdAt",
    "desc"
  ).map((r) => ({ ...r, user: users.get(r.userId)! }));

  return (
    <div>
      <PageHeader title="Cordage de raquettes" subtitle="Déposez votre raquette à l'accueil, on s'occupe du reste" />

      {workshop ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="À traiter" value={String(list.filter((r) => r.status === "PENDING").length)} icon={Inbox} tone="navy" />
          <StatCard label="En cours" value={String(list.filter((r) => r.status === "IN_PROGRESS").length)} icon={Hourglass} tone="sky" />
          <StatCard label="Prêtes à récupérer" value={String(list.filter((r) => r.status === "READY_FOR_PICKUP").length)} icon={PackageCheck} tone="lime" />
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {PERKS.map(([I, a, b]) => (
          <div key={a} className="card flex items-center gap-4 p-5">
            <span className="rounded-xl bg-brand-light p-3 text-brand"><I size={20} /></span>
            <div><p className="font-bold text-ink">{a}</p><p className="text-xs text-muted">{b}</p></div>
          </div>
        ))}
      </div>

      <StringingForm />

      <section className="card mt-8 p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-black tracking-tight text-ink md:text-2xl">{workshop ? "Atelier — toutes les demandes" : "Mes demandes"}</h2>
            <p className="text-sm text-muted">{list.length} demande{list.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        {list.length === 0 ? <p className="rounded-2xl border-2 border-dashed border-ink/10 py-10 text-center text-muted">Aucune demande.</p> : (
          <ul className="grid gap-3 md:grid-cols-2">
            {list.map((r) => (
              <li key={r.id} className="rounded-2xl border border-ink/[0.08] bg-mist/50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink">{r.racketBrand} {r.racketModel}</p>
                    <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted">
                      {TYPE[r.stringType] ?? r.stringType} · {r.tension} lbs · {r.stringPattern}
                      {r.urgent && <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink"><Zap size={10} /> express</span>}
                    </p>
                    {workshop && <p className="mt-0.5 text-xs text-muted">{r.user.firstName} {r.user.lastName} · {r.user.phone}</p>}
                  </div>
                  {workshop && r.status !== "PENDING_PAYMENT" ? <StatusSelect id={r.id} status={r.status} /> : <StatusBadge status={r.status} />}
                </div>
                <div className="mt-3 flex justify-between border-t border-ink/[0.06] pt-3 text-xs text-muted">
                  <span>Dépôt : {dateFr(r.preferredDate, { day: "numeric", month: "short" })}</span>
                  <span className="tabular font-bold text-ink">{xof(r.price)}</span>
                </div>
                {r.notes && <p className="mt-3 rounded-xl bg-white p-3 text-xs italic text-muted">« {r.notes} »</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
