import { z } from "zod";
import { partnerImageField } from "@/lib/images";

export const partnerSchema = z.object({
  name: z.string().trim().min(2, "Nom du partenaire requis").max(80),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER", "PARTNER"]),
  description: z.string().trim().min(5, "Décrivez le partenariat en une phrase").max(300),
  tagline: z.string().trim().max(80).optional().nullable(),
  website: z.string().trim().url("Adresse du site invalide (ex. https://exemple.bj)").optional().or(z.literal("")).nullable(),
  logo: partnerImageField.optional(),
  banner: partnerImageField.optional(),
  placements: z.array(z.enum(["HOME", "EVENTS", "COACHES", "DASHBOARD", "SHOP"])),
  amount: z.number().min(0),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  contactName: z.string().trim().max(80).optional().nullable(),
  contactEmail: z.string().trim().email("E-mail du contact invalide").optional().or(z.literal("")).nullable(),
  contactPhone: z.string().trim().max(30).optional().nullable(),
});

export function toRow(d: z.infer<typeof partnerSchema>) {
  return {
    ...d,
    website: d.website || null,
    contactEmail: d.contactEmail || null,
    tagline: d.tagline || null,
    placements: d.placements.join(","),
    startDate: new Date(d.startDate),
    endDate: new Date(`${d.endDate}T23:59:59`),
  };
}
