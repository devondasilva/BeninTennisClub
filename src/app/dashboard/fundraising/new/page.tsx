import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import CampaignForm from "@/components/admin/CampaignForm";

export const metadata = { title: "Lancer une collecte" };

export default async function NewCampaignPage() {
  await requireSession("fundraising.manage");
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/dashboard/fundraising" label="Collectes" />
      <PageHeader title="Lancer une collecte" />
      <CampaignForm initial={{ title: "", description: "", category: "EQUIPMENT", targetAmount: 500000, deadline: "", image: null, status: "ACTIVE" }} />
    </div>
  );
}
