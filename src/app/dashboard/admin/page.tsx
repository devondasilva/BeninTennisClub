import Link from "next/link";
import { count, eq, sql } from "drizzle-orm";
import {
  ShoppingBag, Package, MapPin, Users, Trophy, UserCog, CreditCard, HeartHandshake, Handshake, Mail, Settings2,
  ScrollText, Wrench, BarChart3, BadgePercent, CalendarDays, ArrowRight, Plus,
} from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Centre de contrôle" };

type Tile = { perm: Permission; href: string; title: string; text: string; icon: React.ElementType; stat?: string; add?: { href: string; label: string } };

export default async function AdminHub() {
  const s = await requireSession();
  if (s.perms.size === 0) return <p className="card p-8 text-slate-500">Vous n'avez accès à aucun outil de gestion.</p>;

  const one = async (q: Promise<{ n: number }[]>) => (await q)[0].n;
  const [products, lowStock, orders, members, coaches, events, newMsgs, pendingStr] = await Promise.all([
    one(db.select({ n: count() }).from(t.products).where(eq(t.products.isActive, true))),
    one(db.select({ n: count() }).from(t.products).where(sql`${t.products.isActive} = 1 and ${t.products.stock} <= 5`)),
    one(db.select({ n: count() }).from(t.orders).where(eq(t.orders.status, "PAID"))),
    one(db.select({ n: count() }).from(t.users)),
    one(db.select({ n: count() }).from(t.coaches).where(eq(t.coaches.status, "ACTIVE"))),
    one(db.select({ n: count() }).from(t.events).where(sql`${t.events.endDate} >= ${Date.now()} and ${t.events.status} = 'ACTIVE'`)),
    one(db.select({ n: count() }).from(t.contactMessages).where(eq(t.contactMessages.status, "NEW"))),
    one(db.select({ n: count() }).from(t.stringingRequests).where(sql`${t.stringingRequests.status} in ('PENDING','IN_PROGRESS')`)),
  ]);

  const tiles: Tile[] = [
    { perm: "shop.manage", href: "/dashboard/admin/products", title: "Articles de la boutique", text: "Ajouter des articles, photos, prix et stock", icon: ShoppingBag, stat: `${products} en vente${lowStock ? ` · ${lowStock} stock bas` : ""}`, add: { href: "/dashboard/admin/products/new", label: "Nouvel article" } },
    { perm: "orders.manage", href: "/dashboard/admin/orders", title: "Commandes", text: "Préparer, expédier, livrer ou annuler", icon: Package, stat: `${orders} à expédier` },
    { perm: "coaches.manage", href: "/dashboard/coaches", title: "Coachs", text: "Ajouter un coach, modifier fiches et tarifs", icon: Users, stat: `${coaches} actifs`, add: { href: "/dashboard/coaches/new", label: "Nouveau coach" } },
    { perm: "courts.manage", href: "/dashboard/admin/courts", title: "Courts & tarifs", text: "Prix des créneaux, photos, fermeture d'un court", icon: MapPin, add: { href: "/dashboard/admin/courts/new", label: "Nouveau court" } },
    { perm: "events.manage", href: "/dashboard/admin/events", title: "Événements & inscrits", text: "Créer, modifier, annuler, liste des inscrits", icon: Trophy, stat: `${events} à venir`, add: { href: "/dashboard/events/new", label: "Nouvel événement" } },
    { perm: "reservations.manage", href: "/dashboard/reservations?scope=club", title: "Réservations du club", text: "Toutes les réservations, annulation", icon: CalendarDays },
    { perm: "members.manage", href: "/dashboard/members", title: "Adhérents & accès", text: "Comptes, rôles, accès précis, suspension", icon: UserCog, stat: `${members} comptes`, add: { href: "/dashboard/members/new", label: "Nouveau membre" } },
    { perm: "payments.manage", href: "/dashboard/payments?scope=club", title: "Paiements", text: "Tous les paiements, encaisser en espèces, rembourser", icon: CreditCard },
    { perm: "stringing.manage", href: "/dashboard/stringing", title: "Atelier cordage", text: "Suivre les raquettes déposées", icon: Wrench, stat: `${pendingStr} en cours` },
    { perm: "commissions.manage", href: "/dashboard/coaches/commissions", title: "Commissions", text: "Régler les coachs", icon: BadgePercent },
    { perm: "fundraising.manage", href: "/dashboard/fundraising", title: "Collectes", text: "Lancer, modifier, clôturer", icon: HeartHandshake, add: { href: "/dashboard/fundraising/new", label: "Nouvelle collecte" } },
    { perm: "partners.manage", href: "/dashboard/partners", title: "Partenaires & pub", text: "Sponsors, bannières, statistiques", icon: Handshake, add: { href: "/dashboard/partners/new", label: "Nouveau partenaire" } },
    { perm: "messages.manage", href: "/dashboard/messages", title: "Messages du site", text: "Formulaire de contact", icon: Mail, stat: newMsgs ? `${newMsgs} nouveau(x)` : "Aucun nouveau" },
    { perm: "analytics.view", href: "/dashboard/analytics", title: "Statistiques", text: "Recettes, occupation, meilleures ventes", icon: BarChart3 },
    { perm: "content.manage", href: "/dashboard/admin/settings", title: "Infos du club", text: "Coordonnées, horaires, tarifs d'adhésion", icon: Settings2 },
    { perm: "access.manage", href: "/dashboard/admin/journal", title: "Journal d'activité", text: "Qui a fait quoi dans l'administration", icon: ScrollText },
  ];
  const mine = tiles.filter((x) => s.can(x.perm));

  return (
    <div>
      <PageHeader title="Centre de contrôle" subtitle={s.isAdmin ? "Vous avez le contrôle total du club" : "Les outils de gestion qui vous ont été confiés"} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {mine.map(({ href, title, text, icon: Icon, stat, add }) => (
          <div key={href} className="card group flex flex-col p-5 transition hover:border-accent-400 hover:shadow-medium">
            <Link href={href} className="flex flex-1 gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-400 text-accent-400"><Icon size={22} /></span>
              <span className="flex-1">
                <span className="block font-bold text-primary-400 group-hover:underline">{title}</span>
                <span className="block text-sm text-slate-500">{text}</span>
                {stat && <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{stat}</span>}
              </span>
            </Link>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-400">Gérer <ArrowRight size={15} className="transition group-hover:translate-x-1" /></Link>
              {add && <Link href={add.href} className="btn-accent px-3 py-1.5 text-xs"><Plus size={14} /> {add.label}</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
