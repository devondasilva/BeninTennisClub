import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Modifier un article" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("shop.manage");
  const p = await db.query.products.findFirst({ where: eq(t.products.id, (await params).id) });
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/dashboard/admin/products" label="Articles" />
      <PageHeader title={p.name} subtitle="Modifier l'article" />
      <ProductForm initial={{ id: p.id, name: p.name, description: p.description, category: p.category, price: p.price, stock: p.stock, image: p.image, isActive: p.isActive }} />
    </div>
  );
}
