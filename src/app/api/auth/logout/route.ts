import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jwt";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.delete(COOKIE_NAME);
  return res;
}

// Session invalide (compte supprimé, suspendu ou base réinitialisée) :
// on efface le cookie puis on renvoie vers la connexion — évite une boucle de redirections.
export async function GET(req: Request) {
  const motif = new URL(req.url).searchParams.get("motif") === "suspendu" ? "suspendu" : "expire";
  const res = NextResponse.redirect(new URL(`/login?motif=${motif}`, req.url), 303);
  res.cookies.delete(COOKIE_NAME);
  return res;
}
