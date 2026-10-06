import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "Commande" };

export default async function CheckoutPage() {
  const s = await requireSession();
  const u = await db.query.users.findFirst({ where: eq(t.users.id, s.userId) });
  return <CheckoutClient defaultPhone={u?.phone ?? "+229 "} />;
}
