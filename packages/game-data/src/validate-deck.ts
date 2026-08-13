import type { DeckList, GameRulesConfig } from "@duelo/shared";
import { CARD_CATALOG } from "./catalog.js";
import { DEFAULT_GAME_RULES } from "./rules.js";

export interface DeckValidationIssue {
  code: string;
  message: string;
}

export interface DeckValidationResult {
  valid: boolean;
  totalCards: number;
  issues: DeckValidationIssue[];
}

export function validateDeck(
  deck: DeckList,
  rules: GameRulesConfig = DEFAULT_GAME_RULES,
): DeckValidationResult {
  const issues: DeckValidationIssue[] = [];
  const totalCards = deck.cards.reduce((sum, entry) => sum + entry.count, 0);

  if (totalCards !== rules.deckSize) {
    issues.push({
      code: "INVALID_DECK_SIZE",
      message: `Seu Deck possui ${totalCards}/${rules.deckSize} cartas.`,
    });
  }

  const aggregated = new Map<string, number>();
  for (const entry of deck.cards) {
    if (!CARD_CATALOG[entry.cardId]) {
      issues.push({
        code: "UNKNOWN_CARD",
        message: `Carta desconhecida: ${entry.cardId}.`,
      });
    }
    if (entry.count < 1) {
      issues.push({
        code: "INVALID_COUNT",
        message: `Quantidade inválida para ${entry.cardId}.`,
      });
    }
    aggregated.set(entry.cardId, (aggregated.get(entry.cardId) ?? 0) + entry.count);
  }

  for (const [cardId, count] of aggregated) {
    if (count > rules.maxCopiesPerCard) {
      issues.push({
        code: "TOO_MANY_COPIES",
        message: `Você possui ${count} cópias de ${cardId}. O máximo permitido é ${rules.maxCopiesPerCard}.`,
      });
    }
  }

  return { valid: issues.length === 0, totalCards, issues };
}
