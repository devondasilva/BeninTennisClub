import { z } from "zod";
import { partnerImageField } from "@/lib/images";

export const IMAGES: Record<string, string> = {
  TOURNAMENT: "/images/events/tournament.svg", STAGE: "/images/events/stage.svg",
  SCHOOL: "/images/events/school.svg", GATHERING: "/images/events/gathering.svg",
};

export const eventSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court"),
  description: z.string().trim().min(10, "Description trop courte"),
  type: z.enum(["TOURNAMENT", "STAGE", "SCHOOL", "GATHERING"]),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  location: z.string().trim().min(2),
  capacity: z.number().int().positive("Capacité invalide"),
  price: z.number().min(0),
  image: partnerImageField.optional(),
});
