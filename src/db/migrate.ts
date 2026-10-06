// Le projet utilise un stockage JSON local dans data/.
// Ce module est gardé comme point d'entrée compatible avec les anciennes commandes de migration,
// mais il ne fait rien : la base est automatiquement initialisée par le script `npm run reset`.
export const DB_URL = process.env.DATA_DIR || "data";

export async function migrateDb() {
  return;
}

export default migrateDb;
