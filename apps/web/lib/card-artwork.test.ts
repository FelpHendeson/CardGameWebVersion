import { describe, expect, it } from "vitest";
import { ALL_CARDS, getCardDefinition } from "@duelo/game-data";
import {
  getAlternateArtworkSrcs,
  getPrimaryArtworkSrc,
  resolveCardArtworkPath,
  shouldRevealSupportArtwork,
} from "./card-artwork";

describe("card artwork metadata", () => {
  it("associa artwork por ID às 20 cartas", () => {
    expect(ALL_CARDS).toHaveLength(20);
    for (const card of ALL_CARDS) {
      expect(card.artwork?.assetId).toBe(card.id);
      expect(getPrimaryArtworkSrc(card)).toBe(`/cards/${card.id}.png`);
    }
  });

  it("BF-001 usa arte principal e preserva alternativa", () => {
    const card = getCardDefinition("BF-001");
    expect(getPrimaryArtworkSrc(card)).toBe("/cards/BF-001.png");
    expect(card.artwork?.alternateAssetIds).toEqual(["BF-001-alt"]);
    expect(getAlternateArtworkSrcs(card)).toEqual(["/cards/BF-001-alt.png"]);
  });

  it("MU-001 resolve path canônico", () => {
    const card = getCardDefinition("MU-001");
    expect(getPrimaryArtworkSrc(card)).toBe("/cards/MU-001.png");
    expect(resolveCardArtworkPath("MU-001")).toBe("/cards/MU-001.png");
  });

  it("fallback quando não há assetId explícito ainda resolve pelo id da carta", () => {
    const src = getPrimaryArtworkSrc({
      id: "BF-004",
      artwork: { alt: "Sem asset" },
    });
    expect(src).toBe("/cards/BF-004.png");
  });

  it("armadilha preparada não revela artwork", () => {
    expect(shouldRevealSupportArtwork(false)).toBe(false);
    expect(shouldRevealSupportArtwork(true)).toBe(true);
    expect(shouldRevealSupportArtwork(undefined)).toBe(true);
  });
});
