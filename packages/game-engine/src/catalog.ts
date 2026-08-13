import { CARD_CATALOG } from "@duelo/game-data";
import type { CardDefinition, CardId, GameState } from "@duelo/shared";

const catalogs = new Map<string, Record<CardId, CardDefinition>>();

export function registerCatalog(gameId: string, catalog: Record<CardId, CardDefinition>): void {
  catalogs.set(gameId, catalog);
}

export function getCatalog(state: GameState): Record<CardId, CardDefinition> {
  return catalogs.get(state.id) ?? CARD_CATALOG;
}

export function def(state: GameState, cardId: CardId): CardDefinition {
  const card = getCatalog(state)[cardId];
  if (!card) {
    throw new Error(`Unknown card id: ${cardId}`);
  }
  return card;
}
