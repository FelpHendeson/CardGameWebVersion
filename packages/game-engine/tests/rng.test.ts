import { describe, expect, it } from "vitest";
import { createRng, shuffleInPlace } from "../src/rng.js";

describe("RNG determinístico", () => {
  it("a mesma seed produz a mesma sequência", () => {
    const a = createRng("ABC123");
    const b = createRng("ABC123");
    const deckA = Array.from({ length: 10 }, (_, i) => i);
    const deckB = Array.from({ length: 10 }, (_, i) => i);
    shuffleInPlace(deckA, a);
    shuffleInPlace(deckB, b);
    expect(deckA).toEqual(deckB);
  });

  it("seeds diferentes produzem ordens diferentes", () => {
    const deckA = Array.from({ length: 20 }, (_, i) => i);
    const deckB = Array.from({ length: 20 }, (_, i) => i);
    shuffleInPlace(deckA, createRng("seed-a"));
    shuffleInPlace(deckB, createRng("seed-b"));
    expect(deckA).not.toEqual(deckB);
  });
});
