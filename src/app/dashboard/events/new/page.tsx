import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import EventForm from "@/components/admin/EventForm";

export const metadata = { title: "Créer un événement" };

export default async function NewEventPage() {
  await requireSession("events.manage");
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/dashboard/admin/events" label="Gestion des événements" />
      <PageHeader eyebrow="Gestion des événements" title="Créer un événement" subtitle="Tournoi, stage, école de tennis ou soirée" />
      <EventForm initial={{ title: "", description: "", type: "TOURNAMENT", startDate: "", endDate: "", location: "Court 1", capacity: 32, price: 10000, image: null }} />
    </div>
  );
}
