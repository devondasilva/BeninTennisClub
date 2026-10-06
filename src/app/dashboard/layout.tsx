import { db } from "@/db";
import { requireSession, ROLE_LABELS } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSession();
  const unread = db.notifications.count((n) => n.userId === s.userId && !n.read);
  const me = db.users.get(s.userId);
  const newMessages = s.can("messages.manage") ? db.contactMessages.count((m) => m.status === "NEW") : 0;

  return (
    <div className="min-h-screen bg-mist lg:flex">
      <Sidebar perms={[...s.perms]} avatar={me?.avatar ?? null} newMessages={newMessages} name={`${me?.firstName ?? s.firstName} ${me?.lastName ?? s.lastName}`} role={s.role} roleLabel={ROLE_LABELS[s.role] ?? s.role} unread={unread} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
