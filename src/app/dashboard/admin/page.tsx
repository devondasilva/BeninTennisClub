import Link from "next/link";
import {
  ShoppingBag, Package, MapPin, Users, Trophy, UserCog, CreditCard, HeartHandshake, Handshake, Mail, Settings2,
  ScrollText, Wrench, BarChart3, BadgePercent, CalendarDays, ArrowUpRight, Plus, ShieldCheck, AlertTriangle, LayoutGrid,
} from "lucide-react";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";
import { PageHeader, StatCard } from "@/components/ui";

export const metadata = { title: "Centre de contrôle" };

type Group = "Activités" | "Ventes" | "Club";
type Tile = { perm: Permission; group: Group; href: string; title: string; text: string; icon: React.ElementType; stat?: string; alert?: boolean; add?: { href: string; label: string } };

const GROUPS: { key: Group; text: string; icon: string }[] = [
  { key: "Activités", text: "Courts, réservations, événements et équipe", icon: "bg-brand-light text-brand" },
  { key: "Ventes", text: "Boutique, paiements, collectes et sponsors", icon: "bg-lime-light text-ink" },
  { key: "Club", text: "Membres, communication et pilotage", icon: "bg-ink text-lime" },
];

export default async function AdminHub() {
  const s = await requireSession();
  if (s.perms.size === 0) return <p className="card p-8 text-muted">Vous n'avez accès à aucun outil de gestion.</p>;

  const now = new Date();
  const products = db.products.count((p) => p.isActive);
  const lowStock = db.products.count((p) => p.isActive && p.stock <= 5);
  const orders = db.orders.count((o) => o.status === "PAID");
  const members = db.users.count();
  const coaches = db.coaches.count((c) => c.status === "ACTIVE");
  const events = db.events.count((e) => e.endDate >= now && e.status === "ACTIVE");
  const newMsgs = db.contactMessages.count((m) => m.status === "NEW");
  const pendingStr = db.stringingRequests.count((r) => r.status === "PENDING" || r.status === "IN_PROGRESS");

  const tiles: Tile[] = [
    { perm: "shop.manage", group: "Ventes", href: "/dashboard/admin/products", title: "Articles de la boutique", text: "Ajouter des articles, photos, prix et stock", icon: ShoppingBag, stat: `${products} en vente${lowStock ? ` · ${lowStock} stock bas` : ""}`, alert: lowStock > 0, add: { href: "/dashboard/admin/products/new", label: "Nouvel article" } },
    { perm: "orders.manage", group: "Ventes", href: "/dashboard/admin/orders", title: "Commandes", text: "Préparer, expédier, livrer ou annuler", icon: Package, stat: `${orders} à expédier`, alert: orders > 0 },
    { perm: "coaches.manage", group: "Activités", href: "/dashboard/coaches", title: "Coachs", text: "Ajouter un coach, modifier fiches et tarifs", icon: Users, stat: `${coaches} actifs`, add: { href: "/dashboard/coaches/new", label: "Nouveau coach" } },
    { perm: "courts.manage", group: "Activités", href: "/dashboard/admin/courts", title: "Courts & tarifs", text: "Prix des créneaux, photos, fermeture d'un court", icon: MapPin, add: { href: "/dashboard/admin/courts/new", label: "Nouveau court" } },
    { perm: "events.manage", group: "Activités", href: "/dashboard/admin/events", title: "Événements & inscrits", text: "Créer, modifier, annuler, liste des inscrits", icon: Trophy, stat: `${events} à venir`, add: { href: "/dashboard/events/new", label: "Nouvel événement" } },
    { perm: "reservations.manage", group: "Activités", href: "/dashboard/reservations?scope=club", title: "Réservations du club", text: "Toutes les réservations, annulation", icon: CalendarDays },
    { perm: "members.manage", group: "Club", href: "/dashboard/members", title: "Adhérents & accès", text: "Comptes, rôles, accès précis, suspension", icon: UserCog, stat: `${members} comptes`, add: { href: "/dashboard/members/new", label: "Nouveau membre" } },
    { perm: "payments.manage", group: "Ventes", href: "/dashboard/payments?scope=club", title: "Paiements", text: "Tous les paiements, encaisser en espèces, rembourser", icon: CreditCard },
    { perm: "stringing.manage", group: "Activités", href: "/dashboard/stringing", title: "Atelier cordage", text: "Suivre les raquettes déposées", icon: Wrench, stat: `${pendingStr} en cours`, alert: pendingStr > 0 },
    { perm: "commissions.manage", group: "Activités", href: "/dashboard/coaches/commissions", title: "Commissions", text: "Régler les coachs", icon: BadgePercent },
    { perm: "fundraising.manage", group: "Ventes", href: "/dashboard/fundraising", title: "Collectes", text: "Lancer, modifier, clôturer", icon: HeartHandshake, add: { href: "/dashboard/fundraising/new", label: "Nouvelle collecte" } },
    { perm: "partners.manage", group: "Ventes", href: "/dashboard/partners", title: "Partenaires & pub", text: "Sponsors, bannières, statistiques", icon: Handshake, add: { href: "/dashboard/partners/new", label: "Nouveau partenaire" } },
    { perm: "messages.manage", group: "Club", href: "/dashboard/messages", title: "Messages du site", text: "Formulaire de contact", icon: Mail, stat: newMsgs ? `${newMsgs} nouveau(x)` : "Aucun nouveau", alert: newMsgs > 0 },
    { perm: "analytics.view", group: "Club", href: "/dashboard/analytics", title: "Statistiques", text: "Recettes, occupation, meilleures ventes", icon: BarChart3 },
    { perm: "content.manage", group: "Club", href: "/dashboard/admin/settings", title: "Infos du club", text: "Coordonnées, horaires, tarifs d'adhésion", icon: Settings2 },
    { perm: "access.manage", group: "Club", href: "/dashboard/admin/journal", title: "Journal d'activité", text: "Qui a fait quoi dans l'administration", icon: ScrollText },
  ];
  const mine = tiles.filter((x) => s.can(x.perm));

  // Indicateurs « à traiter » limités aux outils confiés
  const todo = [
    s.can("orders.manage") && { label: "Commandes à expédier", value: orders, icon: Package },
    s.can("messages.manage") && { label: "Messages non lus", value: newMsgs, icon: Mail },
    s.can("stringing.manage") && { label: "Cordages en cours", value: pendingStr, icon: Wrench },
    s.can("shop.manage") && { label: "Articles en stock bas", value: lowStock, icon: AlertTriangle },
    s.can("events.manage") && { label: "Événements à venir", value: events, icon: Trophy },
    s.can("members.manage") && { label: "Comptes membres", value: members, icon: UserCog },
  ].filter(Boolean).slice(0, 3) as { label: string; value: number; icon: typeof Package }[];
  const tones = ["sky", "lime", "clay"] as const;

  return (
    <div>
      <PageHeader eyebrow="Back-office" title="Centre de contrôle"
        subtitle={s.isAdmin ? "Vous avez le contrôle total du club" : "Les outils de gestion qui vous ont été confiés"}
        action={<Link href="/" className="btn-ghost btn-sm"><ArrowUpRight size={15} /> Voir le site</Link>} />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Outils confiés" value={`${mine.length}`} icon={s.isAdmin ? ShieldCheck : LayoutGrid} tone="navy" hint={s.isAdmin ? "Administrateur · accès complet" : "Selon votre rôle et vos accès"} />
        {todo.map((k, i) => <StatCard key={k.label} label={k.label} value={k.value.toLocaleString("fr-FR")} icon={k.icon} tone={tones[i]} />)}
      </div>

      <div className="space-y-10">
        {GROUPS.map((g) => {
          const list = mine.filter((x) => x.group === g.key);
          if (!list.length) return null;
          return (
            <section key={g.key} aria-labelledby={`grp-${g.key}`}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="eyebrow">{g.key}</p>
                  <h2 id={`grp-${g.key}`} className="mt-1 text-sm text-muted">{g.text}</h2>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-ink/40">{list.length} outil{list.length > 1 ? "s" : ""}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {list.map(({ href, title, text, icon: Icon, stat, alert, add }) => (
                  <div key={href} className="card group relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                    <Link href={href} className="flex flex-1 flex-col">
                      <span className="flex items-start justify-between gap-3">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 ${g.icon}`}><Icon size={22} /></span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink/40 transition group-hover:border-brand group-hover:bg-brand group-hover:text-white" aria-hidden>
                          <ArrowUpRight size={16} />
                        </span>
                      </span>
                      <span className="mt-5 block text-[17px] font-bold tracking-tight text-ink">{title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>
                      {stat && (
                        <span className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${alert ? "bg-amber-50 text-amber-800 ring-amber-600/20" : "bg-ink/[0.05] text-ink/70 ring-ink/10"}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />{stat}
                        </span>
                      )}
                    </Link>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/[0.06] pt-4">
                      <Link href={href} className="text-[11px] font-bold uppercase tracking-widest text-brand hover:text-ink">Gérer</Link>
                      {add && <Link href={add.href} className="inline-flex items-center gap-1.5 rounded-xl bg-mist px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-inset ring-ink/[0.08] transition hover:bg-ink hover:text-white"><Plus size={14} /> {add.label}</Link>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
