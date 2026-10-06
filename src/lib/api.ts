import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function bad(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function parse<T>(req: Request, schema: ZodSchema<T>): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await req.json();
    return { data: schema.parse(body), error: null };
  } catch (e) {
    if (e instanceof ZodError) return { data: null, error: bad(e.errors[0]?.message ?? "Données invalides") };
    return { data: null, error: bad("Requête invalide") };
  }
}
