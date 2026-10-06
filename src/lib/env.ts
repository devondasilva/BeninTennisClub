import { z } from "zod";

/**
 * Configuration lue une seule fois et vérifiée au démarrage.
 * Tout est facultatif en local : sans clé, les paiements passent en mode démonstration.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().optional(),
  APP_URL: z.string().url().optional(),
  DATA_FILE: z.string().optional(),
  CLUB_TIMEZONE: z.string().default("Africa/Porto-Novo"),
  STRIPE_SECRET_KEY: z.string().optional(),
  MTN_SUBSCRIPTION_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.warn("⚠️  Variables d'environnement invalides :", parsed.error.flatten().fieldErrors);
}
export const env = parsed.success ? parsed.data : schema.parse({});

const g = globalThis as unknown as { __btcEnvChecked?: boolean };
if (!g.__btcEnvChecked && process.env.NEXT_PHASE !== "phase-production-build") {
  g.__btcEnvChecked = true;
  if (env.NODE_ENV === "production" && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
    console.warn(
      "⚠️  JWT_SECRET absent ou trop court : acceptable en local, mais OBLIGATOIRE avant une mise en ligne " +
        "(au moins 32 caractères aléatoires dans .env)."
    );
  }
}
