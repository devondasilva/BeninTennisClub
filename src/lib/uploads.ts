import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export const UPLOAD_DIR = join(process.cwd(), "uploads");
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * Enregistre une image envoyée (data URL) dans le dossier uploads/ et renvoie son URL publique.
 * Une valeur déjà sous forme de chemin (/images/..., /uploads/...) est conservée telle quelle.
 */
export async function storeImage(value: string | null | undefined): Promise<string | null | undefined> {
  if (!value || value.startsWith("/")) return value;
  const m = value.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) throw new Error("Image invalide");
  const name = `${randomUUID()}.${EXT[m[1]]}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, name), Buffer.from(m[2], "base64"));
  return `/uploads/${name}`;
}
