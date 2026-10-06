import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "Commande" };

export default async function CheckoutPage() {
  const s = await requireSession();
  const u = db.users.get(s.userId);
  return <CheckoutClient defaultPhone={u?.phone ?? "+229 "} />;
}
