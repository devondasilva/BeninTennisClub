import Link from "next/link";
import { Package } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { PageHeader } from "@/components/ui";
import ShopClient from "./ShopClient";
import AdSlot from "@/components/AdSlot";

export const metadata = { title: "Boutique" };

export default async function ShopPage() {
  const products = sortBy(db.products.filter((p) => p.isActive), "category", "asc");
  return (
    <div>
      <PageHeader eyebrow="Boutique officielle" title="Boutique du club" subtitle="Livraison à Cotonou sous 3 à 5 jours · offerte dès 50 000 XOF"
        action={<Link href="/dashboard/shop/orders" className="btn-ghost"><Package size={16} /> Mes commandes</Link>} />
      <AdSlot placement="SHOP" className="mb-6" />
      <ShopClient products={products} />
    </div>
  );
}
