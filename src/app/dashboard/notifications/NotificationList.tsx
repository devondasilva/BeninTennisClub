"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Trophy, CreditCard, Package, Wrench, Bell, XCircle, PartyPopper, CheckCheck } from "lucide-react";

type N = { id: string; type: string; title: string; message: string; link: string | null; read: boolean; when: string };

const ICONS: Record<string, [React.ElementType, string]> = {
  RESERVATION_CONFIRMED: [CalendarCheck, "bg-emerald-100 text-emerald-800"],
  RESERVATION_CANCELLED: [XCircle, "bg-red-100 text-red-800"],
  EVENT_REGISTERED: [Trophy, "bg-amber-100 text-amber-800"],
  PAYMENT_CONFIRMED: [CreditCard, "bg-brand-light text-brand"],
  ORDER_CONFIRMED: [Package, "bg-purple-100 text-purple-800"],
  STRINGING_UPDATE: [Wrench, "bg-orange-100 text-orange-800"],
  WELCOME: [PartyPopper, "bg-lime text-ink"],
};

export default function NotificationList({ items }: { items: N[] }) {
  const router = useRouter();
  const mark = async (id?: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : {}) });
    router.refresh();
  };
  const unread = items.filter((i) => !i.read).length;

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] p-5 md:p-6">
        <div>
          <h2 className="font-display text-xl font-black tracking-tight text-ink">Boîte de réception</h2>
          <p className="text-sm text-muted"><b className="text-ink">{unread}</b> non lue(s)</p>
        </div>
        <button type="button" onClick={() => mark()} disabled={!unread} className="btn-ghost btn-sm"><CheckCheck size={16} /> Tout marquer comme lu</button>
      </div>
      {items.length === 0 && <p className="p-12 text-center text-muted">Aucune notification.</p>}
      <ul className="divide-y divide-ink/[0.06]">
        {items.map((n) => {
          const [Icon, color] = ICONS[n.type] ?? [Bell, "bg-mist text-ink/70"];
          return (
            <li key={n.id} className={`relative flex gap-4 p-5 md:px-6 ${n.read ? "" : "bg-lime-light/40"}`}>
              {!n.read && <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-lime-dark" aria-hidden />}
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}><Icon size={20} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm ${n.read ? "font-semibold text-ink/80" : "font-bold text-ink"}`}>{n.title}{!n.read && <span className="sr-only"> (non lue)</span>}</p>
                  <span className="whitespace-nowrap text-xs text-ink/45">{n.when}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
                  {n.link && <Link href={n.link} onClick={() => !n.read && mark(n.id)} className="text-brand hover:text-ink">Voir</Link>}
                  {!n.read && <button type="button" onClick={() => mark(n.id)} className="text-muted hover:text-ink">Marquer comme lu</button>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
