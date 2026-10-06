import type { Coach } from "@/db";
import { parseAvailability } from "./coaches";
import type { CoachFormData } from "@/components/CoachProfileForm";

export function toCoachForm(c: Coach): CoachFormData {
  return {
    id: c.id, firstName: c.firstName, lastName: c.lastName, specialization: c.specialization ?? "", bio: c.bio ?? "",
    languages: c.languages ?? "", diplomas: c.diplomas ?? "", achievements: c.achievements ?? "", experience: c.experience,
    photo: c.photo, availability: parseAvailability(c.availability), hourlyRate: c.hourlyRate, commissionRate: c.commissionRate, status: c.status,
  };
}
