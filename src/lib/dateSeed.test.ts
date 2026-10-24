import { pickFromPool } from './dateSeed';

describe('pickFromPool', () => {
  const pool = ['a', 'b', 'c', 'd', 'e'] as const;

  it('is deterministic: same pool+seed called twice returns the same result', () => {
    const first = pickFromPool(pool, '2026-08-06');
    const second = pickFromPool(pool, '2026-08-06');
    expect(first).toBe(second);
  });

  it('different seeds tend to select different pool entries', () => {
    const seeds = Array.from({ length: 20 }, (_, i) => `2026-08-${String(i + 1).padStart(2, '0')}`);
    const results = new Set(seeds.map((seed) => pickFromPool(pool, seed)));
    expect(results.size).toBeGreaterThan(1);
  });

  it('never returns the excluded entry when the pool has more than one item', () => {
    for (const seed of ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05']) {
      const excluded = pickFromPool(pool, seed);
      const next = pickFromPool(pool, seed, excluded);
      expect(next).not.toBe(excluded);
    }
  });

  it('ignores exclude when the pool has exactly one entry', () => {
    const single = ['only'] as const;
    expect(pickFromPool(single, 'any-seed', 'only')).toBe('only');
  });
});
