import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";
import { parse, bad } from "@/lib/api";
import { notify } from "@/lib/notify";

const schema = z.object({ status: z.enum(["PENDING", "IN_PROGRESS", "READY_FOR_PICKUP", "COMPLETED"]) });
const MSG: Record<string, string> = {
  IN_PROGRESS: "Votre raquette est en cours de cordage.",
  READY_FOR_PICKUP: "Votre raquette est prête ! Vous pouvez la récupérer à l'accueil du club.",
  COMPLETED: "Merci ! Votre raquette a été récupérée.",
};

// Mise à jour du statut par l'équipe du club (cordeur)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await apiSession("stringing.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const [r] = await db.update(t.stringingRequests).set({ status: data.status }).where(eq(t.stringingRequests.id, id)).returning();
  if (!r) return bad("Demande introuvable", 404);
  if (MSG[data.status]) await notify(r.userId, "STRINGING_UPDATE", `Cordage : ${r.racketBrand} ${r.racketModel}`, MSG[data.status], "/dashboard/stringing");
  return NextResponse.json({ request: r });
}
