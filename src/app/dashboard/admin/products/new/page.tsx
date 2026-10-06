import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Ajouter un article" };

export default async function NewProduct() {
  await requireSession("shop.manage");
  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/dashboard/admin/products" label="Articles" />
      <PageHeader title="Ajouter un article" />
      <ProductForm initial={{ name: "", description: "", category: "ACCESSORIES", price: 5000, stock: 10, image: null, isActive: true }} />
    </div>
  );
}
