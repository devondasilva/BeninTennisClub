"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Trophy, CreditCard, Package, Wrench, Bell, XCircle, PartyPopper, CheckCheck } from "lucide-react";

type N = { id: string; type: string; title: string; message: string; link: string | null; read: boolean; when: string };

const ICONS: Record<string, [React.ElementType, string]> = {
  RESERVATION_CONFIRMED: [CalendarCheck, "bg-emerald-100 text-emerald-700"],
  RESERVATION_CANCELLED: [XCircle, "bg-red-100 text-red-700"],
  EVENT_REGISTERED: [Trophy, "bg-amber-100 text-amber-700"],
  PAYMENT_CONFIRMED: [CreditCard, "bg-sky-100 text-sky-700"],
  ORDER_CONFIRMED: [Package, "bg-purple-100 text-purple-700"],
  STRINGING_UPDATE: [Wrench, "bg-orange-100 text-orange-700"],
  WELCOME: [PartyPopper, "bg-accent-200 text-primary-400"],
};

export default function NotificationList({ items }: { items: N[] }) {
  const router = useRouter();
  const mark = async (id?: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : {}) });
    router.refresh();
  };
  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <p className="text-sm text-slate-500"><b className="text-primary-400">{unread}</b> non lue(s)</p>
        <button onClick={() => mark()} disabled={!unread} className="btn-ghost py-2"><CheckCheck size={16} /> Tout marquer comme lu</button>
      </div>
      {items.length === 0 && <p className="p-10 text-center text-slate-500">Aucune notification.</p>}
      <ul className="divide-y divide-slate-100">
        {items.map((n) => {
          const [Icon, color] = ICONS[n.type] ?? [Bell, "bg-slate-100 text-slate-600"];
          return (
            <li key={n.id} className={`flex gap-4 p-4 ${n.read ? "" : "bg-accent-50/60"}`}>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm ${n.read ? "font-medium text-slate-700" : "font-bold text-primary-400"}`}>{n.title}</p>
                  <span className="whitespace-nowrap text-xs text-slate-400">{n.when}</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                <div className="mt-2 flex gap-4 text-xs font-semibold">
                  {n.link && <Link href={n.link} onClick={() => !n.read && mark(n.id)} className="text-primary-400 hover:underline">Voir</Link>}
                  {!n.read && <button onClick={() => mark(n.id)} className="text-slate-500 hover:underline">Marquer comme lu</button>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
