import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "@/db";
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

type Resolved = { access: Access | null; reason: "none" | "unknown" | "suspended" | "ok" };

/**
 * Session + droits à jour lus en base à chaque requête :
 * un changement de rôle, d'accès ou une suspension s'applique immédiatement.
 */
const resolveAccess = cache(async (): Promise<Resolved> => {
  const s = await getSession();
  if (!s) return { access: null, reason: "none" };
  const u = db.users.get(s.userId);
  if (!u) return { access: null, reason: "unknown" };
  if (u.status !== "ACTIVE") return { access: null, reason: "suspended" };
  const perms = effectivePermissions(u.role, u.permissions);
  return {
    reason: "ok",
    access: {
      userId: u.id, email: u.email, role: u.role, firstName: u.firstName, lastName: u.lastName,
      avatar: u.avatar, perms, isAdmin: u.role === "ADMIN",
      can: (p: Permission) => perms.has(p),
    },
  };
});

export const getAccess = async (): Promise<Access | null> => (await resolveAccess()).access;

/**
 * Pages : si la session n'est plus valable, le cookie est effacé (route /api/auth/logout)
 * avant le retour à la connexion ; si une permission manque, retour au tableau de bord.
 */
export async function requireSession(perm?: Permission | Permission[]): Promise<Access> {
  const { access: a, reason } = await resolveAccess();
  if (!a) {
    if (reason === "none") redirect("/login");
    redirect(`/api/auth/logout?motif=${reason === "suspended" ? "suspendu" : "expire"}`);
  }
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
  db.adminLogs.insert({ userId: a.userId, userName: `${a.firstName} ${a.lastName}`, action, target: target ?? null });
}

/** Utilisateurs disposant d'une permission (pour les notifier) */
export async function usersWith(perm: Permission) {
  const all = db.users.filter((u) => u.status === "ACTIVE");
  return all.filter((u) => effectivePermissions(u.role, u.permissions).has(perm));
}
