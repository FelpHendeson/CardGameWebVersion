import type { CardInstanceId, GameState, PlayerId, StatusType, UnitInstance } from "@duelo/shared";
import { def } from "./catalog.js";
import { isFieldActive } from "./continuous.js";
import { emit, EventTypes } from "./events.js";
import { applyDamage } from "./damage.js";
import { allUnits, hasNegativeStatus, isUmbralMageUnit, nextStatusId, player } from "./state-utils.js";

export function applyStatus(
  state: GameState,
  unit: UnitInstance,
  type: StatusType,
  source: { instanceId?: CardInstanceId; cardId?: string; playerId?: PlayerId },
): void {
  const alreadyNegative = hasNegativeStatus(unit);
  const rules = state.rules.status;
  let intensity = 0;
  let remainingTicks: number | undefined;
  let tickTiming: "TURN_START" | "TURN_END" | undefined;
  let expiresAtTurnEnd: number | undefined;

  if (type === "BURN") {
    intensity = rules.burn.damage;
    remainingTicks = rules.burn.durationTicks;
    tickTiming = rules.burn.timing;
  } else if (type === "POISON" || type === "SHADOW_POISON") {
    intensity = rules.poison.damage;
    tickTiming = rules.poison.timing;
  } else if (type === "STUN") {
    expiresAtTurnEnd = unit.controllerId === state.activePlayerId ? state.turnNumber : state.turnNumber + 1;
  } else if (type === "PROTECTION") {
    intensity = 0;
  }

  if (type === "BURN") {
    unit.statuses = unit.statuses.filter((status) => status.type !== "BURN");
  }
  if (type === "STUN") {
    unit.statuses = unit.statuses.filter((status) => status.type !== "STUN");
  }

  unit.statuses.push({
    id: nextStatusId(state, "st"),
    type,
    sourceInstanceId: source.instanceId,
    sourceCardId: source.cardId,
    sourcePlayerId: source.playerId,
    targetInstanceId: unit.instanceId,
    intensity,
    remainingTicks,
    createdAtTurn: state.turnNumber,
    expiresAtTurnEnd,
    tickTiming,
  });

  emit(
    state,
    EventTypes.STATUS_APPLIED,
    {
      statusType: type,
      targetInstanceId: unit.instanceId,
      cardId: unit.cardId,
      cardName: def(state, unit.cardId).name,
    },
    { sourceInstanceId: source.instanceId, targetIds: [unit.instanceId] },
  );

  if (!alreadyNegative && hasNegativeStatus(unit)) {
    triggerTorreStatusHeal(state, unit);
  }
}

function triggerTorreStatusHeal(state: GameState, newlyDebuffed: UnitInstance): void {
  if (!isFieldActive(state, "MU-010")) {
    return;
  }
  const key = `torre-status-heal-${state.turnNumber}`;
  if (state.oncePerTurnGlobal[key]) {
    return;
  }
  const enemyOfDebuffed = state.players.find((entry) => entry.id !== newlyDebuffed.controllerId);
  if (!enemyOfDebuffed) {
    return;
  }
  const mages = enemyOfDebuffed.unitSlots.filter((slot): slot is UnitInstance => {
    if (!slot) {
      return false;
    }
    const card = def(state, slot.cardId);
    return isUmbralMageUnit(card.types, card.archetype);
  });
  if (mages.length === 0) {
    return;
  }
  mages.sort((a, b) => a.currentHp - b.currentHp || a.slotIndex - b.slotIndex);
  const target = mages[0]!;
  target.currentHp += 100;
  state.oncePerTurnGlobal[key] = true;
  emit(state, EventTypes.HP_CHANGED, {
    instanceId: target.instanceId,
    cardId: target.cardId,
    amount: 100,
    currentHp: target.currentHp,
    reason: "ECLIPSE_TOWER",
  });
}

export function tickBurn(state: GameState, playerId: PlayerId): void {
  const units = player(state, playerId).unitSlots.filter((slot): slot is UnitInstance => slot !== null);
  for (const unit of units) {
    const burns = unit.statuses.filter((status) => status.type === "BURN");
    for (const burn of burns) {
      let damage = burn.intensity || state.rules.status.burn.damage;
      if (isFieldActive(state, "BF-010")) {
        damage += 100;
      }
      applyDamage(state, {
        sourcePlayerId: burn.sourcePlayerId ?? opponentId(state, playerId),
        sourceCardId: burn.sourceCardId,
        sourceInstanceId: burn.sourceInstanceId,
        target: { kind: "UNIT", instanceId: unit.instanceId },
        base: damage,
        origin: "STATUS",
        tags: ["BURN"],
      });
      if (burn.remainingTicks !== undefined) {
        burn.remainingTicks -= 1;
        if (burn.remainingTicks <= 0) {
          unit.statuses = unit.statuses.filter((status) => status.id !== burn.id);
          emit(state, EventTypes.STATUS_EXPIRED, {
            statusType: "BURN",
            targetInstanceId: unit.instanceId,
          });
        }
      }
    }
  }
}

export function tickPoison(state: GameState, playerId: PlayerId): void {
  const units = player(state, playerId).unitSlots.filter((slot): slot is UnitInstance => slot !== null);
  for (const unit of units) {
    const poisons = unit.statuses.filter(
      (status) => status.type === "POISON" || status.type === "SHADOW_POISON",
    );
    for (const poison of poisons) {
      const damage = poison.intensity || state.rules.status.poison.damage;
      applyDamage(state, {
        sourcePlayerId: poison.sourcePlayerId ?? opponentId(state, playerId),
        sourceCardId: poison.sourceCardId,
        sourceInstanceId: poison.sourceInstanceId,
        target: { kind: "UNIT", instanceId: unit.instanceId },
        base: damage,
        origin: "STATUS",
        tags: [poison.type],
      });
    }
  }
}

export function expireStuns(state: GameState, playerId: PlayerId): void {
  const units = player(state, playerId).unitSlots.filter((slot): slot is UnitInstance => slot !== null);
  for (const unit of units) {
    const expired = unit.statuses.filter(
      (status) => status.type === "STUN" && status.expiresAtTurnEnd === state.turnNumber,
    );
    if (expired.length === 0) {
      continue;
    }
    unit.statuses = unit.statuses.filter((status) => !expired.includes(status));
    for (const _expired of expired) {
      emit(state, EventTypes.STATUS_EXPIRED, {
        statusType: "STUN",
        targetInstanceId: unit.instanceId,
      });
    }
  }
}

export function clearEndOfTurnMarks(state: GameState, playerId: PlayerId): void {
  for (const unit of allUnits(state)) {
    if (unit.controllerId !== playerId) {
      continue;
    }
    unit.flags.markedInstanceIds = [];
    unit.stolenPassives = undefined;
    unit.temporaryEffects = unit.temporaryEffects.filter(
      (modifier) => modifier.duration !== "UNTIL_END_OF_TURN" && modifier.duration !== "UNTIL_NEXT_ATTACK",
    );
    unit.hasAttackedThisTurn = false;
  }
}

function opponentId(state: GameState, playerId: PlayerId): PlayerId {
  return state.players.find((entry) => entry.id !== playerId)?.id ?? playerId;
}
