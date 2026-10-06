import { redirect } from "next/navigation";
import { getAccess, getSession } from "@/lib/auth";
import { safeNext } from "@/lib/safe-redirect";
import LoginView from "./LoginView";

export const metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  expire: "Votre session a expiré ou la base de données a été réinitialisée. Merci de vous reconnecter.",
  suspendu: "Ce compte est suspendu. Contactez l'accueil du club.",
};

/**
 * Seul le serveur, après vérification en base, peut renvoyer vers l'espace membre.
 * Un cookie présent mais invalide (compte supprimé, base réinitialisée) n'entraîne
 * donc jamais de boucle de redirections.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; motif?: string }> }) {
  const { next, motif } = await searchParams;
  if (await getAccess()) redirect(safeNext(next));
  const stale = !motif && (await getSession()) ? NOTICES.expire : undefined;
  return <LoginView notice={(motif && NOTICES[motif]) || stale} />;
}
