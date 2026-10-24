function hashString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Date-seeded deterministic pick from a pool, skipping `exclude` when another option exists. */
export function pickFromPool(pool: readonly string[], seed: string, exclude?: string): string {
  const candidates = exclude && pool.length > 1 ? pool.filter((m) => m !== exclude) : pool;
  const hash = hashString(seed);
  return candidates[hash % candidates.length];
}
