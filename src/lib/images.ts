import { z } from "zod";

// Une image de profil est soit un avatar fourni (/images/...), soit une photo
// envoyée par l'utilisateur, recadrée et compressée dans le navigateur (data URL JPEG/PNG/WebP).
export const MAX_PHOTO_CHARS = 400_000; // ≈ 300 Ko

export const imageField = z
  .string()
  .refine((v) => /^\/images\/[\w\-/]+\.svg$/.test(v) || /^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/.test(v) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v), "Image invalide")
  .refine((v) => v.length <= MAX_PHOTO_CHARS, "Photo trop lourde (300 Ko maximum après compression)")
  .nullable();

export const PRESET_AVATARS = Array.from({ length: 12 }, (_, i) => `/images/avatars/avatar-${i + 1}.svg`);
export const PRESET_COACH_PHOTOS = Array.from({ length: 6 }, (_, i) => `/images/coaches/coach-${i + 1}.svg`);

// Logos et bannières des partenaires (envoyés par le gérant)
export const MAX_BANNER_CHARS = 900_000; // ≈ 650 Ko
export const partnerImageField = z
  .string()
  .refine((v) => /^\/images\/[\w\-/]+\.svg$/.test(v) || /^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/.test(v) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v), "Image invalide")
  .refine((v) => v.length <= MAX_BANNER_CHARS, "Image trop lourde (650 Ko maximum après compression)")
  .nullable();
