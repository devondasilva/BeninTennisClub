import { notFound } from "next/navigation";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import EventForm from "@/components/admin/EventForm";

export const metadata = { title: "Modifier un événement" };
const local = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession("events.manage");
  const e = db.events.get((await params).id);
  if (!e) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/dashboard/admin/events" label="Gestion des événements" />
      <PageHeader eyebrow="Gestion des événements" title={e.title} subtitle="Modifier l'événement" />
      <EventForm initial={{ id: e.id, title: e.title, description: e.description, type: e.type, startDate: local(e.startDate), endDate: local(e.endDate), location: e.location, capacity: e.capacity, price: e.price, image: e.image?.startsWith("/images/events/") ? null : e.image }} />
    </div>
  );
}
