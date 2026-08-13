import { describe, expect, it } from "vitest";
import {
  ALL_CARDS,
  FIRE_BEASTS_STARTER_DECK,
  UMBRAL_MAGES_STARTER_DECK,
  expandDeckList,
  validateDeck,
} from "../src/index.js";

describe("catálogo", () => {
  it("contém exatamente 20 cartas", () => {
    expect(ALL_CARDS).toHaveLength(20);
  });

  it("possui BF-001 a BF-010 e MU-001 a MU-010", () => {
    const ids = ALL_CARDS.map((card) => card.id).sort();
    expect(ids).toEqual([
      "BF-001",
      "BF-002",
      "BF-003",
      "BF-004",
      "BF-005",
      "BF-006",
      "BF-007",
      "BF-008",
      "BF-009",
      "BF-010",
      "MU-001",
      "MU-002",
      "MU-003",
      "MU-004",
      "MU-005",
      "MU-006",
      "MU-007",
      "MU-008",
      "MU-009",
      "MU-010",
    ]);
  });

  it("não duplica ids", () => {
    const ids = ALL_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("decks iniciais", () => {
  it("Bestas de Fogo possui 30 cartas com no máximo 3 cópias", () => {
    const result = validateDeck(FIRE_BEASTS_STARTER_DECK);
    expect(result.valid).toBe(true);
    expect(expandDeckList(FIRE_BEASTS_STARTER_DECK)).toHaveLength(30);
  });

  it("Magos Umbrais possui 30 cartas com no máximo 3 cópias", () => {
    const result = validateDeck(UMBRAL_MAGES_STARTER_DECK);
    expect(result.valid).toBe(true);
    expect(expandDeckList(UMBRAL_MAGES_STARTER_DECK)).toHaveLength(30);
  });

  it("rejeita deck com tamanho inválido", () => {
    const result = validateDeck({
      ...FIRE_BEASTS_STARTER_DECK,
      cards: [{ cardId: "BF-001", count: 3 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toContain("3/30");
  });

  it("rejeita mais de 3 cópias", () => {
    const result = validateDeck({
      id: "invalid",
      name: "Inválido",
      archetype: "FIRE_BEASTS",
      cards: [
        { cardId: "BF-001", count: 4 },
        { cardId: "BF-002", count: 3 },
        { cardId: "BF-003", count: 3 },
        { cardId: "BF-004", count: 3 },
        { cardId: "BF-005", count: 3 },
        { cardId: "BF-006", count: 3 },
        { cardId: "BF-007", count: 3 },
        { cardId: "BF-008", count: 3 },
        { cardId: "BF-009", count: 3 },
        { cardId: "BF-010", count: 2 },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "TOO_MANY_COPIES")).toBe(true);
  });
});
