import { redirect } from "next/navigation";
import { getAccess } from "@/lib/auth";
import RegisterView from "./RegisterView";

export const metadata = { title: "Devenir membre" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getAccess()) redirect("/dashboard");
  return <RegisterView />;
}
