import { db } from "@/db";
import EventDetail from "@/components/EventDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const e = db.events.get((await params).id);
  return { title: e?.title ?? "Événement" };
}

export default async function DashboardEventPage({ params }: { params: Promise<{ id: string }> }) {
  return <EventDetail id={(await params).id} base="/dashboard/events" />;
}
