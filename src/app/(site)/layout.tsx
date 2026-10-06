import { db } from "@/db";
import { getSession } from "@/lib/auth";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PartnerStrip from "@/components/site/PartnerStrip";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  const u = s ? db.users.get(s.userId) : null;
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <SiteHeader user={u ? { name: `${u.firstName} ${u.lastName}`, avatar: u.avatar } : null} />
      <main className="flex-1">{children}</main>
      <PartnerStrip />
      <SiteFooter />
    </div>
  );
}
