import type { GameState, PlayerId, UnitInstance } from "@duelo/shared";
import { def } from "./catalog.js";
import { allUnits, controlledUnits, isFireBeastUnit, isUmbralMageUnit } from "./state-utils.js";

export function isFieldActive(state: GameState, cardId: string): boolean {
  return state.players.some((entry) => entry.fieldSlot?.cardId === cardId);
}

export function computeMaxHp(state: GameState, unit: UnitInstance): number {
  const card = def(state, unit.cardId);
  let maxHp = unit.maxHpBase;
  if (card.archetype === "FIRE_BEASTS" && card.category === "UNIT") {
    const others = controlledUnits(state, unit.controllerId).filter(
      (ally) => ally.instanceId !== unit.instanceId && isFireBeastUnit(def(state, ally.cardId).types, def(state, ally.cardId).archetype),
    );
    if (others.length > 0 && card.id === "BF-001") {
      maxHp += 100;
    }
  }
  if (isUmbralMageUnit(card.types, card.archetype) && isFieldActive(state, "MU-010")) {
    maxHp += 100;
  }
  for (const modifier of unit.temporaryEffects) {
    if (modifier.property === "MAX_HP" && modifier.operation === "ADD") {
      maxHp += modifier.value;
    }
  }
  return Math.max(1, maxHp);
}

export function clampHpToMax(state: GameState, unit: UnitInstance): void {
  const maxHp = computeMaxHp(state, unit);
  if (unit.currentHp > maxHp) {
    unit.currentHp = maxHp;
  }
}

export function refreshAllHpCaps(state: GameState): void {
  for (const unit of allUnits(state)) {
    clampHpToMax(state, unit);
  }
}

export function fireBeastAttackBonus(state: GameState): number {
  return isFieldActive(state, "BF-010") ? 100 : 0;
}

export function equipmentAttackBonus(state: GameState, unit: UnitInstance): number {
  let bonus = 0;
  const owner = state.players.find((entry) => entry.id === unit.controllerId);
  if (!owner) {
    return 0;
  }
  for (const equipmentId of unit.equipmentInstanceIds) {
    const support = owner.supportSlots.find((slot) => slot?.instanceId === equipmentId);
    if (!support) {
      continue;
    }
    if (support.cardId === "BF-008") {
      bonus += 200;
    }
    if (support.cardId === "MU-008") {
      bonus += 100;
    }
  }
  return bonus;
}

export function nextAttackBonus(unit: UnitInstance): number {
  const modifier = unit.temporaryEffects.find((entry) => entry.property === "NEXT_ATTACK_DAMAGE");
  return modifier?.value ?? 0;
}

export function consumeNextAttackBonus(unit: UnitInstance): void {
  unit.temporaryEffects = unit.temporaryEffects.filter((entry) => entry.property !== "NEXT_ATTACK_DAMAGE");
}

export function ferocityBonus(state: GameState, unit: UnitInstance): number {
  const card = def(state, unit.cardId);
  const maxHp = computeMaxHp(state, unit);
  if (card.id === "BF-002" && unit.currentHp * 2 <= maxHp) {
    return 100;
  }
  const stolen = unit.stolenPassives?.some((effect) => effect.id === "ferocity");
  if (stolen && unit.currentHp * 2 <= maxHp) {
    return 100;
  }
  return 0;
}

export function executionerMarkBonus(state: GameState, attacker: UnitInstance, targetId: string | undefined): number {
  if (!targetId) {
    return 0;
  }
  const marked = attacker.flags.markedInstanceIds;
  if (!Array.isArray(marked)) {
    return 0;
  }
  return marked.includes(targetId) ? 100 : 0;
}

export function hasNoIdentity(state: GameState, unit: UnitInstance): boolean {
  const card = def(state, unit.cardId);
  return card.id === "MU-004" || card.tags?.includes("NO_IDENTITY") === true;
}

export function torreTrapDamageBonus(state: GameState, playerId: PlayerId): number {
  if (!isFieldActive(state, "MU-010")) {
    return 0;
  }
  if (state.oncePerTurnGlobal[`torre-trap-bonus-${state.turnNumber}`]) {
    return 0;
  }
  const ownerHasTower = state.players.some(
    (entry) => entry.id === playerId && entry.fieldSlot?.cardId === "MU-010",
  );
  if (!ownerHasTower && !isFieldActive(state, "MU-010")) {
    return 0;
  }
  return 100;
}

export function consumeTorreTrapBonus(state: GameState): void {
  state.oncePerTurnGlobal[`torre-trap-bonus-${state.turnNumber}`] = true;
}

export function caldeiraFirstDamageReduction(state: GameState, unit: UnitInstance): number {
  if (!isFieldActive(state, "BF-010")) {
    return 0;
  }
  const card = def(state, unit.cardId);
  if (!isFireBeastUnit(card.types, card.archetype)) {
    return 0;
  }
  const key = `caldeira-reduced-${unit.instanceId}-${state.turnNumber}`;
  if (state.oncePerTurnGlobal[key]) {
    return 0;
  }
  return 100;
}

export function markCaldeiraReductionUsed(state: GameState, unit: UnitInstance): void {
  state.oncePerTurnGlobal[`caldeira-reduced-${unit.instanceId}-${state.turnNumber}`] = true;
}

export function velkaAttackReduction(state: GameState, unit: UnitInstance, origin: string): number {
  if (origin !== "ATTACK") {
    return 0;
  }
  const card = def(state, unit.cardId);
  const isVelka = card.id === "MU-005" || unit.stolenPassives?.some((effect) => effect.id === "seven-shadows");
  if (!isVelka) {
    return 0;
  }
  const key = `velka-reduced-${unit.instanceId}-${state.turnNumber}`;
  if (unit.flags[key] === true) {
    return 0;
  }
  return 200;
}

export function markVelkaReductionUsed(state: GameState, unit: UnitInstance): void {
  unit.flags[`velka-reduced-${unit.instanceId}-${state.turnNumber}`] = true;
}
