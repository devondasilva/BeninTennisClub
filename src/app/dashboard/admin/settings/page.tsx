import { requireSession } from "@/lib/auth";
import { getClubInfo, getMemberships } from "@/lib/settings";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import SettingsEditor from "./SettingsEditor";

export const metadata = { title: "Infos du club" };

export default async function SettingsPage() {
  await requireSession("content.manage");
  const [info, memberships] = await Promise.all([getClubInfo(), getMemberships()]);
  return (
    <div className="mx-auto max-w-5xl">
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader eyebrow="Back-office · Site" title="Infos du club" subtitle="Ces informations sont publiées sur le site" />
      <SettingsEditor info={info} memberships={memberships} />
    </div>
  );
}
