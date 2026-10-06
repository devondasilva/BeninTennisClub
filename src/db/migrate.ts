// Crée / met à jour les tables à partir des migrations du dossier drizzle/
import { migrate } from "drizzle-orm/libsql/migrator";
import { db, DB_URL } from "./index";

migrate(db, { migrationsFolder: "drizzle" })
  .then(() => console.log(`✅ Base de données prête (${DB_URL})`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
