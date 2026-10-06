import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/safe-redirect";
import { createRateLimiter } from "@/lib/rate-limit";

describe("safeNext", () => {
  it("accepte un chemin interne", () => expect(safeNext("/dashboard/shop")).toBe("/dashboard/shop"));
  it("refuse un site externe", () => {
    expect(safeNext("https://evil.example")).toBe("/dashboard");
    expect(safeNext("//evil.example")).toBe("/dashboard");
    expect(safeNext("/\\evil.example")).toBe("/dashboard");
  });
  it("valeur par défaut", () => expect(safeNext(null)).toBe("/dashboard"));
});

describe("limiteur de tentatives", () => {
  it("bloque au-delà du maximum puis se libère", () => {
    const l = createRateLimiter({ max: 3, windowMs: 1000 });
    expect([l.check("a", 0), l.check("a", 1), l.check("a", 2)]).toEqual([0, 0, 0]);
    expect(l.check("a", 3)).toBeGreaterThan(0);
    expect(l.check("b", 3)).toBe(0);
    expect(l.check("a", 1500)).toBe(0);
  });
  it("reset efface le compteur", () => {
    const l = createRateLimiter({ max: 1, windowMs: 1000 });
    l.check("x", 0);
    l.reset("x");
    expect(l.check("x", 1)).toBe(0);
  });
});
