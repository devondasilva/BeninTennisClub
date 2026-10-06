import { notFound } from "next/navigation";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import PartnerForm from "@/components/partners/PartnerForm";

export const metadata = { title: "Modifier un partenaire" };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("partners.manage");
  const p = db.partners.get((await params).id);
  if (!p) notFound();
  const ctr = p.impressions ? ((p.clicks / p.impressions) * 100).toFixed(1) : "0";
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/partners" label="Partenaires" />
      <PageHeader eyebrow="Back-office · Sponsors" title={p.name} subtitle={`${p.impressions.toLocaleString("fr-FR")} affichages · ${p.clicks.toLocaleString("fr-FR")} clics · taux de clic ${ctr} %`} />
      <PartnerForm initial={{
        id: p.id, name: p.name, tier: p.tier, description: p.description, tagline: p.tagline ?? "", website: p.website ?? "",
        logo: p.logo, banner: p.banner, placements: p.placements.split(",").filter(Boolean), amount: p.amount,
        startDate: iso(p.startDate), endDate: iso(p.endDate), status: p.status,
        contactName: p.contactName ?? "", contactEmail: p.contactEmail ?? "", contactPhone: p.contactPhone ?? "",
      }} />
    </div>
  );
}
