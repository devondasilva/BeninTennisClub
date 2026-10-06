import { z } from "zod";
import { partnerImageField } from "@/lib/images";

export const IMAGES: Record<string, string> = {
  EQUIPMENT: "/images/campaigns/equipment.svg", FACILITY: "/images/campaigns/floodlights.svg", TOURNAMENT: "/images/campaigns/tournament.svg",
  TRAINING: "/images/campaigns/youth.svg", COMMUNITY: "/images/events/gathering.svg", OTHER: "/images/events/stage.svg",
};

export const campaignSchema = z.object({
  title: z.string().trim().min(5, "Titre trop court"),
  description: z.string().trim().min(20, "Décrivez le projet en quelques phrases"),
  category: z.enum(["EQUIPMENT", "FACILITY", "TOURNAMENT", "TRAINING", "COMMUNITY", "OTHER"]),
  targetAmount: z.number().min(10000, "Objectif minimum : 10 000 XOF"),
  deadline: z.string().min(1, "Date limite requise"),
  image: partnerImageField.optional(),
  status: z.enum(["ACTIVE", "COMPLETED"]).default("ACTIVE"),
});
