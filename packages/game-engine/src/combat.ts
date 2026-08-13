import type { AttackDefinition, CardInstanceId, GameState, PlayerId, UnitInstance } from "@duelo/shared";
import { ErrorCodes } from "@duelo/shared";
import { def } from "./catalog.js";
import {
  equipmentAttackBonus,
  executionerMarkBonus,
  ferocityBonus,
  fireBeastAttackBonus,
  nextAttackBonus,
  consumeNextAttackBonus,
  computeMaxHp,
} from "./continuous.js";
import { applyDamage } from "./damage.js";
import { maybeOfferAttackTraps } from "./decisions.js";
import { fail } from "./errors.js";
import { emit, EventTypes } from "./events.js";
import { applyStatus } from "./status.js";
import {
  canDirectAttack,
  hasSummonSickness,
  isStunned,
  opponent,
  player,
  requireUnit,
  spendActions,
} from "./state-utils.js";

export interface AttackTarget {
  kind: "UNIT" | "DUELIST";
  instanceId?: CardInstanceId;
  playerId: PlayerId;
}

export function declareAttack(
  state: GameState,
  playerId: PlayerId,
  attackerInstanceId: CardInstanceId,
  attackId: string,
  target: AttackTarget,
): void {
  const attacker = requireUnit(state, attackerInstanceId);
  if (attacker.controllerId !== playerId) {
    fail(ErrorCodes.INVALID_TARGET, "Você não controla esta Unidade.");
  }
  const card = def(state, attacker.cardId);
  if (isStunned(attacker)) {
    fail(ErrorCodes.UNIT_STUNNED, "A Unidade está Atordoada e não pode atacar.");
  }
  if (hasSummonSickness(state, attacker, card.keywords)) {
    fail(ErrorCodes.SUMMON_SICKNESS, "A Unidade está em Estado de Invocação e não pode atacar.");
  }
  if (attacker.hasAttackedThisTurn) {
    fail(ErrorCodes.UNIT_ALREADY_ATTACKED, "Esta Unidade já atacou neste turno.");
  }
  const attack = card.attacks?.find((entry) => entry.id === attackId);
  if (!attack) {
    fail(ErrorCodes.ATTACK_NOT_FOUND, "Ataque não encontrado.", { attackId });
  }
  validateAttackRequirement(state, attacker, attack, target);
  validateAttackTarget(state, playerId, target);

  spendActions(state, playerId, attack.actionCost);
  attacker.hasAttackedThisTurn = true;
  emit(
    state,
    EventTypes.ATTACK_DECLARED,
    {
      attackerInstanceId,
      attackerName: card.name,
      attackId,
      attackName: attack.name,
      targetKind: target.kind,
      targetInstanceId: target.instanceId,
      targetPlayerId: target.playerId,
    },
    { actorId: playerId, sourceInstanceId: attackerInstanceId, targetIds: [target.instanceId ?? target.playerId] },
  );
  emit(state, EventTypes.UNIT_ATTACK_MARKED, { instanceId: attackerInstanceId });

  state.pendingResolution = {
    kind: "ATTACK",
    actorId: playerId,
    attackerInstanceId,
    attackId,
    targetKind: target.kind,
    targetInstanceId: target.instanceId,
    targetPlayerId: target.playerId,
    remainingTrapInstanceIds: [],
  };

  maybeOfferAttackTraps(state, playerId, attackerInstanceId);
  if (state.pendingDecision) {
    return;
  }
  if (
    state.decisionPolicy === "AUTO_ACCEPT" &&
    (state.pendingResolution?.remainingTrapInstanceIds.length ?? 0) > 0
  ) {
    return;
  }
  resolvePendingAttack(state);
}

export function resolvePendingAttack(state: GameState): void {
  const pending = state.pendingResolution;
  if (!pending || pending.kind !== "ATTACK" || !pending.attackerInstanceId || !pending.attackId || !pending.targetPlayerId) {
    return;
  }
  const attacker = requireUnit(state, pending.attackerInstanceId);
  const card = def(state, attacker.cardId);
  const attack = card.attacks?.find((entry) => entry.id === pending.attackId);
  if (!attack) {
    state.pendingResolution = undefined;
    return;
  }

  const target: AttackTarget = {
    kind: pending.targetKind ?? "DUELIST",
    instanceId: pending.targetInstanceId,
    playerId: pending.targetPlayerId,
  };

  if (target.kind === "UNIT" && target.instanceId && !state.players.some((entry) => entry.unitSlots.some((slot) => slot?.instanceId === target.instanceId))) {
    state.pendingResolution = undefined;
    return;
  }

  const computed = computeAttack(state, attacker, attack, target);
  consumeNextAttackBonus(attacker);

  if (target.kind === "DUELIST") {
    applyDamage(state, {
      sourceInstanceId: attacker.instanceId,
      sourcePlayerId: attacker.controllerId,
      sourceCardId: attacker.cardId,
      target: { kind: "DUELIST", playerId: target.playerId },
      base: computed.damage,
      origin: "ATTACK",
      attackId: attack.id,
    });
  } else if (target.instanceId) {
    applyDamage(state, {
      sourceInstanceId: attacker.instanceId,
      sourcePlayerId: attacker.controllerId,
      sourceCardId: attacker.cardId,
      target: { kind: "UNIT", instanceId: target.instanceId },
      base: computed.damage,
      origin: "ATTACK",
      attackId: attack.id,
      piercing: computed.piercing,
      ignoreProtection: computed.ignoreProtection,
    });
    const stillThere = state.players.some((entry) => entry.unitSlots.some((slot) => slot?.instanceId === target.instanceId));
    if (stillThere) {
      applyAttackAfterEffects(state, attacker, attack, target.instanceId);
    }
  }

  applySelfAttackEffects(state, attacker, attack);
  state.pendingResolution = undefined;
}

export function computeAttack(
  state: GameState,
  attacker: UnitInstance,
  attack: AttackDefinition,
  target: AttackTarget,
): { damage: number; piercing: boolean; ignoreProtection: boolean } {
  let damage = attack.damage;
  let piercing = attack.keywords?.includes("PIERCING") === true;
  let ignoreProtection = false;
  const attackerCard = def(state, attacker.cardId);
  const targetUnit = target.instanceId
    ? state.players.flatMap((entry) => entry.unitSlots).find((slot) => slot?.instanceId === target.instanceId) ?? undefined
    : undefined;

  if (attack.id === "incandescent-bite" && targetUnit?.statuses.some((status) => status.type === "BURN")) {
    damage += 100;
  }
  if (attack.id === "shadow-execution" && targetUnit) {
    const maxHp = computeMaxHp(state, targetUnit);
    if (targetUnit.currentHp * 2 <= maxHp) {
      damage += 200;
    }
  }
  if (attack.id === "shadow-devours-shadow" && targetUnit?.statuses.some((status) => ["BURN", "POISON", "SHADOW_POISON", "STUN"].includes(status.type))) {
    damage += 200;
  }
  if (attack.id === "caldera-jaw" && targetUnit) {
    const maxHp = computeMaxHp(state, targetUnit);
    if (targetUnit.currentHp * 2 < maxHp) {
      piercing = true;
    }
  }
  if (attack.id === "veil-rupture" && targetUnit?.statuses.some((status) => ["BURN", "POISON", "SHADOW_POISON", "STUN"].includes(status.type))) {
    ignoreProtection = true;
  }

  damage += ferocityBonus(state, attacker);
  damage += fireBeastAttackBonus(state) > 0 && attackerCard.archetype === "FIRE_BEASTS" ? 100 : 0;
  damage += equipmentAttackBonus(state, attacker);
  damage += nextAttackBonus(attacker);
  damage += executionerMarkBonus(state, attacker, target.instanceId);
  return { damage, piercing, ignoreProtection };
}

function validateAttackRequirement(
  state: GameState,
  attacker: UnitInstance,
  attack: AttackDefinition,
  target: AttackTarget,
): void {
  if (attack.id === "thermal-frenzy" && attacker.damageTakenTotal < 300) {
    fail(ErrorCodes.REQUIREMENT_NOT_MET, "Frenesi Térmico exige que Rasga-Cinzas tenha perdido pelo menos 300 PV.");
  }
  if (target.kind === "UNIT" && !target.instanceId) {
    fail(ErrorCodes.INVALID_TARGET, "Alvo de Unidade inválido.");
  }
}

function validateAttackTarget(state: GameState, playerId: PlayerId, target: AttackTarget): void {
  const enemy = opponent(state, playerId);
  if (target.playerId !== enemy.id) {
    fail(ErrorCodes.INVALID_TARGET, "O alvo precisa pertencer ao adversário.");
  }
  if (target.kind === "DUELIST") {
    if (!canDirectAttack(state, enemy.id)) {
      fail(ErrorCodes.DIRECT_ATTACK_BLOCKED, "O Duelista ainda está protegido por Unidades.");
    }
    return;
  }
  const unit = enemy.unitSlots.find((slot) => slot?.instanceId === target.instanceId);
  if (!unit) {
    fail(ErrorCodes.INVALID_TARGET, "Unidade alvo inválida.");
  }
}

function applyAttackAfterEffects(
  state: GameState,
  attacker: UnitInstance,
  attack: AttackDefinition,
  targetInstanceId: CardInstanceId,
): void {
  const target = state.players.flatMap((entry) => entry.unitSlots).find((slot) => slot?.instanceId === targetInstanceId);
  if (!target) {
    return;
  }
  if (attack.id === "volcanic-bite" || attack.id === "slag-breath") {
    applyStatus(state, target, "BURN", {
      instanceId: attacker.instanceId,
      cardId: attacker.cardId,
      playerId: attacker.controllerId,
    });
  }
  if (attack.id === "burning-constriction") {
    applyStatus(state, target, "STUN", {
      instanceId: attacker.instanceId,
      cardId: attacker.cardId,
      playerId: attacker.controllerId,
    });
  }
  if (attack.id === "umbral-needles") {
    applyStatus(state, target, "SHADOW_POISON", {
      instanceId: attacker.instanceId,
      cardId: attacker.cardId,
      playerId: attacker.controllerId,
    });
  }
  if (attack.id === "form-theft") {
    const targetCard = def(state, target.cardId);
    attacker.stolenPassives = targetCard.passiveEffects ? [...targetCard.passiveEffects] : [];
    emit(state, EventTypes.MODIFIER_APPLIED, {
      instanceId: attacker.instanceId,
      reason: "FORM_THEFT",
      copiedFrom: target.cardId,
    });
  }
  if (attack.id === "primordial-roar") {
    const enemy = opponent(state, attacker.controllerId);
    for (const unit of enemy.unitSlots) {
      if (!unit) {
        continue;
      }
      applyDamage(state, {
        sourceInstanceId: attacker.instanceId,
        sourcePlayerId: attacker.controllerId,
        sourceCardId: attacker.cardId,
        target: { kind: "UNIT", instanceId: unit.instanceId },
        base: 100,
        origin: "EFFECT",
        tags: ["PYRAXA_ROAR"],
      });
    }
  }
  if (attack.id === "artificial-eclipse") {
    for (const duelist of state.players) {
      for (const unit of duelist.unitSlots) {
        if (!unit || unit.instanceId === attacker.instanceId) {
          continue;
        }
        applyDamage(state, {
          sourceInstanceId: attacker.instanceId,
          sourcePlayerId: attacker.controllerId,
          sourceCardId: attacker.cardId,
          target: { kind: "UNIT", instanceId: unit.instanceId },
          base: 100,
          origin: "EFFECT",
          tags: ["NERETH_ECLIPSE"],
        });
      }
    }
  }
}

function applySelfAttackEffects(state: GameState, attacker: UnitInstance, attack: AttackDefinition): void {
  if (attack.id !== "magma-charge") {
    return;
  }
  if (!player(state, attacker.controllerId).unitSlots.some((slot) => slot?.instanceId === attacker.instanceId)) {
    return;
  }
  applyDamage(state, {
    sourceInstanceId: attacker.instanceId,
    sourcePlayerId: attacker.controllerId,
    sourceCardId: attacker.cardId,
    target: { kind: "UNIT", instanceId: attacker.instanceId },
    base: 200,
    origin: "SELF",
    tags: ["MAGMA_CHARGE"],
  });
}
