import type { DeckList } from "@duelo/shared";
import { FIRE_BEAST_CARDS } from "./cards/bestas-de-fogo.js";
import { UMBRAL_MAGE_CARDS } from "./cards/magos-umbrais.js";

export const FIRE_BEASTS_STARTER_DECK: DeckList = {
  id: "starter-fire-beasts",
  name: "Bestas de Fogo",
  archetype: "FIRE_BEASTS",
  cards: FIRE_BEAST_CARDS.map((card) => ({ cardId: card.id, count: 3 })),
};

export const UMBRAL_MAGES_STARTER_DECK: DeckList = {
  id: "starter-umbral-mages",
  name: "Magos Umbrais",
  archetype: "UMBRAL_MAGES",
  cards: UMBRAL_MAGE_CARDS.map((card) => ({ cardId: card.id, count: 3 })),
};

export const STARTER_DECKS = [FIRE_BEASTS_STARTER_DECK, UMBRAL_MAGES_STARTER_DECK];

export function expandDeckList(deck: DeckList): string[] {
  return deck.cards.flatMap((entry) => Array.from({ length: entry.count }, () => entry.cardId));
}
