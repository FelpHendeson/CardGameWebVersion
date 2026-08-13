import type { GameState, PlayerId } from "@duelo/shared";
import { emit, EventTypes } from "./events.js";
import { expireStuns, tickBurn, tickPoison, clearEndOfTurnMarks } from "./status.js";
import { player } from "./state-utils.js";
import { checkVictory, endGame, isFinished } from "./victory.js";

export function drawCards(state: GameState, playerId: PlayerId, amount: number, reason: string): boolean {
  const duelist = player(state, playerId);
  for (let i = 0; i < amount; i += 1) {
    const drawn = duelist.deck.shift();
    if (!drawn) {
      endGame(state, state.players.find((entry) => entry.id !== playerId)!.id, playerId, "DECK_OUT");
      return false;
    }
    drawn.zone = "HAND";
    drawn.revealed = false;
    duelist.hand.push(drawn);
    emit(
      state,
      EventTypes.CARD_DRAWN,
      {
        playerId,
        instanceId: drawn.instanceId,
        cardId: drawn.cardId,
        reason,
        handSize: duelist.hand.length,
        deckSize: duelist.deck.length,
      },
      { actorId: playerId, sourceInstanceId: drawn.instanceId },
    );
  }
  return true;
}

export function refreshActions(state: GameState, playerId: PlayerId): void {
  const duelist = player(state, playerId);
  duelist.actionsRemaining = state.rules.actionsPerTurn;
  duelist.oncePerTurnFlags = {};
  emit(state, EventTypes.ACTIONS_REFRESHED, {
    playerId,
    actions: duelist.actionsRemaining,
  });
}

export function startTurn(state: GameState, playerId: PlayerId, options?: { skipDraw?: boolean }): void {
  state.activePlayerId = playerId;
  state.phase = "TURN_START";
  emit(state, EventTypes.TURN_STARTED, {
    playerId,
    turnNumber: state.turnNumber,
    name: player(state, playerId).name,
  });

  tickBurn(state, playerId);
  if (isFinished(state)) {
    return;
  }

  state.phase = "DRAW";
  const shouldDraw =
    !options?.skipDraw &&
    (state.turnNumber > 1 || playerId !== state.firstPlayerId || state.rules.drawOnFirstTurn);
  if (shouldDraw) {
    drawCards(state, playerId, state.rules.drawPerTurn, "TURN_DRAW");
    if (isFinished(state)) {
      return;
    }
  }

  state.phase = "ACTION_REFRESH";
  refreshActions(state, playerId);
  state.phase = "FREE_PHASE";
  checkVictory(state);
}

export function endTurn(state: GameState, playerId: PlayerId): void {
  state.phase = "TURN_END";
  tickPoison(state, playerId);
  if (isFinished(state)) {
    return;
  }
  expireStuns(state, playerId);
  clearEndOfTurnMarks(state, playerId);
  emit(state, EventTypes.TURN_ENDED, {
    playerId,
    turnNumber: state.turnNumber,
  });

  const next = state.players.find((entry) => entry.id !== playerId);
  if (!next) {
    return;
  }
  state.turnNumber += 1;
  state.oncePerTurnGlobal = Object.fromEntries(
    Object.entries(state.oncePerTurnGlobal).filter(([key]) => key.includes(`-${state.turnNumber}`)),
  );
  startTurn(state, next.id);
}
