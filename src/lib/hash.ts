/**
 * A small integer avalanche hash (mulberry-style mixing). Deterministic and
 * environment-independent (`Math.imul` is exact 32-bit), giving well-spread
 * pseudo-random values from an index — no `Math.random`, no `Date.now`, so
 * callers stay pure and SSR/hydration agree.
 */
export function hash(n: number): number {
  let x = (n + 1) >>> 0
  x = Math.imul(x ^ (x >>> 16), 2_246_822_519)
  x = Math.imul(x ^ (x >>> 13), 3_266_489_917)
  x ^= x >>> 16
  return x >>> 0
}
