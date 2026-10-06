import { z } from "zod";
import { partnerImageField } from "@/lib/images";

export const courtSchema = z.object({
  name: z.string().trim().min(2, "Nom du court requis").max(40),
  surface: z.string().trim().min(2, "Surface requise").max(60),
  description: z.string().trim().max(300).optional().nullable(),
  pricePerSlot: z.number().min(500, "Prix invalide"),
  image: partnerImageField.optional(),
  isActive: z.boolean(),
});
