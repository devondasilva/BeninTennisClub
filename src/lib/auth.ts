import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { COOKIE_NAME, verifyToken, type SessionPayload } from "./jwt";
import { effectivePermissions, type Permission } from "./permissions";
export { ROLE_LABELS } from "./roles";

export const ROLES = ["ADMIN", "MANAGER", "COACH", "PARENT", "CLIENT", "STAFF", "SPONSOR"] as const;

export type Access = SessionPayload & {
  perms: Set<string>;
  avatar: string | null;
  can: (p: Permission) => boolean;
  isAdmin: boolean;
};

/** Lit uniquement le jeton (rapide, sans base) — pour l'affichage public */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Session + droits à jour lus en base à chaque requête :
 * un changement de rôle, d'accès ou une suspension s'applique immédiatement.
 */
export const getAccess = cache(async (): Promise<Access | null> => {
  const s = await getSession();
  if (!s) return null;
  const u = await db.query.users.findFirst({ where: eq(t.users.id, s.userId) });
  if (!u || u.status !== "ACTIVE") return null;
  const perms = effectivePermissions(u.role, u.permissions);
  return {
    userId: u.id, email: u.email, role: u.role, firstName: u.firstName, lastName: u.lastName,
    avatar: u.avatar, perms, isAdmin: u.role === "ADMIN",
    can: (p: Permission) => perms.has(p),
  };
});

/** Pages : redirige vers la connexion, ou vers le tableau de bord si la permission manque */
export async function requireSession(perm?: Permission | Permission[]): Promise<Access> {
  const a = await getAccess();
  if (!a) redirect("/login");
  if (perm && !(Array.isArray(perm) ? perm.some((p) => a.can(p)) : a.can(perm))) redirect("/dashboard?refus=1");
  return a;
}

/** Routes API */
export async function apiSession(perm?: Permission | Permission[]) {
  const a = await getAccess();
  if (!a) return { session: null, error: NextResponse.json({ message: "Non authentifié" }, { status: 401 }) } as const;
  if (perm && !(Array.isArray(perm) ? perm.some((p) => a.can(p)) : a.can(perm))) {
    return { session: null, error: NextResponse.json({ message: "Vous n'avez pas l'accès nécessaire pour cette action" }, { status: 403 }) } as const;
  }
  return { session: a, error: null } as const;
}

/** Journal des actions d'administration */
export async function logAction(a: Access, action: string, target?: string) {
  await db.insert(t.adminLogs).values({ userId: a.userId, userName: `${a.firstName} ${a.lastName}`, action, target });
}

/** Utilisateurs disposant d'une permission (pour les notifier) */
export async function usersWith(perm: Permission) {
  const all = await db.query.users.findMany({ where: eq(t.users.status, "ACTIVE") });
  return all.filter((u) => effectivePermissions(u.role, u.permissions).has(perm));
}
