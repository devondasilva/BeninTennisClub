import { notFound } from "next/navigation";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import CampaignForm from "@/components/admin/CampaignForm";

export const metadata = { title: "Modifier la collecte" };
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("fundraising.manage");
  const c = db.campaigns.get((await params).id);
  if (!c) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/dashboard/fundraising/${c.id}`} label="Retour à la collecte" />
      <PageHeader eyebrow="Collectes du club" title={c.title} subtitle="Modifier la collecte" />
      <CampaignForm initial={{ id: c.id, title: c.title, description: c.description, category: c.category, targetAmount: c.targetAmount, deadline: iso(c.deadline), image: c.image?.startsWith("/images/") ? null : c.image, status: c.status }} />
    </div>
  );
}
