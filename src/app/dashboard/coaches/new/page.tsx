import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import NewCoachForm from "./NewCoachForm";

export const metadata = { title: "Ajouter un coach" };

export default async function NewCoachPage() {
  await requireSession("coaches.manage");
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/coaches" label="Coachs" />
      <PageHeader title="Ajouter un coach" subtitle="Sa fiche apparaîtra immédiatement sur la page « Nos coachs »" />
      <NewCoachForm />
    </div>
  );
}
