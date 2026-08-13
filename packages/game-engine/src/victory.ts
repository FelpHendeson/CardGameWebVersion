import type { DuelResultReason, GameState, PlayerId } from "@duelo/shared";
import { emit, EventTypes } from "./events.js";

export function endGame(state: GameState, winnerId: PlayerId, loserId: PlayerId, reason: DuelResultReason): void {
  if (state.status === "FINISHED") {
    return;
  }
  state.status = "FINISHED";
  state.phase = "TURN_END";
  state.result = { winnerId, loserId, reason };
  state.pendingDecision = undefined;
  state.pendingResolution = undefined;
  emit(state, EventTypes.GAME_ENDED, {
    winnerId,
    loserId,
    reason,
    turnNumber: state.turnNumber,
  });
}

export function isFinished(state: GameState): boolean {
  return state.status === "FINISHED";
}

export function checkVictory(state: GameState): void {
  if (state.status === "FINISHED") {
    return;
  }
  const [a, b] = state.players;
  if (!a || !b) {
    return;
  }
  if (a.currentHp <= 0 && b.currentHp <= 0) {
    endGame(state, state.activePlayerId === a.id ? b.id : a.id, state.activePlayerId, "LIFE_ZERO");
    return;
  }
  if (a.currentHp <= 0) {
    endGame(state, b.id, a.id, "LIFE_ZERO");
    return;
  }
  if (b.currentHp <= 0) {
    endGame(state, a.id, b.id, "LIFE_ZERO");
  }
}
