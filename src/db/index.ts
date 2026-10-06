// Fuseau horaire du club (voir next.config.mjs)
process.env.TZ = process.env.CLUB_TIMEZONE || "Africa/Porto-Novo";

import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";

export const DB_URL = process.env.DATABASE_URL || "file:btc.db";

const g = globalThis as unknown as { libsql?: Client };
const client = g.libsql ?? createClient({ url: DB_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
if (process.env.NODE_ENV !== "production") g.libsql = client;

export const db = drizzle(client, { schema });
export * as t from "./schema";
