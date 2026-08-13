import type { CardInstanceId, GameState, PlayerId, UnitInstance } from "@duelo/shared";
import { def } from "./catalog.js";
import {
  caldeiraFirstDamageReduction,
  computeMaxHp,
  markCaldeiraReductionUsed,
  markVelkaReductionUsed,
  velkaAttackReduction,
} from "./continuous.js";
import { emit, EventTypes } from "./events.js";
import { processDestructions } from "./destroy.js";
import { allUnits, player } from "./state-utils.js";
import { checkVictory } from "./victory.js";

export interface DamageRequest {
  sourceInstanceId?: CardInstanceId;
  sourcePlayerId: PlayerId;
  sourceCardId?: string;
  target: { kind: "UNIT"; instanceId: CardInstanceId } | { kind: "DUELIST"; playerId: PlayerId };
  base: number;
  origin: "ATTACK" | "SPELL" | "TRAP" | "STATUS" | "EFFECT" | "SELF";
  attackId?: string;
  piercing?: boolean;
  ignoreProtection?: boolean;
  tags?: string[];
}

export function healUnit(state: GameState, unit: UnitInstance, amount: number, reason?: string): void {
  if (amount <= 0) {
    return;
  }
  const maxHp = computeMaxHp(state, unit);
  const before = unit.currentHp;
  unit.currentHp = Math.min(maxHp, unit.currentHp + amount);
  const healed = unit.currentHp - before;
  if (healed <= 0) {
    return;
  }
  emit(state, EventTypes.HP_CHANGED, {
    instanceId: unit.instanceId,
    cardId: unit.cardId,
    cardName: def(state, unit.cardId).name,
    amount: healed,
    currentHp: unit.currentHp,
    maxHp,
    reason: reason ?? "HEAL",
  });
}

export function applyDamage(state: GameState, request: DamageRequest): { final: number; excess: number; destroyed: boolean } {
  if (request.base <= 0) {
    return { final: 0, excess: 0, destroyed: false };
  }

  const target = request.target;
  if (target.kind === "DUELIST") {
    const duelist = player(state, target.playerId);
    const final = request.base;
    duelist.currentHp = Math.max(0, duelist.currentHp - final);
    emit(
      state,
      EventTypes.DAMAGE_DEALT,
      {
        targetKind: "DUELIST",
        playerId: duelist.id,
        amount: final,
        origin: request.origin,
        currentHp: duelist.currentHp,
      },
      { actorId: request.sourcePlayerId, sourceInstanceId: request.sourceInstanceId, targetIds: [duelist.id] },
    );
    emit(state, EventTypes.HP_CHANGED, {
      playerId: duelist.id,
      amount: -final,
      currentHp: duelist.currentHp,
      reason: request.origin,
    });
    checkVictory(state);
    return { final, excess: 0, destroyed: false };
  }

  if (target.kind !== "UNIT") {
    return { final: 0, excess: 0, destroyed: false };
  }
  const unit = allUnits(state).find((entry) => entry.instanceId === target.instanceId);
  if (!unit) {
    return { final: 0, excess: 0, destroyed: false };
  }

  let amount = request.base;
  if (!request.ignoreProtection) {
    const protection = unit.statuses.find((status) => status.type === "PROTECTION");
    if (protection && protection.intensity > 0) {
      const absorbed = Math.min(protection.intensity, amount);
      amount -= absorbed;
      protection.intensity -= absorbed;
      if (protection.intensity <= 0) {
        unit.statuses = unit.statuses.filter((status) => status.id !== protection.id);
      }
    }
  }

  const velkaReduction = velkaAttackReduction(state, unit, request.origin);
  if (velkaReduction > 0) {
    amount = Math.max(0, amount - velkaReduction);
    markVelkaReductionUsed(state, unit);
  }

  const caldeiraReduction = caldeiraFirstDamageReduction(state, unit);
  if (caldeiraReduction > 0) {
    amount = Math.max(0, amount - caldeiraReduction);
    markCaldeiraReductionUsed(state, unit);
  }

  const hpBefore = unit.currentHp;
  const final = amount;
  const appliedToHp = Math.min(final, hpBefore);
  const excess = Math.max(0, final - hpBefore);
  unit.currentHp = Math.max(0, unit.currentHp - final);
  unit.damageTakenTotal += appliedToHp;

  emit(
    state,
    EventTypes.DAMAGE_DEALT,
    {
      targetKind: "UNIT",
      instanceId: unit.instanceId,
      cardId: unit.cardId,
      cardName: def(state, unit.cardId).name,
      amount: final,
      origin: request.origin,
      attackId: request.attackId,
      currentHp: unit.currentHp,
      excess,
      piercing: request.piercing === true,
    },
    {
      actorId: request.sourcePlayerId,
      sourceInstanceId: request.sourceInstanceId,
      targetIds: [unit.instanceId],
    },
  );
  emit(state, EventTypes.HP_CHANGED, {
    instanceId: unit.instanceId,
    cardId: unit.cardId,
    cardName: def(state, unit.cardId).name,
    amount: -appliedToHp,
    currentHp: unit.currentHp,
    reason: request.origin,
  });

  if (final >= 500 && request.sourceInstanceId && request.sourceInstanceId !== unit.instanceId) {
    triggerVolcanicBlood(state, unit, request.sourceInstanceId, final);
  }

  const destroyed = processDestructions(state, {
    piercing: request.piercing === true && request.origin === "ATTACK",
    excess,
    defenderPlayerId: unit.controllerId,
    sourcePlayerId: request.sourcePlayerId,
    sourceInstanceId: request.sourceInstanceId,
    destroyedByAttack: request.origin === "ATTACK",
    pierceIfInstanceId: unit.instanceId,
  });

  return { final, excess, destroyed };
}

function triggerVolcanicBlood(
  state: GameState,
  unit: UnitInstance,
  sourceInstanceId: CardInstanceId,
  damageAmount: number,
): void {
  const card = def(state, unit.cardId);
  const hasBlood = card.id === "BF-004" || unit.stolenPassives?.some((effect) => effect.id === "volcanic-blood");
  if (!hasBlood || damageAmount < 500) {
    return;
  }
  const source = allUnits(state).find((entry) => entry.instanceId === sourceInstanceId);
  if (!source) {
    return;
  }
  applyDamage(state, {
    sourceInstanceId: unit.instanceId,
    sourcePlayerId: unit.controllerId,
    sourceCardId: unit.cardId,
    target: { kind: "UNIT", instanceId: source.instanceId },
    base: 200,
    origin: "EFFECT",
    tags: ["VOLCANIC_BLOOD"],
  });
}
