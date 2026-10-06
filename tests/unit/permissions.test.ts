import { describe, expect, it } from "vitest";
import { ALL_PERMISSIONS, effectivePermissions, ROLE_PRESETS } from "@/lib/permissions";

describe("permissions", () => {
  it("l'administrateur a tout, y compris la gestion des accès", () => {
    const p = effectivePermissions("ADMIN", "");
    for (const k of ALL_PERMISSIONS) expect(p.has(k)).toBe(true);
    expect(p.has("access.manage")).toBe(true);
  });
  it("le gérant n'a pas la gestion des accès", () => {
    expect(effectivePermissions("MANAGER", "").has("access.manage")).toBe(false);
  });
  it("un adhérent reçoit uniquement les accès précis accordés", () => {
    const p = effectivePermissions("CLIENT", "shop.manage, orders.manage");
    expect([...p].sort()).toEqual(["orders.manage", "shop.manage"]);
  });
  it("un accès inconnu ou « access.manage » ne peut pas être accordé à la main", () => {
    const p = effectivePermissions("CLIENT", "access.manage,hack.all");
    expect(p.size).toBe(0);
  });
  it("chaque rôle a un préréglage", () => {
    for (const r of ["ADMIN", "MANAGER", "STAFF", "COACH", "PARENT", "CLIENT", "SPONSOR"]) expect(ROLE_PRESETS[r]).toBeDefined();
  });
});
