import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import PartnerForm from "@/components/partners/PartnerForm";

export const metadata = { title: "Ajouter un partenaire" };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default async function NewPartnerPage() {
  await requireSession("partners.manage");
  const now = new Date();
  const inAYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/partners" label="Partenaires" />
      <PageHeader eyebrow="Back-office · Sponsors" title="Ajouter un partenaire" subtitle="Logo, bannière publicitaire et emplacements de diffusion" />
      <PartnerForm initial={{ name: "", tier: "PARTNER", description: "", tagline: "", website: "", logo: null, banner: null, placements: ["HOME", "DASHBOARD"], amount: 0, startDate: iso(now), endDate: iso(inAYear), status: "ACTIVE", contactName: "", contactEmail: "", contactPhone: "" }} />
    </div>
  );
}
