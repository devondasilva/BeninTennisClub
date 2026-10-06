import { and, count, eq } from "drizzle-orm";
import { db, t } from "@/db";
import { requireSession, ROLE_LABELS } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSession();
  const [{ n }] = await db
    .select({ n: count() })
    .from(t.notifications)
    .where(and(eq(t.notifications.userId, s.userId), eq(t.notifications.read, false)));

  const me = await db.query.users.findFirst({ where: eq(t.users.id, s.userId), columns: { avatar: true, firstName: true, lastName: true } });
  const newMessages = s.can("messages.manage")
    ? (await db.select({ n: count() }).from(t.contactMessages).where(eq(t.contactMessages.status, "NEW")))[0].n
    : 0;

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar perms={[...s.perms]} avatar={me?.avatar ?? null} newMessages={newMessages} name={`${me?.firstName ?? s.firstName} ${me?.lastName ?? s.lastName}`} role={s.role} roleLabel={ROLE_LABELS[s.role] ?? s.role} unread={n} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
