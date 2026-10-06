import Link from "next/link";
import { asc, sql } from "drizzle-orm";
import { Plus, Pencil, Search } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Flash from "@/components/admin/Flash";

export const metadata = { title: "Articles de la boutique" };
const CATS: Record<string, string> = { RACKETS: "Raquettes", BALLS: "Balles", CLOTHING: "Vêtements", SHOES: "Chaussures", ACCESSORIES: "Accessoires" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ ok?: string; q?: string }> }) {
  await requireSession("shop.manage");
  const { ok, q } = await searchParams;
  const products = (await db.query.products.findMany({ orderBy: [asc(t.products.category), asc(t.products.name)] }))
    .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const sold = await db.select({ productId: t.orderItems.productId, n: sql<number>`sum(${t.orderItems.quantity})` }).from(t.orderItems).groupBy(t.orderItems.productId);

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader title="Articles de la boutique" subtitle={`${products.filter((p) => p.isActive).length} articles en vente`}
        action={<Link href="/dashboard/admin/products/new" className="btn-accent"><Plus size={16} /> Ajouter un article</Link>} />
      <Flash text={ok} />
      <form className="relative mb-4 max-w-md"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input name="q" defaultValue={q} className="input pl-9" placeholder="Rechercher un article..." /></form>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Article</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Vendus</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.isActive ? "" : "opacity-60"}>
                <td>
                  <Link href={`/dashboard/admin/products/${p.id}/edit`} className="flex items-center gap-3 hover:underline">
                    <img src={p.image ?? "/images/logo.svg"} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="font-semibold text-primary-400">{p.name}</span>
                  </Link>
                </td>
                <td>{CATS[p.category]}</td>
                <td className="whitespace-nowrap font-semibold">{xof(p.price)}</td>
                <td><span className={`chip ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{p.stock}</span></td>
                <td>{sold.find((x) => x.productId === p.id)?.n ?? 0}</td>
                <td><span className={`chip ${p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{p.isActive ? "En vente" : "Retiré"}</span></td>
                <td className="text-right"><Link href={`/dashboard/admin/products/${p.id}/edit`} className="btn-primary px-3 py-1.5 text-xs"><Pencil size={13} /> Modifier</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
