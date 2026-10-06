import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { relativeFr } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import NotificationList from "./NotificationList";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const s = await requireSession();
  const list = sortBy(db.notifications.filter((n) => n.userId === s.userId), "createdAt", "desc").slice(0, 100);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle="Chaque notification est aussi envoyée par e-mail" />
      <NotificationList items={list.map((n) => ({ id: n.id, type: n.type, title: n.title, message: n.message, link: n.link, read: n.read, when: relativeFr(n.createdAt) }))} />
    </div>
  );
}
