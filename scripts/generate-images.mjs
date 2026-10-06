// Génère toutes les illustrations SVG de l'application dans public/images
// Usage : npm run images
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "images");
for (const d of ["products", "courts", "events", "coaches", "campaigns", "partners"]) {
  mkdirSync(join(OUT, d), { recursive: true });
}
const save = (p, svg) => writeFileSync(join(OUT, p), svg.trim() + "\n");

const NAVY = "#1e3a5f";
const LIME = "#c8d965";

// ---------- éléments réutilisables ----------
let uid = 0;
const id = (p) => `${p}${++uid}`;

function ball(cx, cy, r) {
  const g = id("bg");
  return `
  <defs><radialGradient id="${g}" cx="35%" cy="30%" r="75%">
    <stop offset="0" stop-color="#f4ff8a"/><stop offset=".6" stop-color="#d4e83a"/><stop offset="1" stop-color="#9fb21c"/>
  </radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>
  <path d="M${cx - r * 0.92} ${cy - r * 0.35} C ${cx - r * 0.35} ${cy - r * 0.1}, ${cx - r * 0.35} ${cy + r * 0.6}, ${cx - r * 0.55} ${cy + r * 0.82}"
        fill="none" stroke="#fff" stroke-width="${r * 0.09}" stroke-linecap="round" opacity=".95"/>
  <path d="M${cx + r * 0.92} ${cy + r * 0.35} C ${cx + r * 0.35} ${cy + r * 0.1}, ${cx + r * 0.35} ${cy - r * 0.6}, ${cx + r * 0.55} ${cy - r * 0.82}"
        fill="none" stroke="#fff" stroke-width="${r * 0.09}" stroke-linecap="round" opacity=".95"/>`;
}

function productFrame(inner, bgA = "#f6f8fb", bgB = "#e3e9f1") {
  const g = id("pf");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient></defs>
  <rect width="400" height="400" fill="url(#${g})"/>
  <circle cx="330" cy="70" r="90" fill="#fff" opacity=".45"/>
  <ellipse cx="200" cy="350" rx="120" ry="14" fill="${NAVY}" opacity=".12"/>
  ${inner}
</svg>`;
}

function racket(frame, grip, accent) {
  const clip = id("rc");
  let strings = "";
  for (let x = 120; x <= 280; x += 11) strings += `<line x1="${x}" y1="40" x2="${x}" y2="260" />`;
  for (let y = 50; y <= 250; y += 11) strings += `<line x1="100" y1="${y}" x2="300" y2="${y}" />`;
  return productFrame(`
  <g transform="rotate(-32 200 200)">
    <defs><clipPath id="${clip}"><ellipse cx="200" cy="140" rx="70" ry="94"/></clipPath></defs>
    <g clip-path="url(#${clip})" stroke="#f8fafc" stroke-width="2" opacity=".95">${strings}</g>
    <ellipse cx="200" cy="140" rx="74" ry="98" fill="none" stroke="${frame}" stroke-width="13"/>
    <path d="M165 222 L190 290 L210 290 L235 222" fill="none" stroke="${frame}" stroke-width="12" stroke-linejoin="round"/>
    <path d="M168 232 Q200 250 232 232" fill="none" stroke="${accent}" stroke-width="6"/>
    <rect x="186" y="286" width="28" height="104" rx="8" fill="${grip}"/>
    ${[300, 316, 332, 348, 364].map((y) => `<line x1="186" y1="${y}" x2="214" y2="${y + 10}" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`).join("")}
    <rect x="183" y="380" width="34" height="14" rx="5" fill="${frame}"/>
    <rect x="128" y="120" width="10" height="40" rx="4" fill="${accent}"/>
    <rect x="262" y="120" width="10" height="40" rx="4" fill="${accent}"/>
  </g>`);
}

function tube() {
  return productFrame(`
  <g transform="rotate(-8 200 200)">
    <rect x="140" y="60" width="120" height="290" rx="56" fill="#dbeafe" opacity=".55" stroke="#94a3b8" stroke-width="3"/>
    ${ball(200, 125, 52)}${ball(200, 215, 52)}${ball(200, 305, 52)}
    <rect x="132" y="46" width="136" height="34" rx="12" fill="${NAVY}"/>
    <rect x="140" y="160" width="120" height="70" fill="${NAVY}" opacity=".85"/>
    <text x="200" y="202" font-family="Arial" font-size="22" font-weight="700" fill="${LIME}" text-anchor="middle">BTC PRO</text>
  </g>`);
}

function basket() {
  let balls = "";
  const pos = [[150, 150], [200, 140], [250, 150], [125, 180], [175, 175], [225, 172], [275, 182], [150, 200], [200, 198], [250, 202]];
  for (const [x, y] of pos) balls += ball(x, y, 30);
  let wires = "";
  for (let x = 110; x <= 290; x += 22) wires += `<line x1="${x}" y1="200" x2="${x + (200 - x) * 0.18}" y2="340" />`;
  for (let y = 220; y <= 330; y += 22) {
    const k = (y - 200) / 140;
    wires += `<line x1="${100 + 18 * k * 1.3}" y1="${y}" x2="${300 - 18 * k * 1.3}" y2="${y}" />`;
  }
  return productFrame(`
  ${balls}
  <path d="M95 200 L305 200 L280 345 L120 345 Z" fill="#334155" opacity=".15"/>
  <g stroke="#475569" stroke-width="4">${wires}</g>
  <rect x="90" y="194" width="220" height="12" rx="6" fill="#334155"/>
  <path d="M110 200 Q200 60 290 200" fill="none" stroke="#334155" stroke-width="8"/>`);
}

function polo(color, collar) {
  return productFrame(`
  <path d="M140 70 L110 82 L55 140 L92 188 L125 160 L125 340 L275 340 L275 160 L308 188 L345 140 L290 82 L260 70
           Q240 100 200 100 Q160 100 140 70 Z" fill="${color}"/>
  <path d="M140 70 Q160 100 200 100 Q240 100 260 70 L245 64 Q225 88 200 88 Q175 88 155 64 Z" fill="${collar}"/>
  <path d="M188 98 L188 150 L212 150 L212 98" fill="none" stroke="${collar}" stroke-width="5"/>
  <circle cx="200" cy="116" r="3.5" fill="#fff"/><circle cx="200" cy="134" r="3.5" fill="#fff"/>
  <path d="M110 82 L55 140 L92 188 L125 160" fill="#000" opacity=".06"/>
  <circle cx="242" cy="140" r="12" fill="${LIME}"/>
  <path d="M234 140 Q242 132 250 140 Q242 148 234 140" fill="none" stroke="${NAVY}" stroke-width="2"/>`);
}

function skirt() {
  return productFrame(`
  <rect x="120" y="80" width="160" height="34" rx="8" fill="${NAVY}"/>
  <path d="M122 112 L278 112 L320 320 L80 320 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
  ${[110, 140, 170, 200, 230, 260, 290].map((x, i) => `<line x1="${150 + i * 16.6}" y1="114" x2="${x}" y2="318" stroke="#cbd5e1" stroke-width="3"/>`).join("")}
  <path d="M80 300 L320 300 L320 320 L80 320 Z" fill="${LIME}"/>`);
}

function cap() {
  return productFrame(`
  <path d="M100 230 Q100 110 200 105 Q300 110 300 230 Z" fill="${NAVY}"/>
  <path d="M200 105 L200 230" stroke="#000" stroke-opacity=".2" stroke-width="3"/>
  <path d="M150 115 Q140 170 145 230" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
  <path d="M250 115 Q260 170 255 230" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
  <circle cx="200" cy="106" r="9" fill="${LIME}"/>
  <path d="M95 228 Q200 250 305 228 Q350 236 360 262 Q240 300 100 262 Z" fill="#14294a"/>
  <circle cx="200" cy="175" r="26" fill="${LIME}"/>
  <text x="200" y="183" font-family="Arial" font-size="20" font-weight="800" fill="${NAVY}" text-anchor="middle">BTC</text>`);
}

function shoes() {
  return productFrame(`
  <path d="M60 270 Q60 210 110 200 L170 170 Q190 150 215 165 L250 200 Q300 215 340 232 Q365 245 360 275 L60 275 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
  <path d="M170 170 Q190 150 215 165 L250 200 L190 215 Z" fill="${NAVY}"/>
  <path d="M110 230 Q200 205 300 232" fill="none" stroke="${LIME}" stroke-width="12" stroke-linecap="round"/>
  ${[0, 1, 2, 3].map((i) => `<line x1="${185 + i * 14}" y1="${175 + i * 8}" x2="${205 + i * 14}" y2="${170 + i * 8}" stroke="#fff" stroke-width="4"/>`).join("")}
  <path d="M52 275 L368 275 Q368 300 340 300 L80 300 Q52 300 52 275 Z" fill="${NAVY}"/>
  <path d="M52 286 L368 286" stroke="${LIME}" stroke-width="4"/>`);
}

function bag() {
  return productFrame(`
  <path d="M120 120 Q200 30 280 120" fill="none" stroke="#14294a" stroke-width="12"/>
  <rect x="60" y="130" width="280" height="190" rx="70" fill="${NAVY}"/>
  <rect x="60" y="130" width="280" height="80" rx="40" fill="#24497a"/>
  <path d="M90 175 Q200 160 310 175" fill="none" stroke="${LIME}" stroke-width="5" stroke-dasharray="10 6"/>
  <rect x="150" y="235" width="100" height="44" rx="10" fill="${LIME}"/>
  <text x="200" y="265" font-family="Arial" font-size="20" font-weight="800" fill="${NAVY}" text-anchor="middle">BTC</text>
  <circle cx="314" cy="175" r="8" fill="#e2e8f0"/>`);
}

function grips() {
  const roll = (x, color) => `
    <rect x="${x}" y="110" width="70" height="200" rx="14" fill="${color}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="${x}" y1="${125 + i * 28}" x2="${x + 70}" y2="${140 + i * 28}" stroke="#000" stroke-opacity=".12" stroke-width="5"/>`).join("")}
    <ellipse cx="${x + 35}" cy="110" rx="35" ry="10" fill="#fff" opacity=".6"/>`;
  return productFrame(`${roll(90, "#f8fafc")}${roll(165, LIME)}${roll(240, "#38bdf8")}
    <rect x="80" y="230" width="240" height="46" rx="8" fill="${NAVY}"/>
    <text x="200" y="260" font-family="Arial" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">OVERGRIP × 3</text>`);
}

function strings() {
  let rings = "";
  for (let r = 60; r <= 120; r += 6) rings += `<circle cx="200" cy="190" r="${r}" fill="none" stroke="${r % 12 ? "#f59e0b" : "#fbbf24"}" stroke-width="4"/>`;
  return productFrame(`${rings}
    <rect x="120" y="270" width="160" height="70" rx="10" fill="${NAVY}"/>
    <text x="200" y="300" font-family="Arial" font-size="17" font-weight="700" fill="${LIME}" text-anchor="middle">POLY TOUR</text>
    <text x="200" y="324" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle">1.25 mm · 12 m</text>`);
}

// ---------- produits ----------
save("products/racket-pro.svg", racket(NAVY, "#f8fafc", LIME));
save("products/racket-power.svg", racket("#dc2626", "#111827", "#fbbf24"));
save("products/racket-junior.svg", racket("#84cc16", "#1e3a5f", "#38bdf8"));
save("products/balls-tube.svg", tube());
save("products/balls-basket.svg", basket());
save("products/polo.svg", polo(NAVY, LIME));
save("products/polo-white.svg", polo("#f8fafc", NAVY));
save("products/skirt.svg", skirt());
save("products/cap.svg", cap());
save("products/shoes.svg", shoes());
save("products/bag.svg", bag());
save("products/grips.svg", grips());
save("products/strings.svg", strings());

// ---------- terrains (vue de dessus) ----------
function court(surface, outer, name) {
  const s = 34, L = 23.77 * s, W = 10.97 * s, cx = 600, cy = 350;
  const x0 = cx - L / 2, y0 = cy - W / 2, single = 1.37 * s, svc = 6.4 * s;
  const tree = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#166534"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.55}" fill="#22c55e" opacity=".6"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">
  <rect width="1200" height="700" fill="#4d7c0f"/>
  <rect x="70" y="60" width="1060" height="580" rx="8" fill="${outer}"/>
  <rect x="70" y="60" width="1060" height="580" rx="8" fill="none" stroke="#1f2937" stroke-width="6" stroke-dasharray="2 10"/>
  <rect x="${x0}" y="${y0}" width="${L}" height="${W}" fill="${surface}"/>
  <g fill="none" stroke="#fff" stroke-width="5">
    <rect x="${x0}" y="${y0}" width="${L}" height="${W}"/>
    <line x1="${x0}" y1="${y0 + single}" x2="${x0 + L}" y2="${y0 + single}"/>
    <line x1="${x0}" y1="${y0 + W - single}" x2="${x0 + L}" y2="${y0 + W - single}"/>
    <line x1="${cx - svc}" y1="${y0 + single}" x2="${cx - svc}" y2="${y0 + W - single}"/>
    <line x1="${cx + svc}" y1="${y0 + single}" x2="${cx + svc}" y2="${y0 + W - single}"/>
    <line x1="${cx - svc}" y1="${cy}" x2="${cx + svc}" y2="${cy}"/>
    <line x1="${x0}" y1="${cy}" x2="${x0 + 12}" y2="${cy}"/>
    <line x1="${x0 + L - 12}" y1="${cy}" x2="${x0 + L}" y2="${cy}"/>
  </g>
  <line x1="${cx}" y1="${y0 - 30}" x2="${cx}" y2="${y0 + W + 30}" stroke="#111827" stroke-width="7"/>
  <line x1="${cx}" y1="${y0 - 30}" x2="${cx}" y2="${y0 + W + 30}" stroke="#f8fafc" stroke-width="2" stroke-dasharray="4 4"/>
  <circle cx="${cx}" cy="${y0 - 30}" r="8" fill="#111827"/><circle cx="${cx}" cy="${y0 + W + 30}" r="8" fill="#111827"/>
  ${[[100, 90], [1100, 90], [100, 610], [1100, 610]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#e5e7eb" stroke="#374151" stroke-width="4"/>`).join("")}
  ${ball(cx - 170, cy - 60, 9)}${ball(cx + 240, cy + 90, 9)}
  ${tree(30, 40, 34)}${tree(1170, 60, 40)}${tree(25, 660, 36)}${tree(1175, 650, 30)}${tree(600, 22, 22)}
  <rect x="${cx - 70}" y="642" width="140" height="44" rx="10" fill="${NAVY}"/>
  <text x="${cx}" y="672" font-family="Arial" font-size="24" font-weight="700" fill="${LIME}" text-anchor="middle">${name}</text>
</svg>`;
}
save("courts/court-1.svg", court("#2563eb", "#1e40af", "COURT 1"));
save("courts/court-2.svg", court("#15803d", "#14532d", "COURT 2"));
save("courts/court-3.svg", court("#d9733f", "#b45309", "COURT 3"));

// ---------- bannière d'accueil (terrain en perspective au coucher du soleil) ----------
function hero() {
  const cxs = 800, horizon = 380, f = 1050, h = 4.2, d = 7.5;
  const P = (X, Z) => [cxs + (f * 0.8 * X) / (Z + d), horizon + (f * h) / (Z + d)];
  const pt = (X, Z) => P(X, Z).map((v) => v.toFixed(1)).join(" ");
  const line = (X1, Z1, X2, Z2, w = 4) => `<line x1="${P(X1, Z1)[0]}" y1="${P(X1, Z1)[1]}" x2="${P(X2, Z2)[0]}" y2="${P(X2, Z2)[1]}" stroke="#fff" stroke-width="${w}"/>`;
  const Wd = 5.485, Ws = 4.115, Lz = 23.77, net = 11.885;
  const ext = 3.5;
  const netTop = (X) => [P(X, net)[0], horizon + (f * (h - 0.95)) / (net + d)];
  const palm = (x, y, s) => `
    <path d="M${x} ${y} Q${x + 10 * s} ${y - 120 * s} ${x - 6 * s} ${y - 240 * s}" stroke="#0b1625" stroke-width="${10 * s}" fill="none"/>
    ${[-70, -30, 10, 50, 100, 150, 200].map((a) => {
      const r = (a * Math.PI) / 180, ex = x - 6 * s + Math.cos(r) * 110 * s, ey = y - 240 * s + Math.sin(r) * 60 * s + 20 * s;
      return `<path d="M${x - 6 * s} ${y - 240 * s} Q${(x - 6 * s + ex) / 2} ${y - 290 * s} ${ex} ${ey}" stroke="#0b1625" stroke-width="${12 * s}" fill="none" stroke-linecap="round"/>`;
    }).join("")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0f2340"/><stop offset=".45" stop-color="#2f5b8c"/>
      <stop offset=".78" stop-color="#e9a86a"/><stop offset="1" stop-color="#f6cf8e"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#14532d"/><stop offset="1" stop-color="#052e16"/></linearGradient>
    <linearGradient id="surf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b5f9c"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient>
    <radialGradient id="sun"><stop offset="0" stop-color="#fff7d1"/><stop offset=".5" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <circle cx="1150" cy="360" r="170" fill="url(#sun)"/>
  <circle cx="1150" cy="360" r="62" fill="#fff3c4"/>
  <path d="M0 380 Q200 340 420 372 T900 360 T1600 368 L1600 400 L0 400 Z" fill="#1b3a2a" opacity=".85"/>
  <rect y="380" width="1600" height="520" fill="url(#ground)"/>
  <polygon points="${pt(-Wd - ext, -2)} ${pt(Wd + ext, -2)} ${pt(Wd + ext, Lz + 5)} ${pt(-Wd - ext, Lz + 5)}" fill="#1e3a5f"/>
  <polygon points="${pt(-Wd, 0)} ${pt(Wd, 0)} ${pt(Wd, Lz)} ${pt(-Wd, Lz)}" fill="url(#surf)"/>
  ${line(-Wd, 0, Wd, 0, 6)}${line(-Wd, Lz, Wd, Lz, 2)}${line(-Wd, 0, -Wd, Lz, 5)}${line(Wd, 0, Wd, Lz, 5)}
  ${line(-Ws, 0, -Ws, Lz, 4)}${line(Ws, 0, Ws, Lz, 4)}
  ${line(-Ws, net - 6.4, Ws, net - 6.4, 4)}${line(-Ws, net + 6.4, Ws, net + 6.4, 3)}
  ${line(0, net - 6.4, 0, net + 6.4, 3)}${line(0, 0, 0, 0.3, 6)}
  <polygon points="${P(-Wd - 0.9, net).join(" ")} ${P(Wd + 0.9, net).join(" ")} ${netTop(Wd + 0.9).join(" ")} ${netTop(-Wd - 0.9).join(" ")}" fill="#0b1625" opacity=".55"/>
  <line x1="${netTop(-Wd - 0.9)[0]}" y1="${netTop(-Wd - 0.9)[1]}" x2="${netTop(Wd + 0.9)[0]}" y2="${netTop(Wd + 0.9)[1]}" stroke="#fff" stroke-width="5"/>
  <line x1="${P(-Wd - 0.9, net)[0]}" y1="${P(-Wd - 0.9, net)[1]}" x2="${netTop(-Wd - 0.9)[0]}" y2="${netTop(-Wd - 0.9)[1]}" stroke="#e5e7eb" stroke-width="6"/>
  <line x1="${P(Wd + 0.9, net)[0]}" y1="${P(Wd + 0.9, net)[1]}" x2="${netTop(Wd + 0.9)[0]}" y2="${netTop(Wd + 0.9)[1]}" stroke="#e5e7eb" stroke-width="6"/>
  ${ball(...P(1.8, 4.5), 16)}${ball(...P(-2.6, 2), 22)}
  ${palm(110, 520, 1.25)}${palm(260, 470, 0.9)}${palm(1430, 500, 1.15)}${palm(1540, 540, 1.3)}
  ${[[380, 300], [1250, 300]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="140" fill="#0b1625"/><rect x="${x - 22}" y="${y - 14}" width="52" height="20" rx="4" fill="#0b1625"/><rect x="${x - 18}" y="${y - 10}" width="44" height="8" fill="#fff7d1"/>`).join("")}
</svg>`;
}

// ---------- bannières d'événements & de collectes ----------
function banner(colors, inner) {
  const g = id("bn");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs>
  <rect width="1200" height="600" fill="url(#${g})"/>
  <g opacity=".12" stroke="#fff" stroke-width="6" fill="none">
    <rect x="80" y="120" width="1040" height="420"/><line x1="600" y1="120" x2="600" y2="540"/>
    <line x1="80" y1="330" x2="1120" y2="330"/><line x1="330" y1="160" x2="330" y2="500"/><line x1="870" y1="160" x2="870" y2="500"/>
  </g>
  ${inner}
</svg>`;
}

const trophy = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-110 -150 L110 -150 Q110 20 0 40 Q-110 20 -110 -150 Z" fill="#fbbf24"/>
    <path d="M-110 -120 Q-190 -120 -180 -50 Q-170 10 -90 0" fill="none" stroke="#fbbf24" stroke-width="22"/>
    <path d="M110 -120 Q190 -120 180 -50 Q170 10 90 0" fill="none" stroke="#fbbf24" stroke-width="22"/>
    <path d="M-60 -140 Q-70 -40 -20 20" fill="none" stroke="#fff" stroke-width="12" opacity=".5" stroke-linecap="round"/>
    <rect x="-22" y="35" width="44" height="70" fill="#f59e0b"/>
    <rect x="-80" y="100" width="160" height="34" rx="6" fill="#f59e0b"/>
    <rect x="-100" y="130" width="200" height="40" rx="8" fill="#1f2937"/>
  </g>`;

const confetti = (n, seed) => {
  let s = "", r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const cols = ["#fbbf24", LIME, "#f472b6", "#38bdf8", "#fff"];
  for (let i = 0; i < n; i++) {
    s += `<rect x="${rnd() * 1200}" y="${rnd() * 600}" width="${8 + rnd() * 10}" height="${14 + rnd() * 12}" fill="${cols[i % cols.length]}" transform="rotate(${rnd() * 360} ${rnd() * 1200} ${rnd() * 600})" opacity=".85"/>`;
  }
  return s;
};

const cone = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-40 60 L0 -70 L40 60 Z" fill="#f97316"/><path d="M-28 20 L28 20 L22 0 L-22 0 Z" fill="#fff"/>
  <rect x="-60" y="56" width="120" height="16" rx="5" fill="#ea580c"/></g>`;

const smallRacket = (x, y, rot, color, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <ellipse cx="0" cy="-90" rx="60" ry="78" fill="#ffffff22" stroke="${color}" stroke-width="12"/>
  ${[-40, -20, 0, 20, 40].map((v) => `<line x1="${v}" y1="-160" x2="${v}" y2="-20" stroke="#fff" stroke-width="2" opacity=".6"/>`).join("")}
  ${[-140, -115, -90, -65, -40].map((v) => `<line x1="-55" y1="${v}" x2="55" y2="${v}" stroke="#fff" stroke-width="2" opacity=".6"/>`).join("")}
  <rect x="-12" y="-14" width="24" height="110" rx="8" fill="#111827"/></g>`;

const kid = (x, y, shirt, skin, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <circle cx="0" cy="-120" r="34" fill="${skin}"/>
  <path d="M-34 -128 Q0 -175 34 -128 Q20 -150 0 -150 Q-20 -150 -34 -128" fill="#111827"/>
  <path d="M-45 -80 Q0 -95 45 -80 L50 10 L-50 10 Z" fill="${shirt}"/>
  <rect x="-40" y="10" width="34" height="80" rx="10" fill="${NAVY}"/><rect x="6" y="10" width="34" height="80" rx="10" fill="${NAVY}"/>
  <path d="M45 -75 L95 -130" stroke="${skin}" stroke-width="18" stroke-linecap="round"/>
  <path d="M-45 -75 L-80 -20" stroke="${skin}" stroke-width="18" stroke-linecap="round"/></g>`;

const floodlight = (x, s = 1) => `<g transform="translate(${x} 600) scale(${s})">
  <polygon points="-180,-560 180,-560 30,-470 -30,-470" fill="#fff7d1" opacity=".18"/>
  <rect x="-8" y="-480" width="16" height="480" fill="#0b1625"/>
  <rect x="-70" y="-520" width="140" height="50" rx="6" fill="#0b1625"/>
  ${[-50, -17, 16, 49].map((v) => `<rect x="${v - 12}" y="-512" width="24" height="34" rx="3" fill="#fff7d1"/>`).join("")}</g>`;

const lights = () => {
  let s = `<path d="M0 90 Q300 190 600 100 T1200 110" fill="none" stroke="#0b1625" stroke-width="3"/>`;
  for (let i = 0; i < 16; i++) {
    const t = i / 15, x = t * 1200, y = 100 + Math.sin(t * Math.PI * 2) * 40 + 20;
    s += `<circle cx="${x}" cy="${y + 18}" r="12" fill="${["#fbbf24", LIME, "#f472b6", "#38bdf8"][i % 4]}"/><circle cx="${x}" cy="${y + 18}" r="26" fill="#fff7d1" opacity=".15"/>`;
  }
  return s;
};

save("events/tournament.svg", banner(["#0f2340", "#1e3a5f"], `${confetti(70, 7)}${trophy(600, 330, 1.25)}${ball(330, 470, 40)}${ball(880, 450, 30)}`));
save("events/night-tournament.svg", banner(["#020617", "#1e293b"], `${floodlight(200, 1)}${floodlight(1000, 1)}${trophy(600, 360, 1)}${ball(800, 480, 30)}`));
save("events/stage.svg", banner(["#365314", "#84cc16"], `${cone(250, 400, 1.3)}${cone(450, 450, 1)}${cone(760, 430, 1.1)}${smallRacket(950, 420, 25, NAVY, 1.4)}${ball(600, 460, 34)}${ball(380, 330, 26)}${ball(1080, 300, 24)}`));
save("events/school.svg", banner(["#0369a1", "#38bdf8"], `${kid(330, 440, LIME, "#7c4a2d", 1.3)}${kid(620, 450, "#f472b6", "#5b3420", 1.2)}${kid(900, 440, "#fbbf24", "#8d5a3b", 1.3)}${ball(470, 220, 26)}${ball(780, 200, 22)}${confetti(25, 3)}`));
save("events/gathering.svg", banner(["#7c2d12", "#f59e0b"], `${lights()}
  ${[380, 600, 820].map((x, i) => `<g transform="translate(${x} 420)"><path d="M-50 -110 L50 -110 L35 70 L-35 70 Z" fill="#fff" opacity=".35"/><path d="M-44 -50 L44 -50 L35 70 L-35 70 Z" fill="${["#fbbf24", LIME, "#f472b6"][i]}"/><rect x="-55" y="70" width="110" height="14" rx="6" fill="#fff" opacity=".6"/></g>`).join("")}
  ${ball(200, 470, 34)}${ball(1010, 480, 34)}`));

save("campaigns/floodlights.svg", banner(["#020617", "#1e3a5f"], `${floodlight(220, 1.1)}${floodlight(600, 1.2)}${floodlight(980, 1.1)}`));
save("campaigns/equipment.svg", banner(["#1e3a5f", "#2f5b8c"], `${smallRacket(420, 470, -25, LIME, 1.5)}${smallRacket(600, 470, 0, "#fff", 1.5)}${smallRacket(780, 470, 25, "#fbbf24", 1.5)}${ball(300, 500, 34)}${ball(900, 500, 34)}`));
save("campaigns/youth.svg", banner(["#166534", "#4ade80"], `${kid(380, 450, "#fff", "#6b3f25", 1.3)}${kid(820, 450, LIME, "#4a2a18", 1.3)}${ball(600, 260, 40)}${cone(600, 470, 1)}`));
save("campaigns/tournament.svg", banner(["#7c2d12", "#ea580c"], `${confetti(60, 11)}${trophy(600, 330, 1.2)}`));

// ---------- coachs (portraits illustrés) ----------
function coachAvatar(bg, skin, shirt, hair, extra = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bg}"/>
  <circle cx="320" cy="80" r="110" fill="#fff" opacity=".12"/>
  <path d="M70 400 Q80 285 200 275 Q320 285 330 400 Z" fill="${shirt}"/>
  <path d="M165 280 L200 330 L235 280" fill="#fff" opacity=".9"/>
  <rect x="172" y="225" width="56" height="60" rx="20" fill="${skin}"/>
  <ellipse cx="200" cy="170" rx="72" ry="84" fill="${skin}"/>
  <ellipse cx="128" cy="180" rx="12" ry="18" fill="${skin}"/><ellipse cx="272" cy="180" rx="12" ry="18" fill="${skin}"/>
  ${hair}
  <ellipse cx="172" cy="175" rx="7" ry="8" fill="#111827"/><ellipse cx="228" cy="175" rx="7" ry="8" fill="#111827"/>
  <path d="M160 156 Q172 148 184 156" stroke="#111827" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M216 156 Q228 148 240 156" stroke="#111827" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M196 182 Q190 205 200 208" stroke="#000" stroke-opacity=".25" stroke-width="4" fill="none"/>
  <path d="M172 222 Q200 244 228 222" stroke="#5b1d1d" stroke-width="6" fill="none" stroke-linecap="round"/>
  ${extra}
  <circle cx="290" cy="340" r="26" fill="${LIME}"/>
  <path d="M272 330 Q290 345 308 330 M272 350 Q290 335 308 350" stroke="${NAVY}" stroke-width="3" fill="none"/>
</svg>`;
}
save("coaches/coach-1.svg", coachAvatar(NAVY, "#6b3f25", LIME, `<path d="M128 150 Q130 80 200 78 Q270 80 272 150 Q250 110 200 112 Q150 110 128 150 Z" fill="#111827"/>`));
save("coaches/coach-2.svg", coachAvatar("#0f766e", "#8d5a3b", "#f8fafc", `<path d="M124 170 Q110 70 200 66 Q290 70 276 170 Q270 120 200 108 Q130 120 124 170 Z" fill="#1f1308"/><circle cx="200" cy="72" r="34" fill="#1f1308"/>`));
save("coaches/coach-3.svg", coachAvatar("#9a3412", "#4a2a18", NAVY, `<path d="M132 140 Q140 92 200 90 Q260 92 268 140 Q240 116 200 116 Q160 116 132 140 Z" fill="#111827"/>`, `<path d="M150 210 Q200 270 250 210 Q240 250 200 256 Q160 250 150 210 Z" fill="#111827"/>`));
save("coaches/coach-4.svg", coachAvatar("#6d28d9", "#a26a42", "#fbbf24", `<path d="M120 200 Q100 60 200 62 Q300 60 280 200 Q282 130 250 108 Q200 130 150 108 Q118 130 120 200 Z" fill="#2b1a0e"/>`));

// ---------- partenaires (logos fictifs) ----------
function partnerLogo(name, sub, color, shape) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
  <rect width="400" height="200" rx="16" fill="#fff"/>
  <g transform="translate(70 100)">${shape(color)}</g>
  <text x="135" y="98" font-family="Arial" font-size="30" font-weight="800" fill="${color}">${name}</text>
  <text x="137" y="126" font-family="Arial" font-size="15" fill="#64748b" letter-spacing="2">${sub}</text>
</svg>`;
}
save("partners/atlantique.svg", partnerLogo("Atlantique", "ASSURANCES", "#0e7490", (c) => `<circle r="40" fill="${c}"/><path d="M-30 8 Q-15 -8 0 8 T30 8" stroke="#fff" stroke-width="7" fill="none"/>`));
save("partners/soleil.svg", partnerLogo("Soleil", "BOISSONS", "#ea580c", (c) => `<circle r="24" fill="${c}"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="-4" y="-44" width="8" height="14" rx="3" fill="${c}" transform="rotate(${a})"/>`).join("")}`));
save("partners/ouemetel.svg", partnerLogo("Ouémé Tel", "TÉLÉCOMS", "#7c3aed", (c) => `<rect x="-36" y="-36" width="72" height="72" rx="18" fill="${c}"/><path d="M-16 -10 Q0 -26 16 -10 M-8 0 Q0 -8 8 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><circle cy="12" r="6" fill="#fff"/>`));
save("partners/dodomey.svg", partnerLogo("Dodomey", "SPORT &amp; NUTRITION", "#15803d", (c) => `<path d="M0 -42 L38 30 L-38 30 Z" fill="${c}"/><circle cy="6" r="12" fill="${LIME}"/>`));

// ---------- logo ----------
save("logo.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="${NAVY}"/>
  ${ball(32, 32, 20)}
</svg>`);

console.log("✅ Images générées dans public/images");

// ---------- bannière d'accueil : 3 directions au choix ----------
// hero.svg = la direction retenue (copie de l'une des trois)

// A. « Session de nuit » : court éclairé par les projecteurs, vue plongeante
function heroNight() {
  const W = 1000, H = 900, cx = 500, horizon = -260, f = 900, h = 9, d = 4;
  const P = (X, Z) => [cx + (f * 0.95 * X) / (Z + d), horizon + (f * h) / (Z + d) * 1.0];
  const pt = (X, Z) => P(X, Z).map((v) => v.toFixed(1)).join(" ");
  const ln = (X1, Z1, X2, Z2, w = 4) => { const a = P(X1, Z1), b = P(X2, Z2); return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#fff" stroke-width="${w}" stroke-linecap="square"/>`; };
  const Wd = 5.485, Ws = 4.115, L = 23.77, net = 11.885;
  const pole = (X, Z) => { const [x, y] = P(X, Z); return `
    <ellipse cx="${x}" cy="${y}" rx="190" ry="120" fill="url(#pool)" opacity=".55"/>
    <circle cx="${x}" cy="${y}" r="9" fill="#0b1625"/><circle cx="${x}" cy="${y}" r="26" fill="url(#lamp)"/>`; };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="pool"><stop offset="0" stop-color="#e8f0ff" stop-opacity=".9"/><stop offset=".45" stop-color="#9fb8e0" stop-opacity=".25"/><stop offset="1" stop-color="#1e3a5f" stop-opacity="0"/></radialGradient>
    <radialGradient id="lamp"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#f4f8ff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="surf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f4f8f"/><stop offset="1" stop-color="#2a66b5"/></linearGradient>
    <radialGradient id="glowball"><stop offset="0" stop-color="#e9f58a" stop-opacity=".9"/><stop offset="1" stop-color="#c8d965" stop-opacity="0"/></radialGradient>
    <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8d965" stop-opacity="0"/><stop offset="1" stop-color="#c8d965" stop-opacity=".85"/></linearGradient>
    <pattern id="mesh" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0L8 8M8 0L0 8" stroke="#0b1625" stroke-width="1"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#08111f"/>
  <polygon points="${pt(-Wd - 4, -3)} ${pt(Wd + 4, -3)} ${pt(Wd + 4, L + 6)} ${pt(-Wd - 4, L + 6)}" fill="#132a49"/>
  <polygon points="${pt(-Wd, 0)} ${pt(Wd, 0)} ${pt(Wd, L)} ${pt(-Wd, L)}" fill="url(#surf)"/>
  ${pole(-Wd - 2.6, 3)}${pole(Wd + 2.6, 3)}${pole(-Wd - 2.6, L - 3)}${pole(Wd + 2.6, L - 3)}
  <g opacity=".95">
    ${ln(-Wd, 0, Wd, 0, 6)}${ln(-Wd, L, Wd, L, 3)}${ln(-Wd, 0, -Wd, L, 5)}${ln(Wd, 0, Wd, L, 5)}
    ${ln(-Ws, 0, -Ws, L, 4)}${ln(Ws, 0, Ws, L, 4)}
    ${ln(-Ws, net - 6.4, Ws, net - 6.4, 4)}${ln(-Ws, net + 6.4, Ws, net + 6.4, 3)}${ln(0, net - 6.4, 0, net + 6.4, 3)}
    ${ln(0, 0, 0, 0.35, 6)}${ln(0, L - 0.35, 0, L, 3)}
  </g>
  <polygon points="${pt(-Wd - 0.9, net)} ${pt(Wd + 0.9, net)} ${pt(Wd + 0.9, net + 1.6)} ${pt(-Wd - 0.9, net + 1.6)}" fill="#08111f" opacity=".35"/>
  <polygon points="${pt(-Wd - 0.9, net)} ${pt(Wd + 0.9, net)} ${pt(Wd + 0.9, net - 0.5)} ${pt(-Wd - 0.9, net - 0.5)}" fill="url(#mesh)" opacity=".9"/>
  ${ln(-Wd - 0.9, net - 0.5, Wd + 0.9, net - 0.5, 5)}
  ${(() => { const [x1, y1] = P(-3.2, 4.5), [x2, y2] = P(1.4, 15.5); return `
  <path d="M${x1} ${y1} Q ${(x1 + x2) / 2 + 160} ${Math.min(y1, y2) - 120} ${x2} ${y2}" fill="none" stroke="url(#trail)" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 14"/>
  <circle cx="${x2}" cy="${y2}" r="48" fill="url(#glowball)"/>${ball(x2, y2, 15)}`; })()}
  <rect width="${W}" height="${H}" fill="url(#vig)" opacity="0"/>
</svg>`;
}

// B. « Graphique » : court vu du dessus en biais, grosse balle et trajectoire
function heroGraphic() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 900" preserveAspectRatio="xMidYMid slice">
  <rect width="1000" height="900" fill="#c8d965"/>
  <g transform="translate(520 470) rotate(-28)">
    <rect x="-470" y="-215" width="940" height="430" fill="#1e3a5f"/>
    <g fill="none" stroke="#fff" stroke-width="7">
      <rect x="-410" y="-180" width="820" height="360"/>
      <line x1="-410" y1="-135" x2="410" y2="-135"/><line x1="-410" y1="135" x2="410" y2="135"/>
      <line x1="-220" y1="-135" x2="-220" y2="135"/><line x1="220" y1="-135" x2="220" y2="135"/>
      <line x1="-220" y1="0" x2="220" y2="0"/>
    </g>
    <line x1="0" y1="-215" x2="0" y2="215" stroke="#c8d965" stroke-width="10"/>
  </g>
  <path d="M120 760 C 300 300, 620 160, 760 330" fill="none" stroke="#1e3a5f" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round"/>
  <ellipse cx="770" cy="420" rx="110" ry="22" fill="#0b1625" opacity=".25"/>
  <g transform="translate(760 300)">${ball(0, 0, 105)}</g>
</svg>`;
}

// C. « Terre battue » : gros plan sur la terre battue, ligne de fond et trace de balle
function heroClay() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/>
      <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.18  0 0 0 0 0.06  0 0 0 .55 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="sweep"><feTurbulence type="fractalNoise" baseFrequency=".004 .08" numOctaves="2" seed="9"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 .8  0 0 0 0 .6  0 0 0 .18 0"/></filter>
    <linearGradient id="light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  </defs>
  <rect width="1000" height="900" fill="#c4612f"/>
  <rect width="1000" height="900" filter="url(#sweep)"/>
  <rect width="1000" height="900" fill="#c4612f" filter="url(#grain)"/>
  <g transform="rotate(-12 500 450)">
    <rect x="-200" y="560" width="1500" height="26" fill="#f3efe6"/>
    <rect x="470" y="140" width="24" height="430" fill="#f3efe6"/>
    <rect x="-200" y="140" width="1500" height="22" fill="#f3efe6" opacity=".95"/>
    <rect x="-200" y="-60" width="1500" height="60" fill="#0b1625" opacity=".18"/>
  </g>
  <ellipse cx="610" cy="470" rx="70" ry="22" transform="rotate(-20 610 470)" fill="#8f3f17" opacity=".55"/>
  <ellipse cx="610" cy="470" rx="58" ry="15" transform="rotate(-20 610 470)" fill="#a94c1f" opacity=".6"/>
  <ellipse cx="760" cy="420" rx="60" ry="14" fill="#5c2a10" opacity=".35"/>
  <g transform="translate(750 365)">${ball(0, 0, 58)}</g>
  <rect width="1000" height="900" fill="url(#light)"/>
</svg>`;
}

save("hero-night.svg", heroNight());
save("hero-graphic.svg", heroGraphic());
save("hero-clay.svg", heroClay());
save("hero.svg", heroNight());

// ---------- nouveaux formateurs ----------
save("coaches/coach-5.svg", coachAvatar("#0369a1", "#5b3420", "#f8fafc", `<path d="M130 150 Q128 84 200 80 Q272 84 270 150 L262 132 Q230 100 200 104 Q170 100 138 132 Z" fill="#9ca3af"/>`, `<rect x="160" y="166" width="34" height="22" rx="8" fill="none" stroke="#111827" stroke-width="4"/><rect x="206" y="166" width="34" height="22" rx="8" fill="none" stroke="#111827" stroke-width="4"/><line x1="194" y1="176" x2="206" y2="176" stroke="#111827" stroke-width="4"/>`));
save("coaches/coach-6.svg", coachAvatar("#be185d", "#7c4a2d", NAVY, `<path d="M118 190 Q96 70 200 64 Q304 70 282 190 Q276 120 240 104 Q200 120 160 104 Q124 120 118 190 Z" fill="#1f1308"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${130 + i * 28}" cy="${92 + Math.abs(2.5 - i) * 8}" r="16" fill="#1f1308"/>`).join("")}`));

// ---------- avatars au choix pour les membres ----------
mkdirSync(join(OUT, "avatars"), { recursive: true });
const people = [
  ["#1e3a5f", "#6b3f25", LIME, `<path d="M128 150 Q130 80 200 78 Q270 80 272 150 Q250 110 200 112 Q150 110 128 150 Z" fill="#111827"/>`],
  ["#0f766e", "#8d5a3b", "#fbbf24", `<path d="M124 170 Q110 70 200 66 Q290 70 276 170 Q270 120 200 108 Q130 120 124 170 Z" fill="#1f1308"/><circle cx="200" cy="72" r="34" fill="#1f1308"/>`],
  ["#9a3412", "#4a2a18", "#f8fafc", `<path d="M132 140 Q140 92 200 90 Q260 92 268 140 Q240 116 200 116 Q160 116 132 140 Z" fill="#111827"/>`],
  ["#6d28d9", "#a26a42", "#38bdf8", `<path d="M120 200 Q100 60 200 62 Q300 60 280 200 Q282 130 250 108 Q200 130 150 108 Q118 130 120 200 Z" fill="#2b1a0e"/>`],
  ["#15803d", "#e0b48c", NAVY, `<path d="M126 150 Q126 76 200 74 Q274 76 274 150 Q256 104 200 100 Q144 104 126 150 Z" fill="#7c4a12"/>`],
  ["#b45309", "#5b3420", LIME, `<path d="M118 190 Q96 70 200 64 Q304 70 282 190 Q276 120 240 104 Q200 120 160 104 Q124 120 118 190 Z" fill="#1f1308"/>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${130 + i * 28}" cy="${92 + Math.abs(2.5 - i) * 8}" r="16" fill="#1f1308"/>`).join("")}`],
  ["#334155", "#f1c9a5", "#f472b6", `<path d="M122 200 Q100 66 200 64 Q300 66 278 200 Q280 120 200 104 Q120 120 122 200 Z" fill="#facc15"/>`],
  ["#0e7490", "#3b2414", "#f97316", `<path d="M134 136 Q146 96 200 94 Q254 96 266 136 Q238 118 200 118 Q162 118 134 136 Z" fill="#111827"/>`],
];
people.forEach(([bg, skin, shirt, hair], i) => save(`avatars/avatar-${i + 1}.svg`, coachAvatar(bg, skin, shirt, hair)));
const iconAvatar = (bg, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><circle cx="320" cy="80" r="110" fill="#fff" opacity=".12"/>${inner}</svg>`;
save("avatars/avatar-9.svg", iconAvatar(NAVY, ball(200, 200, 120)));
save("avatars/avatar-10.svg", iconAvatar(LIME, smallRacket(200, 300, -20, NAVY, 1.4)));
save("avatars/avatar-11.svg", iconAvatar("#7c2d12", trophy(200, 220, 0.95)));
save("avatars/avatar-12.svg", iconAvatar("#1e293b", `${smallRacket(170, 310, -30, LIME, 1.2)}${smallRacket(230, 310, 30, "#fff", 1.2)}${ball(200, 110, 34)}`));

// ---------- bannières publicitaires des partenaires (format 4:1) ----------
function adBanner(c1, c2, name, sub, slogan, cta, mark) {
  const g = id("ad");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="1200" height="300" fill="url(#${g})"/>
  <circle cx="1080" cy="40" r="210" fill="#fff" opacity=".08"/><circle cx="980" cy="320" r="140" fill="#fff" opacity=".06"/>
  <g transform="translate(130 150)"><circle r="78" fill="#fff"/><g transform="scale(1.4)">${mark}</g></g>
  <text x="250" y="118" font-family="Arial" font-size="24" font-weight="700" fill="#fff" opacity=".85" letter-spacing="3">${name.toUpperCase()} · ${sub}</text>
  <text x="250" y="178" font-family="Arial" font-size="46" font-weight="800" fill="#fff">${slogan}</text>
  <rect x="250" y="206" width="${cta.length * 14 + 48}" height="48" rx="24" fill="#fff"/>
  <text x="${250 + 24}" y="238" font-family="Arial" font-size="20" font-weight="700" fill="${c1}">${cta} →</text>
</svg>`;
}
save("partners/banner-atlantique.svg", adBanner("#0e7490", "#155e75", "Atlantique", "ASSURANCES", "Votre santé couverte, sur et hors du court", "Demander un devis", `<circle r="40" fill="#0e7490"/><path d="M-30 8 Q-15 -8 0 8 T30 8" stroke="#fff" stroke-width="7" fill="none"/>`));
save("partners/banner-ouemetel.svg", adBanner("#7c3aed", "#5b21b6", "Ouémé Tel", "TÉLÉCOMS", "Suivez l'Open de Cotonou en direct", "Voir les forfaits", `<rect x="-36" y="-36" width="72" height="72" rx="18" fill="#7c3aed"/><path d="M-16 -10 Q0 -26 16 -10 M-8 0 Q0 -8 8 0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><circle cy="12" r="6" fill="#fff"/>`));
save("partners/banner-soleil.svg", adBanner("#ea580c", "#c2410c", "Soleil", "BOISSONS", "Rafraîchissez chaque set", "Découvrir la gamme", `<circle r="24" fill="#ea580c"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="-4" y="-44" width="8" height="14" rx="3" fill="#ea580c" transform="rotate(${a})"/>`).join("")}`));
save("partners/banner-dodomey.svg", adBanner("#15803d", "#166534", "Dodomey", "SPORT &amp; NUTRITION", "-15 % pour les adhérents du club", "Voir les offres", `<path d="M0 -42 L38 30 L-38 30 Z" fill="#15803d"/><circle cy="6" r="12" fill="${LIME}"/>`));
