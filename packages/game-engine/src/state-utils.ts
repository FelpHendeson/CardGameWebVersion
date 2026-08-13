import type {
  CardInstance,
  CardInstanceId,
  GameState,
  PlayerId,
  PlayerState,
  SupportInstance,
  UnitInstance,
} from "@duelo/shared";
import { ErrorCodes } from "@duelo/shared";
import { fail } from "./errors.js";
import { emit, EventTypes } from "./events.js";

export function cloneState<T>(value: T): T {
  return structuredClone(value);
}

export function player(state: GameState, playerId: PlayerId): PlayerState {
  const found = state.players.find((entry) => entry.id === playerId);
  if (!found) {
    fail(ErrorCodes.INVALID_COMMAND, "Jogador não encontrado.", { playerId });
  }
  return found;
}

export function opponent(state: GameState, playerId: PlayerId): PlayerState {
  const found = state.players.find((entry) => entry.id !== playerId);
  if (!found) {
    fail(ErrorCodes.INVALID_COMMAND, "Adversário não encontrado.", { playerId });
  }
  return found;
}

export function activePlayer(state: GameState): PlayerState {
  return player(state, state.activePlayerId);
}

export function allUnits(state: GameState): UnitInstance[] {
  return state.players.flatMap((entry) => entry.unitSlots.filter((slot): slot is UnitInstance => slot !== null));
}

export function controlledUnits(state: GameState, playerId: PlayerId): UnitInstance[] {
  return player(state, playerId).unitSlots.filter((slot): slot is UnitInstance => slot !== null);
}

export function findUnit(state: GameState, instanceId: CardInstanceId): UnitInstance | undefined {
  return allUnits(state).find((unit) => unit.instanceId === instanceId);
}

export function requireUnit(state: GameState, instanceId: CardInstanceId): UnitInstance {
  const unit = findUnit(state, instanceId);
  if (!unit) {
    fail(ErrorCodes.INVALID_TARGET, "Unidade não encontrada.", { instanceId });
  }
  return unit;
}

export function findSupport(state: GameState, instanceId: CardInstanceId): SupportInstance | undefined {
  for (const entry of state.players) {
    const support = entry.supportSlots.find((slot) => slot?.instanceId === instanceId);
    if (support) {
      return support;
    }
  }
  return undefined;
}

export function ownerOfUnit(state: GameState, unit: UnitInstance): PlayerState {
  return player(state, unit.controllerId);
}

export function findCardInHand(duelist: PlayerState, instanceId: CardInstanceId): CardInstance | undefined {
  return duelist.hand.find((card) => card.instanceId === instanceId);
}

export function requireCardInHand(duelist: PlayerState, instanceId: CardInstanceId): CardInstance {
  const card = findCardInHand(duelist, instanceId);
  if (!card) {
    fail(ErrorCodes.CARD_NOT_IN_HAND, "A carta não está na mão.", { instanceId, playerId: duelist.id });
  }
  return card;
}

export function removeFromHand(duelist: PlayerState, instanceId: CardInstanceId): CardInstance {
  const index = duelist.hand.findIndex((card) => card.instanceId === instanceId);
  if (index < 0) {
    fail(ErrorCodes.CARD_NOT_IN_HAND, "A carta não está na mão.", { instanceId, playerId: duelist.id });
  }
  return duelist.hand.splice(index, 1)[0]!;
}

export function spendActions(state: GameState, playerId: PlayerId, amount: number): void {
  const duelist = player(state, playerId);
  if (amount <= 0) {
    return;
  }
  if (duelist.actionsRemaining < amount) {
    fail(ErrorCodes.INSUFFICIENT_ACTIONS, "Ações insuficientes.", {
      required: amount,
      available: duelist.actionsRemaining,
    });
  }
  duelist.actionsRemaining -= amount;
  emit(
    state,
    EventTypes.ACTIONS_SPENT,
    { playerId, amount, remaining: duelist.actionsRemaining },
    { actorId: playerId },
  );
}

export function emptyUnitSlot(duelist: PlayerState, slotIndex: number): boolean {
  return slotIndex >= 0 && slotIndex < duelist.unitSlots.length && duelist.unitSlots[slotIndex] === null;
}

export function emptySupportSlot(duelist: PlayerState, slotIndex: number): boolean {
  return slotIndex >= 0 && slotIndex < duelist.supportSlots.length && duelist.supportSlots[slotIndex] === null;
}

export function firstEmptyUnitSlot(duelist: PlayerState): number | undefined {
  const index = duelist.unitSlots.findIndex((slot) => slot === null);
  return index >= 0 ? index : undefined;
}

export function firstEmptySupportSlot(duelist: PlayerState): number | undefined {
  const index = duelist.supportSlots.findIndex((slot) => slot === null);
  return index >= 0 ? index : undefined;
}

export function nextInstanceId(state: GameState): string {
  state.cardCounter += 1;
  return `${state.id}-c${state.cardCounter}`;
}

export function nextStatusId(state: GameState, prefix: string): string {
  state.cardCounter += 1;
  return `${state.id}-${prefix}-${state.cardCounter}`;
}

export function isFireBeastUnit(cardTypes: string[], archetype?: string): boolean {
  return archetype === "FIRE_BEASTS" || (cardTypes.includes("BEAST") && cardTypes.includes("FIRE"));
}

export function isUmbralMageUnit(cardTypes: string[], archetype?: string): boolean {
  return archetype === "UMBRAL_MAGES" || (cardTypes.includes("MAGE") && cardTypes.includes("UMBRAL"));
}

export function hasNegativeStatus(unit: UnitInstance): boolean {
  return unit.statuses.some((status) =>
    ["BURN", "POISON", "SHADOW_POISON", "STUN"].includes(status.type),
  );
}

export function isStunned(unit: UnitInstance): boolean {
  return unit.statuses.some((status) => status.type === "STUN");
}

export function hasCharge(keywords: string[] | undefined): boolean {
  return keywords?.includes("CHARGE") ?? false;
}

export function hasSummonSickness(state: GameState, unit: UnitInstance, keywords: string[] | undefined): boolean {
  return unit.summonedOnTurn === state.turnNumber && !hasCharge(keywords);
}

export function protectingUnits(state: GameState, duelistId: PlayerId): UnitInstance[] {
  return controlledUnits(state, duelistId);
}

export function canDirectAttack(state: GameState, defenderId: PlayerId): boolean {
  return protectingUnits(state, defenderId).length === 0;
}
