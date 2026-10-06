import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import PartnerForm from "@/components/partners/PartnerForm";

export const metadata = { title: "Modifier un partenaire" };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("partners.manage");
  const p = await db.query.partners.findFirst({ where: eq(t.partners.id, (await params).id) });
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/partners" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-400"><ArrowLeft size={16} /> Partenaires</Link>
      <PageHeader title={p.name} subtitle={`${p.impressions.toLocaleString("fr-FR")} affichages · ${p.clicks.toLocaleString("fr-FR")} clics`} />
      <PartnerForm initial={{
        id: p.id, name: p.name, tier: p.tier, description: p.description, tagline: p.tagline ?? "", website: p.website ?? "",
        logo: p.logo, banner: p.banner, placements: p.placements.split(",").filter(Boolean), amount: p.amount,
        startDate: iso(p.startDate), endDate: iso(p.endDate), status: p.status,
        contactName: p.contactName ?? "", contactEmail: p.contactEmail ?? "", contactPhone: p.contactPhone ?? "",
      }} />
    </div>
  );
}
