import type { CardInstanceId, GameState, PlayerId, SupportInstance, UnitInstance } from "@duelo/shared";
import { def } from "./catalog.js";
import { computeMaxHp, refreshAllHpCaps } from "./continuous.js";
import { emit, EventTypes } from "./events.js";
import { allUnits, player } from "./state-utils.js";
import { checkVictory } from "./victory.js";

export interface DestructionContext {
  piercing: boolean;
  excess: number;
  defenderPlayerId: PlayerId;
  sourcePlayerId: PlayerId;
  sourceInstanceId?: CardInstanceId;
  destroyedByAttack: boolean;
  pierceIfInstanceId?: CardInstanceId;
}

export function processDestructions(state: GameState, context?: DestructionContext): boolean {
  let anyDestroyed = false;
  let piercedTargetDestroyed = false;
  let guard = 0;
  while (guard < 12) {
    guard += 1;
    const dying = allUnits(state).filter((unit) => unit.currentHp <= 0);
    if (dying.length === 0) {
      break;
    }
    let savedAny = false;
    for (const unit of dying) {
      if (tryPyraxaSurvival(state, unit)) {
        savedAny = true;
      }
    }
    if (savedAny) {
      continue;
    }
    for (const unit of [...dying]) {
      if (unit.currentHp > 0) {
        continue;
      }
      if (context?.pierceIfInstanceId === unit.instanceId) {
        piercedTargetDestroyed = true;
      }
      destroyUnit(state, unit, context);
      anyDestroyed = true;
    }
  }
  if (context?.piercing && context.excess > 0 && piercedTargetDestroyed) {
    const defender = player(state, context.defenderPlayerId);
    defender.currentHp = Math.max(0, defender.currentHp - context.excess);
    emit(state, EventTypes.DAMAGE_DEALT, {
      targetKind: "DUELIST",
      playerId: defender.id,
      amount: context.excess,
      origin: "PIERCING",
      currentHp: defender.currentHp,
    });
    emit(state, EventTypes.HP_CHANGED, {
      playerId: defender.id,
      amount: -context.excess,
      currentHp: defender.currentHp,
      reason: "PIERCING",
    });
  }
  checkVictory(state);
  return anyDestroyed;
}

function tryPyraxaSurvival(state: GameState, unit: UnitInstance): boolean {
  if (unit.currentHp > 0) {
    return false;
  }
  const card = def(state, unit.cardId);
  if (card.archetype !== "FIRE_BEASTS" || card.category !== "UNIT") {
    return false;
  }
  const controller = player(state, unit.controllerId);
  const pyraxa = controller.unitSlots.find((slot) => slot?.cardId === "BF-006");
  if (!pyraxa) {
    return false;
  }
  const flag = `pyraxa-survival-${pyraxa.instanceId}-${state.turnNumber}`;
  if (state.oncePerTurnGlobal[flag]) {
    return false;
  }
  unit.currentHp = 100;
  state.oncePerTurnGlobal[flag] = true;
  emit(state, EventTypes.HP_CHANGED, {
    instanceId: unit.instanceId,
    cardId: unit.cardId,
    cardName: card.name,
    amount: 100,
    currentHp: 100,
    reason: "PYRAXA_SURVIVAL",
  });
  return true;
}

export function destroyUnit(state: GameState, unit: UnitInstance, context?: DestructionContext): void {
  const controller = player(state, unit.controllerId);
  const card = def(state, unit.cardId);
  emit(
    state,
    EventTypes.CARD_DESTROYED,
    {
      instanceId: unit.instanceId,
      cardId: unit.cardId,
      cardName: card.name,
      playerId: unit.controllerId,
    },
    { sourceInstanceId: context?.sourceInstanceId, targetIds: [unit.instanceId] },
  );

  if (context?.destroyedByAttack && context.sourceInstanceId) {
    triggerOnDestroyUnit(state, context.sourceInstanceId, unit);
  }

  discardEquipments(state, unit);

  controller.discard.push({
    instanceId: unit.instanceId,
    cardId: unit.cardId,
    ownerId: unit.ownerId,
    controllerId: unit.controllerId,
    zone: "DISCARD",
    revealed: true,
  });
  controller.unitSlots[unit.slotIndex] = null;
  refreshAllHpCaps(state);
}

function discardEquipments(state: GameState, unit: UnitInstance): void {
  const controller = player(state, unit.controllerId);
  for (const equipmentId of unit.equipmentInstanceIds) {
    const slotIndex = controller.supportSlots.findIndex((slot) => slot?.instanceId === equipmentId);
    const support = slotIndex >= 0 ? controller.supportSlots[slotIndex] : undefined;
    if (!support) {
      continue;
    }
    controller.supportSlots[slotIndex] = null;
    controller.discard.push({
      instanceId: support.instanceId,
      cardId: support.cardId,
      ownerId: support.ownerId,
      controllerId: support.controllerId,
      zone: "DISCARD",
      revealed: true,
    });
    emit(state, EventTypes.CARD_DISCARDED, {
      instanceId: support.instanceId,
      cardId: support.cardId,
      cardName: def(state, support.cardId).name,
      reason: "EQUIPMENT_UNATTACHED",
    });
  }
}

function triggerOnDestroyUnit(state: GameState, sourceInstanceId: CardInstanceId, destroyed: UnitInstance): void {
  const attacker = allUnits(state).find((unit) => unit.instanceId === sourceInstanceId);
  if (!attacker) {
    return;
  }
  const card = def(state, attacker.cardId);
  if (card.id === "BF-005" || attacker.stolenPassives?.some((effect) => effect.id === "alpha-predator")) {
    const maxHp = computeMaxHp(state, attacker);
    const before = attacker.currentHp;
    attacker.currentHp = Math.min(maxHp, attacker.currentHp + 300);
    emit(state, EventTypes.HP_CHANGED, {
      instanceId: attacker.instanceId,
      cardId: attacker.cardId,
      cardName: def(state, attacker.cardId).name,
      amount: attacker.currentHp - before,
      currentHp: attacker.currentHp,
      reason: "ALPHA_PREDATOR",
    });
  }
  triggerObsidianFangs(state, attacker, destroyed);
}

function triggerObsidianFangs(state: GameState, attacker: UnitInstance, _destroyed: UnitInstance): void {
  const owner = player(state, attacker.controllerId);
  const fangs = owner.supportSlots.find(
    (slot): slot is SupportInstance => slot?.cardId === "BF-008" && slot.equippedToInstanceId === attacker.instanceId,
  );
  if (!fangs) {
    return;
  }
  const attackerCard = def(state, attacker.cardId);
  const heal = attackerCard.archetype === "FIRE_BEASTS" ? 200 : 100;
  const maxHp = computeMaxHp(state, attacker);
  const before = attacker.currentHp;
  attacker.currentHp = Math.min(maxHp, attacker.currentHp + heal);
  emit(state, EventTypes.HP_CHANGED, {
    instanceId: attacker.instanceId,
    cardId: attacker.cardId,
    cardName: attackerCard.name,
    amount: attacker.currentHp - before,
    currentHp: attacker.currentHp,
    reason: "OBSIDIAN_FANGS",
  });
}
