import { notFound } from "next/navigation";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import CourtForm from "@/components/admin/CourtForm";

export const metadata = { title: "Modifier un court" };

export default async function EditCourt({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("courts.manage");
  const c = db.courts.get((await params).id);
  if (!c) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/admin/courts" label="Courts" />
      <PageHeader eyebrow="Back-office · Courts" title={c.name} subtitle="Modifier le court" />
      <CourtForm initial={{ id: c.id, name: c.name, surface: c.surface, description: c.description ?? "", pricePerSlot: c.pricePerSlot, image: c.image, isActive: c.isActive }} />
    </div>
  );
}
