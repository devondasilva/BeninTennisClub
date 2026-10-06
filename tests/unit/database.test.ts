import { afterAll, describe, expect, it } from "vitest";
import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// Base isolée dans un dossier temporaire, remplie par le script de démo
const dir = mkdtempSync(join(tmpdir(), "btc-test-"));
process.env.DATA_DIR = dir;
execFileSync(process.execPath, ["scripts/seed.mjs"], { env: { ...process.env, DATA_DIR: dir }, stdio: "ignore" });

const { db, dbInfo } = await import("@/db");
const { withReservationRefs, sortBy, deleteUserCascade } = await import("@/db/relations");
const { verifyPassword } = await import("@/lib/password");

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("base de données JSON (un fichier par collection)", () => {
  it("le script de démo crée un fichier par collection", () => {
    for (const f of ["users", "reservations", "coaches", "products", "partners", "settings"]) expect(existsSync(join(dir, `${f}.json`))).toBe(true);
    expect(dbInfo().counts.users).toBeGreaterThan(5);
  });
  it("comptes de démonstration et mot de passe haché (scrypt)", () => {
    const admin = db.users.find((u) => u.email === "admin@btc.bj");
    expect(admin?.role).toBe("ADMIN");
    expect(admin && verifyPassword("demo1234", admin.password)).toBe(true);
    expect(admin && verifyPassword("mauvais", admin.password)).toBe(false);
  });
  it("les dates sont relues comme des objets Date", () => {
    const r = db.reservations.all()[0];
    expect(r.startTime).toBeInstanceOf(Date);
    expect(r.endTime.getTime()).toBeGreaterThan(r.startTime.getTime());
  });
  it("insertion avec valeurs par défaut, puis enregistrement dans le fichier", () => {
    const n = db.notifications.insert({ userId: "u1", type: "TEST", title: "Essai", message: "Bonjour" });
    expect(n.id).toBeTruthy();
    expect(n.read).toBe(false);
    expect(n.createdAt).toBeInstanceOf(Date);
    const saved = JSON.parse(readFileSync(join(dir, "notifications.json"), "utf8"));
    expect(saved.some((x: { id: string }) => x.id === n.id)).toBe(true);
  });
  it("modification : les champs undefined ne suppriment pas la valeur", () => {
    const u = db.users.find((x) => x.email === "client@btc.bj")!;
    db.users.update(u.id, { firstName: "Testé", phone: undefined });
    const after = db.users.get(u.id)!;
    expect(after.firstName).toBe("Testé");
    expect(after.phone).toBe(u.phone);
  });
  it("les résultats sont des copies (modifier un objet ne modifie pas la base)", () => {
    const c = db.courts.all()[0];
    c.name = "Piraté";
    expect(db.courts.get(c.id)?.name).not.toBe("Piraté");
  });
  it("relit le fichier s'il est modifié à la main", () => {
    const file = join(dir, "courts.json");
    const rows = JSON.parse(readFileSync(file, "utf8"));
    rows[0].name = "Court central";
    writeFileSync(file, JSON.stringify(rows, null, 2) + "\n ");
    expect(db.courts.get(rows[0].id)?.name).toBe("Court central");
  });
  it("jointures et tri", () => {
    const list = withReservationRefs(sortBy(db.reservations.all(), "startTime", "desc").slice(0, 3));
    expect(list[0].court.name).toBeTypeOf("string");
    expect(list[0].startTime.getTime()).toBeGreaterThanOrEqual(list[1].startTime.getTime());
  });
  it("suppression d'un membre avec ses données liées", () => {
    const m = db.users.find((u) => u.email === "aicha.zinsou@mail.bj")!;
    expect(db.reservations.count((r) => r.userId === m.id) + db.transactions.count((t) => t.userId === m.id)).toBeGreaterThan(0);
    deleteUserCascade(m.id);
    expect(db.users.get(m.id)).toBeUndefined();
    expect(db.reservations.count((r) => r.userId === m.id)).toBe(0);
    expect(db.transactions.count((t) => t.userId === m.id)).toBe(0);
  });
});
