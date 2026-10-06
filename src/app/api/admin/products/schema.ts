import { z } from "zod";
import { partnerImageField } from "@/lib/images";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nom de l'article requis").max(80),
  description: z.string().trim().min(5, "Ajoutez une courte description").max(600),
  category: z.enum(["RACKETS", "BALLS", "CLOTHING", "SHOES", "ACCESSORIES"]),
  price: z.number().min(100, "Prix invalide"),
  stock: z.number().int().min(0, "Stock invalide"),
  image: partnerImageField.optional(),
  isActive: z.boolean(),
});
