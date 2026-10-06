import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { getSession } from "@/lib/auth";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PartnerStrip from "@/components/site/PartnerStrip";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  const u = s ? await db.query.users.findFirst({ where: eq(t.users.id, s.userId), columns: { firstName: true, lastName: true, avatar: true } }) : null;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader user={u ? { name: `${u.firstName} ${u.lastName}`, avatar: u.avatar } : null} />
      <main className="flex-1">{children}</main>
      <PartnerStrip />
      <SiteFooter />
    </div>
  );
}
