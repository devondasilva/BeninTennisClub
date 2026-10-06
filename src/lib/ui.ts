/**
 * Classes partagées du design — même langage que Beach Tennis Bénin (boutons arrondis en capitales,
 * cartes blanches très arrondies, champs épais), aux couleurs du logo du club.
 * Les classes CSS équivalentes (.btn-primary, .card, .input…) sont définies dans globals.css.
 */
export const ui = {
  btnPrimary: "btn-primary",
  btnAccent: "btn-accent",
  btnDark: "btn-dark",
  btnGhost: "btn-ghost",
  btnGhostDark: "btn-ghost-dark",
  card: "card",
  cardHover: "card-hover",
  label: "label",
  input: "input",
  eyebrow: "eyebrow",
  sectionTitle: "section-title",
  error: "rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700",
  success: "rounded-2xl bg-lime-light px-4 py-3 text-sm font-semibold text-ink",
} as const;

/** Classe d'une carte-option (radio stylé) selon son état. */
export function optionCls(selected: boolean) {
  return `relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
    selected ? "border-brand bg-brand/[0.06] shadow-lg shadow-brand/10" : "border-ink/10 bg-white hover:border-ink/25"
  }`;
}
