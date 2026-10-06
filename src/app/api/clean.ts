/**
 * Retire les champs « undefined » d'un patch avant db.x.update(...)
 * (comme le faisait l'ancien ORM : un champ absent du formulaire ne modifie pas la valeur enregistrée).
 */
export function clean<T extends object>(patch: T): T {
  return Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as T;
}
