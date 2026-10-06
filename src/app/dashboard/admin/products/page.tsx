import Link from "next/link";
import { Plus, Pencil, Search, ShoppingBag, AlertTriangle, PackageX, TrendingUp } from "lucide-react";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader, StatCard, Empty } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Flash from "@/components/admin/Flash";
import { Badge } from "@/components/admin/kit";

export const metadata = { title: "Articles de la boutique" };
const CATS: Record<string, string> = { RACKETS: "Raquettes", BALLS: "Balles", CLOTHING: "Vêtements", SHOES: "Chaussures", ACCESSORIES: "Accessoires" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ ok?: string; q?: string }> }) {
  await requireSession("shop.manage");
  const { ok, q } = await searchParams;
  const all = db.products.all().sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const products = all.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const sold = new Map<string, number>();
  for (const i of db.orderItems.all()) sold.set(i.productId, (sold.get(i.productId) ?? 0) + i.quantity);
  const active = all.filter((p) => p.isActive);
  const totalSold = [...sold.values()].reduce((a, n) => a + n, 0);

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader eyebrow="Back-office · Boutique" title="Articles de la boutique" subtitle={`${active.length} articles en vente`}
        action={<Link href="/dashboard/admin/products/new" className="btn-primary"><Plus size={16} /> Ajouter un article</Link>} />
      <Flash text={ok} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Articles en vente" value={String(active.length)} icon={ShoppingBag} tone="navy" hint={`${all.length - active.length} retiré(s) de la vente`} />
        <StatCard label="Stock bas (≤ 5)" value={String(active.filter((p) => p.stock > 0 && p.stock <= 5).length)} icon={AlertTriangle} tone="clay" />
        <StatCard label="Ruptures" value={String(active.filter((p) => p.stock === 0).length)} icon={PackageX} tone="sky" />
        <StatCard label="Articles vendus" value={totalSold.toLocaleString("fr-FR")} icon={TrendingUp} tone="lime" hint="Depuis l'ouverture" />
      </div>
      <form className="relative mb-5 max-w-md" role="search">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" aria-hidden />
        <input name="q" defaultValue={q} className="input pl-11" placeholder="Rechercher un article..." aria-label="Rechercher un article" />
      </form>
      {products.length === 0 ? <Empty>Aucun article ne correspond à votre recherche.</Empty> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base min-w-[820px]">
              <thead><tr><th>Article</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Vendus</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={`transition hover:bg-mist/60 ${p.isActive ? "" : "opacity-60"}`}>
                    <td>
                      <Link href={`/dashboard/admin/products/${p.id}/edit`} className="group flex items-center gap-3">
                        <img src={p.image ?? "/images/logo.svg"} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-mist object-cover" />
                        <span className="font-semibold text-ink group-hover:text-brand group-hover:underline">{p.name}</span>
                      </Link>
                    </td>
                    <td className="text-muted">{CATS[p.category] ?? p.category}</td>
                    <td className="tabular whitespace-nowrap font-semibold">{xof(p.price)}</td>
                    <td><Badge tone={p.stock === 0 ? "red" : p.stock <= 5 ? "amber" : "slate"} dot={false}><span className="tabular">{p.stock}</span></Badge></td>
                    <td className="tabular">{sold.get(p.id) ?? 0}</td>
                    <td><Badge tone={p.isActive ? "green" : "slate"}>{p.isActive ? "En vente" : "Retiré"}</Badge></td>
                    <td className="text-right"><Link href={`/dashboard/admin/products/${p.id}/edit`} className="btn-primary btn-sm"><Pencil size={13} /> Modifier</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
