/**
 * Limiteur de tentatives en mémoire (fenêtre glissante).
 * Suffisant pour une instance unique ; derrière plusieurs serveurs, utiliser Redis.
 */
export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  return {
    /** Renvoie le nombre de secondes à attendre, ou 0 si la tentative est autorisée */
    check(key: string, now = Date.now()): number {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= max) {
        hits.set(key, recent);
        return Math.ceil((windowMs - (now - recent[0])) / 1000);
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 10_000) hits.delete(hits.keys().next().value as string);
      return 0;
    },
    reset(key: string) {
      hits.delete(key);
    },
  };
}
