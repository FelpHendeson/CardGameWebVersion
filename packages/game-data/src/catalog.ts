import type { CardDefinition, CardId } from "@duelo/shared";
import { FIRE_BEAST_CARDS } from "./cards/bestas-de-fogo.js";
import { UMBRAL_MAGE_CARDS } from "./cards/magos-umbrais.js";

export const ALL_CARDS: CardDefinition[] = [...FIRE_BEAST_CARDS, ...UMBRAL_MAGE_CARDS];

export const CARD_CATALOG: Record<CardId, CardDefinition> = Object.fromEntries(
  ALL_CARDS.map((card) => [card.id, card]),
);

export function getCardDefinition(cardId: CardId): CardDefinition {
  const card = CARD_CATALOG[cardId];
  if (!card) {
    throw new Error(`Unknown card id: ${cardId}`);
  }
  return card;
}

export function listCardsByArchetype(archetype: CardDefinition["archetype"]): CardDefinition[] {
  return ALL_CARDS.filter((card) => card.archetype === archetype);
}
