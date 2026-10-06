import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import NewMemberForm from "./NewMemberForm";

export const metadata = { title: "Nouveau membre" };

export default async function NewMemberPage() {
  const s = await requireSession("members.manage");
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/dashboard/members" label="Adhérents" />
      <PageHeader eyebrow="Back-office · Adhérents" title="Créer un compte membre" subtitle="Un mot de passe provisoire est généré automatiquement" />
      <NewMemberForm canSetRole={s.can("access.manage")} />
    </div>
  );
}
