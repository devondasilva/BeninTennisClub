/** N'accepte qu'un chemin interne au site (empêche les redirections vers un site tiers) */
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
