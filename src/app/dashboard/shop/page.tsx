import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Package } from "lucide-react";
import { db, t } from "@/db";
import { PageHeader } from "@/components/ui";
import ShopClient from "./ShopClient";
import AdSlot from "@/components/AdSlot";

export const metadata = { title: "Boutique" };

export default async function ShopPage() {
  const products = await db.query.products.findMany({ where: eq(t.products.isActive, true), orderBy: asc(t.products.category) });
  return (
    <div>
      <PageHeader title="Boutique du club" subtitle="Livraison à Cotonou sous 3 à 5 jours · offerte dès 50 000 XOF"
        action={<Link href="/dashboard/shop/orders" className="btn-ghost"><Package size={16} /> Mes commandes</Link>} />
      <AdSlot placement="SHOP" className="mb-6" />
      <ShopClient products={products} />
    </div>
  );
}
