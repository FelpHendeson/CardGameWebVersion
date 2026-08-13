import {
  CARD_CATALOG,
  CATALOG_BALANCE_VERSION,
  DEFAULT_GAME_RULES,
  ENGINE_VERSION,
  validateDeck,
} from "@duelo/game-data";
import {
  ErrorCodes,
  type CardInstance,
  type CreateDuelInput,
  type GameRulesConfig,
  type GameState,
  type PlayerState,
} from "@duelo/shared";
import { registerCatalog } from "./catalog.js";
import { fail } from "./errors.js";
import { emit, EventTypes } from "./events.js";
import { createRng, rngNextInt, shuffleInPlace } from "./rng.js";
import { startTurn } from "./turn.js";

export function createDuel(input: CreateDuelInput): GameState {
  const rules: GameRulesConfig = { ...DEFAULT_GAME_RULES, ...input.rules, status: { ...DEFAULT_GAME_RULES.status, ...input.rules?.status } };
  const catalog = input.catalog ?? CARD_CATALOG;
  const gameId = `duel-${input.seed}`;

  for (const entry of input.players) {
    const validation = validateDeck(
      { id: entry.id, name: entry.name, archetype: "FIRE_BEASTS", cards: entry.deck },
      rules,
    );
    if (!validation.valid) {
      fail(ErrorCodes.INVALID_DECK, validation.issues.map((issue) => issue.message).join(" "), {
        playerId: entry.id,
        issues: validation.issues,
      });
    }
  }

  let rng = createRng(input.seed);
  let cardCounter = 0;
  const makeInstance = (playerId: string, cardId: string): CardInstance => {
    cardCounter += 1;
    return {
      instanceId: `${gameId}-c${cardCounter}`,
      cardId,
      ownerId: playerId,
      controllerId: playerId,
      zone: "DECK",
      revealed: false,
    };
  };

  const maxHp = input.mode === "OFFICIAL" ? rules.officialLife : rules.quickLife;
  const players = input.players.map((entry) => {
    const expanded = entry.deck.flatMap((card) => Array.from({ length: card.count }, () => card.cardId));
    const deck = expanded.map((cardId) => makeInstance(entry.id, cardId));
    const duelist: PlayerState = {
      id: entry.id,
      name: entry.name,
      currentHp: maxHp,
      maxHp,
      actionsRemaining: 0,
      deck,
      hand: [],
      discard: [],
      unitSlots: Array.from({ length: rules.unitSlots }, () => null),
      supportSlots: Array.from({ length: rules.supportSlots }, () => null),
      fieldSlot: null,
      oncePerTurnFlags: {},
    };
    return duelist;
  }) as [PlayerState, PlayerState];

  const shouldShuffle = input.shuffle !== false;
  if (shouldShuffle) {
    rng = shuffleInPlace(players[0].deck, rng);
    rng = shuffleInPlace(players[1].deck, rng);
  }

  let firstPlayerId = input.firstPlayerId;
  if (!firstPlayerId) {
    const rolled = rngNextInt(rng, 2);
    rng = rolled.rng;
    firstPlayerId = players[rolled.value]!.id;
  }

  const state: GameState = {
    id: gameId,
    mode: input.mode,
    status: "IN_PROGRESS",
    turnNumber: 1,
    activePlayerId: firstPlayerId,
    firstPlayerId,
    phase: "TURN_START",
    players,
    events: [],
    rng,
    stateVersion: 1,
    catalogBalanceVersion: CATALOG_BALANCE_VERSION,
    engineVersion: ENGINE_VERSION,
    debug: input.debug === true,
    decisionPolicy: input.decisionPolicy ?? "MANUAL",
    rules,
    oncePerTurnGlobal: {},
    cardCounter,
    eventCounter: 0,
  };

  registerCatalog(state.id, catalog);

  emit(state, EventTypes.GAME_STARTED, {
    mode: state.mode,
    seed: input.seed,
    firstPlayerId,
    life: maxHp,
  });
  emit(state, EventTypes.FIRST_PLAYER_CHOSEN, { playerId: firstPlayerId });
  if (shouldShuffle) {
    emit(state, EventTypes.DECK_SHUFFLED, { seed: input.seed });
  }

  for (const duelist of state.players) {
    drawCardsUnchecked(state, duelist.id, rules.initialHandSize);
  }

  startTurn(state, firstPlayerId, {
    skipDraw: !rules.drawOnFirstTurn,
  });

  return state;
}

function drawCardsUnchecked(state: GameState, playerId: string, amount: number): void {
  const duelist = state.players.find((entry) => entry.id === playerId)!;
  for (let i = 0; i < amount; i += 1) {
    const drawn = duelist.deck.shift();
    if (!drawn) {
      fail(ErrorCodes.INVALID_DECK, "Deck insuficiente para a mão inicial.", { playerId });
    }
    drawn.zone = "HAND";
    duelist.hand.push(drawn);
    emit(state, EventTypes.CARD_DRAWN, {
      playerId,
      instanceId: drawn.instanceId,
      cardId: drawn.cardId,
      reason: "INITIAL_HAND",
      handSize: duelist.hand.length,
      deckSize: duelist.deck.length,
    });
  }
}
