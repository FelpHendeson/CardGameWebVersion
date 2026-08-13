import {
  FIRE_BEAST_CARDS,
  FIRE_BEASTS_STARTER_DECK,
  UMBRAL_MAGE_CARDS,
  UMBRAL_MAGES_STARTER_DECK,
} from "@duelo/game-data";
import type { Command, GameState, PlayerId } from "@duelo/shared";
import { createDuel, executeCommand } from "../src/index.js";

export const P1 = "p1";
export const P2 = "p2";

export function startScriptedDuel(options?: {
  p1Cards?: string[];
  p2Cards?: string[];
  firstPlayerId?: PlayerId;
  seed?: string;
  mode?: "OFFICIAL" | "QUICK";
  debug?: boolean;
  drawOnFirstTurn?: boolean;
}): GameState {
  const toCounts = (ids: string[]) => ids.map((cardId) => ({ cardId, count: 1 as const }));

  const p1Cards = options?.p1Cards ?? FIRE_BEASTS_STARTER_DECK.cards.flatMap((entry) =>
    Array.from({ length: entry.count }, () => entry.cardId),
  );
  const p2Cards = options?.p2Cards ?? UMBRAL_MAGES_STARTER_DECK.cards.flatMap((entry) =>
    Array.from({ length: entry.count }, () => entry.cardId),
  );

  return createDuel({
    mode: options?.mode ?? "QUICK",
    seed: options?.seed ?? "test-seed",
    shuffle: false,
    firstPlayerId: options?.firstPlayerId ?? P1,
    decisionPolicy: "AUTO_ACCEPT",
    debug: options?.debug ?? true,
    rules: options?.drawOnFirstTurn !== undefined ? { drawOnFirstTurn: options.drawOnFirstTurn } : undefined,
    players: [
      { id: P1, name: "Bestas de Fogo", deck: options?.p1Cards ? toCounts(p1Cards) : FIRE_BEASTS_STARTER_DECK.cards },
      { id: P2, name: "Magos Umbrais", deck: options?.p2Cards ? toCounts(p2Cards) : UMBRAL_MAGES_STARTER_DECK.cards },
    ],
  });
}

export function cmd(
  type: Command["type"],
  playerId: PlayerId,
  payload?: Record<string, unknown>,
): Command {
  return {
    commandId: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    playerId,
    payload,
  };
}

export function must(state: GameState, command: Command): GameState {
  const result = executeCommand(state, command);
  if (!result.ok) {
    throw new Error(`${command.type} failed: ${result.error?.code} ${result.error?.message}`);
  }
  return result.state;
}

export function handOf(state: GameState, playerId: PlayerId, cardId: string) {
  return state.players.find((entry) => entry.id === playerId)!.hand.filter((card) => card.cardId === cardId);
}

export function unitOf(state: GameState, playerId: PlayerId, cardId: string) {
  return state.players.find((entry) => entry.id === playerId)!.unitSlots.find((slot) => slot?.cardId === cardId) ?? null;
}

export function duelist(state: GameState, playerId: PlayerId) {
  return state.players.find((entry) => entry.id === playerId)!;
}

export function deckWith(top: string[], archetype: "FIRE" | "UMBRAL" = "FIRE", size = 30): string[] {
  const pool = (archetype === "FIRE" ? FIRE_BEAST_CARDS : UMBRAL_MAGE_CARDS).flatMap((card) => [card.id, card.id, card.id]);
  const used = new Map<string, number>();
  const result: string[] = [];
  for (const id of top) {
    result.push(id);
    used.set(id, (used.get(id) ?? 0) + 1);
  }
  for (const id of pool) {
    if (result.length >= size) {
      break;
    }
    const count = used.get(id) ?? 0;
    if (count >= 3) {
      continue;
    }
    result.push(id);
    used.set(id, count + 1);
  }
  if (result.length !== size) {
    throw new Error(`deckWith produced ${result.length} cards`);
  }
  return result;
}
