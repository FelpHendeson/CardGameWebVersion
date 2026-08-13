import type { RngState } from "@duelo/shared";

export function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function createRng(seed: string): RngState {
  return { seed, state: hashSeed(seed) };
}

function next(state: number): { value: number; state: number } {
  let t = (state + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return {
    value: ((t ^ (t >>> 14)) >>> 0) / 4294967296,
    state: t >>> 0,
  };
}

export function rngNext(rng: RngState): { value: number; rng: RngState } {
  const rolled = next(rng.state);
  return { value: rolled.value, rng: { seed: rng.seed, state: rolled.state } };
}

export function rngNextInt(rng: RngState, maxExclusive: number): { value: number; rng: RngState } {
  if (maxExclusive <= 0) {
    throw new Error("rngNextInt maxExclusive must be > 0");
  }
  const rolled = rngNext(rng);
  return {
    value: Math.floor(rolled.value * maxExclusive),
    rng: rolled.rng,
  };
}

export function shuffleInPlace<T>(items: T[], rng: RngState): RngState {
  let current = rng;
  for (let i = items.length - 1; i > 0; i -= 1) {
    const rolled = rngNextInt(current, i + 1);
    current = rolled.rng;
    const j = rolled.value;
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return current;
}
