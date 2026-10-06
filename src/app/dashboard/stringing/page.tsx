import { desc, eq, ne } from "drizzle-orm";
import { Clock, Wrench, ShieldCheck } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/ui";
import StringingForm from "./StringingForm";
import StatusSelect from "./StatusSelect";

export const metadata = { title: "Cordage" };

const TYPE: Record<string, string> = { SYNTHETIC: "Synthétique", POLYESTER: "Polyester", NATURAL: "Boyau naturel", HYBRID: "Hybride" };

export default async function StringingPage() {
  const s = await requireSession();
  const workshop = s.can("stringing.manage");
  const list = await db.query.stringingRequests.findMany({
    where: workshop ? ne(t.stringingRequests.status, "PENDING_PAYMENT") : eq(t.stringingRequests.userId, s.userId),
    with: { user: true },
    orderBy: desc(t.stringingRequests.createdAt),
  });

  return (
    <div>
      <PageHeader title="Cordage de raquettes" subtitle="Déposez votre raquette à l'accueil, on s'occupe du reste" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[[Clock, "48 h (24 h en express)", "Délai de pose"], [Wrench, "Machine électronique", "Tension au dixième près"], [ShieldCheck, "Cordeur certifié", "Plus de 2 000 raquettes cordées"]].map(([Icon, a, b]) => {
          const I = Icon as typeof Clock;
          return (
            <div key={a as string} className="card flex items-center gap-3 p-4">
              <span className="rounded-xl bg-accent-100 p-2.5 text-primary-400"><I size={20} /></span>
              <div><p className="font-semibold text-primary-400">{a as string}</p><p className="text-xs text-slate-500">{b as string}</p></div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3"><StringingForm /></div>
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-primary-400">{workshop ? "Atelier — toutes les demandes" : "Mes demandes"}</h2>
            {list.length === 0 ? <p className="py-8 text-center text-slate-500">Aucune demande.</p> : (
              <ul className="space-y-3">
                {list.map((r) => (
                  <li key={r.id} className="rounded-xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-primary-400">{r.racketBrand} {r.racketModel}</p>
                        <p className="text-xs text-slate-500">{TYPE[r.stringType] ?? r.stringType} · {r.tension} lbs · {r.stringPattern}{r.urgent && " · ⚡ express"}</p>
                        {workshop && <p className="text-xs text-slate-500">{r.user.firstName} {r.user.lastName} · {r.user.phone}</p>}
                      </div>
                      {workshop && r.status !== "PENDING_PAYMENT" ? <StatusSelect id={r.id} status={r.status} /> : <StatusBadge status={r.status} />}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>Dépôt : {dateFr(r.preferredDate, { day: "numeric", month: "short" })}</span>
                      <span className="font-semibold text-slate-700">{xof(r.price)}</span>
                    </div>
                    {r.notes && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs italic text-slate-500">« {r.notes} »</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
