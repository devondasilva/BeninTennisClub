import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/jwt";

/**
 * Première barrière, sans base de données : l'espace membre exige un jeton signé.
 * La validation complète (compte existant, actif, droits à jour) est faite côté
 * serveur par requireSession(). Le middleware ne redirige JAMAIS vers l'espace
 * membre : c'est ce qui rend les boucles de redirection impossibles.
 */
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(COOKIE_NAME); // jeton expiré ou falsifié
    return res;
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
