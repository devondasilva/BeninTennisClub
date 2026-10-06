// Test de fumée sans navigateur, contre un serveur lancé (npm run dev ou npm start)
// Usage : npm run test:smoke   (ou BASE_URL=http://localhost:3001 npm run test:smoke)
import { existsSync, readFileSync } from "fs";
// Même secret que le serveur (lu dans .env s'il existe)
if (!process.env.JWT_SECRET && existsSync(".env")) {
  const m = readFileSync(".env", "utf8").match(/^JWT_SECRET\s*=\s*"?([^"\r\n]+)"?/m);
  if (m) process.env.JWT_SECRET = m[1];
}
const B = process.env.BASE_URL || "http://localhost:3000";
let failed = 0;
const ok = (cond, label) => { console.log(`${cond ? "✓" : "✗"} ${label}`); if (!cond) failed++; };
const get = (path, init = {}) => fetch(B + path, { redirect: "manual", ...init });

const health = await (await get("/api/health")).json().catch(() => ({}));
ok(health.status === "ok", `santé : ${health.status ?? "injoignable"} (${health.database?.counts?.users ?? "?"} membres)`);
for (const p of ["/", "/coachs", "/evenements", "/club", "/tarifs", "/partenaires", "/contact", "/login", "/register"]) {
  ok((await get(p)).status === 200, `page publique ${p}`);
}
ok([307, 308].includes((await get("/dashboard")).status), "espace membre protégé sans connexion");

const login = await get("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@btc.bj", password: "demo1234" }) });
ok(login.status === 200, "connexion administrateur");
const cookie = (login.headers.get("set-cookie") || "").split(";")[0];
for (const p of ["/dashboard", "/dashboard/reservations", "/dashboard/shop", "/dashboard/admin", "/dashboard/members", "/dashboard/partners", "/dashboard/settings"]) {
  ok((await get(p, { headers: { cookie } })).status === 200, `espace membre ${p}`);
}
ok((await get("/login", { headers: { cookie } })).status === 307, "connecté : /login renvoie vers l'espace membre");

// Cookie signé mais compte inexistant (ex. base réinitialisée) : jamais de boucle
// Jeton au même format que src/lib/jwt.ts (HMAC-SHA256, Web Crypto)
const b64 = (bytes) => Buffer.from(bytes).toString("base64url");
const body = b64(new TextEncoder().encode(JSON.stringify({ userId: "inexistant", email: "x@x", role: "ADMIN", firstName: "X", lastName: "X", exp: Date.now() + 3600e3 })));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-btc-change-me"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
const ghost = `${body}.${b64(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))))}`;
const g1 = await get("/dashboard", { headers: { cookie: `btc_token=${ghost}` } });
ok(g1.status === 307 && g1.headers.get("location")?.includes("/api/auth/logout"), "cookie périmé : nettoyage demandé");
const g2 = await get("/api/auth/logout?motif=expire", { headers: { cookie: `btc_token=${ghost}` } });
ok(g2.status === 303 && /btc_token=;/.test(g2.headers.get("set-cookie") || ""), "cookie périmé : effacé");
ok((await get("/login", { headers: { cookie: `btc_token=${ghost}` } })).status === 200, "cookie périmé : /login s'affiche (pas de boucle)");

console.log(failed ? `\n${failed} échec(s)` : "\nTout est bon ✅");
process.exit(failed ? 1 : 0);
