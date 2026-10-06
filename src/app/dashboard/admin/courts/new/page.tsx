import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import CourtForm from "@/components/admin/CourtForm";

export const metadata = { title: "Ajouter un court" };

export default async function NewCourt() {
  await requireSession("courts.manage");
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/admin/courts" label="Courts" />
      <PageHeader title="Ajouter un court" />
      <CourtForm initial={{ name: "", surface: "Dur (résine)", description: "", pricePerSlot: 5000, image: "/images/courts/court-1.svg", isActive: true }} />
    </div>
  );
}
