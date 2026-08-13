import type { CardInstanceId, GameState, PlayerId, SupportInstance, UnitInstance } from "@duelo/shared";
import { ErrorCodes } from "@duelo/shared";
import { def } from "./catalog.js";
import { computeMaxHp, consumeTorreTrapBonus, hasNoIdentity, isFieldActive, refreshAllHpCaps, torreTrapDamageBonus } from "./continuous.js";
import { applyDamage, healUnit } from "./damage.js";
import { fail } from "./errors.js";
import { emit, EventTypes } from "./events.js";
import { applyStatus } from "./status.js";
import {
  emptySupportSlot,
  firstEmptySupportSlot,
  isUmbralMageUnit,
  opponent,
  player,
  removeFromHand,
  requireCardInHand,
  requireUnit,
  spendActions,
} from "./state-utils.js";

export function playSpell(
  state: GameState,
  playerId: PlayerId,
  instanceId: CardInstanceId,
  targetInstanceId?: CardInstanceId,
): void {
  const duelist = player(state, playerId);
  const cardInstance = requireCardInHand(duelist, instanceId);
  const card = def(state, cardInstance.cardId);
  if (card.category !== "SPELL") {
    fail(ErrorCodes.INVALID_CARD_TYPE, "Esta carta não é uma Magia.");
  }
  spendActions(state, playerId, card.play?.actionCost ?? state.rules.defaultSpellActionCost);

  if (card.id === "BF-007") {
    if (!targetInstanceId) {
      fail(ErrorCodes.INVALID_TARGET, "Sangue em Brasa exige uma Besta de Fogo aliada.");
    }
    const unit = requireUnit(state, targetInstanceId);
    if (unit.controllerId !== playerId || def(state, unit.cardId).archetype !== "FIRE_BEASTS") {
      fail(ErrorCodes.INVALID_TARGET, "O alvo precisa ser uma Besta de Fogo sob seu controle.");
    }
    applyDamage(state, {
      sourceInstanceId: instanceId,
      sourcePlayerId: playerId,
      sourceCardId: card.id,
      target: { kind: "UNIT", instanceId: unit.instanceId },
      base: 200,
      origin: "SPELL",
    });
    const still = player(state, playerId).unitSlots.find((slot) => slot?.instanceId === unit.instanceId);
    if (still) {
      const maxHp = computeMaxHp(state, still);
      const bonus = still.currentHp * 2 <= maxHp ? 500 : 300;
      still.temporaryEffects.push({
        id: `${still.instanceId}-ember`,
        sourceInstanceId: instanceId,
        sourceCardId: card.id,
        targetInstanceId: still.instanceId,
        property: "NEXT_ATTACK_DAMAGE",
        operation: "ADD",
        value: bonus,
        duration: "UNTIL_NEXT_ATTACK",
      });
      emit(state, EventTypes.MODIFIER_APPLIED, { instanceId: still.instanceId, bonus, reason: "BLOOD_IN_EMBER" });
    }
  } else if (card.id === "MU-007") {
    if (!targetInstanceId) {
      fail(ErrorCodes.INVALID_TARGET, "Toque da Ausência exige uma Unidade.");
    }
    const unit = requireUnit(state, targetInstanceId);
    const hasNegative = unit.statuses.some((status) => ["BURN", "POISON", "SHADOW_POISON", "STUN"].includes(status.type));
    applyDamage(state, {
      sourceInstanceId: instanceId,
      sourcePlayerId: playerId,
      sourceCardId: card.id,
      target: { kind: "UNIT", instanceId: unit.instanceId },
      base: hasNegative ? 500 : 300,
      origin: "SPELL",
    });
    markExecutioner(state, playerId, targetInstanceId);
  } else {
    fail(ErrorCodes.INVALID_COMMAND, "Magia sem implementação.", { cardId: card.id });
  }

  const moved = removeFromHand(duelist, instanceId);
  moved.zone = "DISCARD";
  moved.revealed = true;
  duelist.discard.push(moved);
  emit(state, EventTypes.SPELL_PLAYED, { cardId: card.id, cardName: card.name, playerId }, { actorId: playerId });
  triggerStaffOnSpell(state, playerId);
}

export function playEquipment(
  state: GameState,
  playerId: PlayerId,
  instanceId: CardInstanceId,
  targetInstanceId: CardInstanceId,
  slotIndex?: number,
): void {
  const duelist = player(state, playerId);
  const cardInstance = requireCardInHand(duelist, instanceId);
  const card = def(state, cardInstance.cardId);
  if (card.category !== "EQUIPMENT" && card.category !== "MAGIC_EQUIPMENT") {
    fail(ErrorCodes.INVALID_CARD_TYPE, "Esta carta não é um Equipamento.");
  }
  const unit = requireUnit(state, targetInstanceId);
  if (unit.controllerId !== playerId) {
    fail(ErrorCodes.INVALID_TARGET, "Só é possível equipar Unidades aliadas.");
  }
  if (card.id === "MU-008") {
    const unitCard = def(state, unit.cardId);
    if (!unitCard.types.includes("MAGE") || hasNoIdentity(state, unit)) {
      fail(ErrorCodes.INVALID_TARGET, "O Bastão do Véu Partido só pode ser equipado em um Mago sem restrição de identidade.");
    }
  }
  const slot = slotIndex ?? firstEmptySupportSlot(duelist);
  if (slot === undefined) {
    fail(ErrorCodes.SUPPORT_ZONE_FULL, "Não há espaço de Suporte disponível.");
  }
  if (!emptySupportSlot(duelist, slot)) {
    fail(ErrorCodes.SLOT_OCCUPIED, "O espaço de Suporte já está ocupado.");
  }
  spendActions(state, playerId, card.play?.actionCost ?? state.rules.defaultEquipmentActionCost);
  const moved = removeFromHand(duelist, instanceId);
  const support: SupportInstance = {
    instanceId: moved.instanceId,
    cardId: moved.cardId,
    ownerId: moved.ownerId,
    controllerId: playerId,
    slotIndex: slot,
    setTurn: state.turnNumber,
    revealed: true,
    category: card.category,
    equippedToInstanceId: unit.instanceId,
    flags: {},
  };
  duelist.supportSlots[slot] = support;
  unit.equipmentInstanceIds.push(support.instanceId);
  emit(state, EventTypes.EQUIPMENT_PLAYED, {
    cardId: card.id,
    cardName: card.name,
    targetInstanceId: unit.instanceId,
    targetName: def(state, unit.cardId).name,
  }, { actorId: playerId, sourceInstanceId: support.instanceId, targetIds: [unit.instanceId] });
}

export function setTrap(
  state: GameState,
  playerId: PlayerId,
  instanceId: CardInstanceId,
  slotIndex?: number,
  free = false,
): void {
  const duelist = player(state, playerId);
  const cardInstance = free
    ? duelist.discard.find((card) => card.instanceId === instanceId)
    : requireCardInHand(duelist, instanceId);
  if (!cardInstance) {
    fail(ErrorCodes.INVALID_TARGET, "Carta de Armadilha não encontrada.");
  }
  const card = def(state, cardInstance.cardId);
  if (card.category !== "TRAP" && card.category !== "MAGIC_TRAP") {
    fail(ErrorCodes.INVALID_CARD_TYPE, "Esta carta não é uma Armadilha.");
  }
  const slot = slotIndex ?? firstEmptySupportSlot(duelist);
  if (slot === undefined) {
    fail(ErrorCodes.SUPPORT_ZONE_FULL, "Não há espaço de Suporte disponível.");
  }
  if (!emptySupportSlot(duelist, slot)) {
    fail(ErrorCodes.SLOT_OCCUPIED, "O espaço de Suporte já está ocupado.");
  }
  if (!free) {
    spendActions(state, playerId, card.play?.actionCost ?? state.rules.defaultTrapSetActionCost);
  }

  let extraEffects = undefined;
  let weaverInstanceId: string | undefined;
  if (card.category === "MAGIC_TRAP") {
    const weaver = maybeWeaverBonus(state, playerId);
    extraEffects = weaver.extraEffects;
    weaverInstanceId = weaver.weaverInstanceId;
  }

  if (free) {
    duelist.discard = duelist.discard.filter((card) => card.instanceId !== instanceId);
  } else {
    removeFromHand(duelist, instanceId);
  }

  const support: SupportInstance = {
    instanceId: cardInstance.instanceId,
    cardId: cardInstance.cardId,
    ownerId: cardInstance.ownerId,
    controllerId: playerId,
    slotIndex: slot,
    setTurn: state.turnNumber,
    revealed: false,
    category: card.category,
    extraEffects,
    flags: weaverInstanceId ? { weaverInstanceId } : {},
  };
  duelist.supportSlots[slot] = support;
  emit(state, EventTypes.TRAP_SET, {
    cardId: card.id,
    playerId,
    slotIndex: slot,
    free,
    hiddenName: true,
  }, { actorId: playerId, sourceInstanceId: support.instanceId });
}

export function playField(state: GameState, playerId: PlayerId, instanceId: CardInstanceId): void {
  const duelist = player(state, playerId);
  const cardInstance = requireCardInHand(duelist, instanceId);
  const card = def(state, cardInstance.cardId);
  if (card.category !== "FIELD") {
    fail(ErrorCodes.INVALID_CARD_TYPE, "Esta carta não é um Campo.");
  }
  spendActions(state, playerId, card.play?.actionCost ?? state.rules.defaultFieldActionCost);
  if (duelist.fieldSlot) {
    duelist.discard.push({
      ...duelist.fieldSlot,
      zone: "DISCARD",
      revealed: true,
    });
    emit(state, EventTypes.CARD_DISCARDED, {
      instanceId: duelist.fieldSlot.instanceId,
      cardId: duelist.fieldSlot.cardId,
      cardName: def(state, duelist.fieldSlot.cardId).name,
      reason: "FIELD_REPLACED",
    });
  }
  const moved = removeFromHand(duelist, instanceId);
  moved.zone = "FIELD";
  moved.revealed = true;
  duelist.fieldSlot = moved;
  refreshAllHpCaps(state);
  for (const unit of duelist.unitSlots) {
    if (!unit) {
      continue;
    }
    const unitCard = def(state, unit.cardId);
    if (card.id === "MU-010" && isUmbralMageUnit(unitCard.types, unitCard.archetype)) {
      const maxHp = computeMaxHp(state, unit);
      if (unit.currentHp < maxHp && unit.currentHp === unit.maxHpBase) {
        unit.currentHp = Math.min(maxHp, unit.currentHp + 100);
      }
    }
  }
  emit(state, EventTypes.FIELD_PLAYED, { cardId: card.id, cardName: card.name, playerId }, { actorId: playerId });
}

export function activateTrap(state: GameState, trapInstanceId: CardInstanceId): void {
  let owner: ReturnType<typeof player> | undefined;
  let support: SupportInstance | undefined;
  let slotIndex = -1;
  for (const duelist of state.players) {
    const index = duelist.supportSlots.findIndex((slot) => slot?.instanceId === trapInstanceId);
    if (index >= 0) {
      owner = duelist;
      support = duelist.supportSlots[index]!;
      slotIndex = index;
      break;
    }
  }
  if (!owner || !support) {
    fail(ErrorCodes.INVALID_TARGET, "Armadilha não encontrada.");
  }
  const card = def(state, support.cardId);
  support.revealed = true;
  emit(state, EventTypes.TRAP_ACTIVATED, {
    cardId: card.id,
    cardName: card.name,
    playerId: owner.id,
  }, { actorId: owner.id, sourceInstanceId: support.instanceId });

  if (card.id === "BF-009") {
    const attackerId = state.pendingResolution?.attackerInstanceId;
    if (attackerId) {
      applyDamage(state, {
        sourceInstanceId: support.instanceId,
        sourcePlayerId: owner.id,
        sourceCardId: card.id,
        target: { kind: "UNIT", instanceId: attackerId },
        base: 400,
        origin: "TRAP",
      });
      const attacker = state.players.flatMap((entry) => entry.unitSlots).find((slot) => slot?.instanceId === attackerId);
      if (attacker && isFieldActive(state, "BF-010")) {
        applyStatus(state, attacker, "BURN", {
          instanceId: support.instanceId,
          cardId: card.id,
          playerId: owner.id,
        });
      }
    }
  }

  if (card.id === "MU-009") {
    const summonedId = state.pendingResolution?.summonedInstanceId;
    if (summonedId) {
      const summoned = state.players.flatMap((entry) => entry.unitSlots).find((slot) => slot?.instanceId === summonedId);
      if (summoned) {
        applyStatus(state, summoned, "STUN", {
          instanceId: support.instanceId,
          cardId: card.id,
          playerId: owner.id,
        });
        const summonedCard = def(state, summoned.cardId);
        if (summonedCard.types.includes("BEAST")) {
          let bonus = 0;
          if (isFieldActive(state, "MU-010")) {
            bonus = torreTrapDamageBonus(state, owner.id);
            if (bonus > 0) {
              consumeTorreTrapBonus(state);
            }
          }
          applyDamage(state, {
            sourceInstanceId: support.instanceId,
            sourcePlayerId: owner.id,
            sourceCardId: card.id,
            target: { kind: "UNIT", instanceId: summoned.instanceId },
            base: 200 + bonus,
            origin: "TRAP",
          });
          markExecutioner(state, owner.id, summoned.instanceId);
        }
      }
    }
  }

  if (support.extraEffects?.length && support.flags.weaverInstanceId) {
    const weaverId = String(support.flags.weaverInstanceId);
    const weaver = owner.unitSlots.find((slot) => slot?.instanceId === weaverId);
    if (weaver) {
      healUnit(state, weaver, 100, "SHADOW_WEAVING");
    }
  }

  triggerNerethTrapHeal(state, owner.id, card.category === "MAGIC_TRAP");

  owner.supportSlots[slotIndex] = null;
  owner.discard.push({
    instanceId: support.instanceId,
    cardId: support.cardId,
    ownerId: support.ownerId,
    controllerId: support.controllerId,
    zone: "DISCARD",
    revealed: true,
  });
}

function maybeWeaverBonus(
  state: GameState,
  playerId: PlayerId,
): { extraEffects?: SupportInstance["extraEffects"]; weaverInstanceId?: string } {
  const duelist = player(state, playerId);
  const weaver = duelist.unitSlots.find((slot) => slot?.cardId === "MU-002");
  if (!weaver || weaver.flags.weavingGranted) {
    return {};
  }
  weaver.flags.weavingGranted = true;
  return {
    weaverInstanceId: weaver.instanceId,
    extraEffects: [
      {
        id: "weaver-heal",
        timing: "ON_TRAP_ACTIVATED",
        operations: [{ kind: "HEAL", value: 100 }],
      },
    ],
  };
}

function triggerStaffOnSpell(state: GameState, playerId: PlayerId): void {
  const duelist = player(state, playerId);
  for (const unit of duelist.unitSlots) {
    if (!unit) {
      continue;
    }
    const staff = duelist.supportSlots.find(
      (slot) => slot?.cardId === "MU-008" && slot.equippedToInstanceId === unit.instanceId,
    );
    if (!staff) {
      continue;
    }
    const key = `staff-heal-${unit.instanceId}-${state.turnNumber}`;
    if (unit.flags[key]) {
      continue;
    }
    unit.flags[key] = true;
    healUnit(state, unit, 100, "BROKEN_VEIL_STAFF");
  }
}

function triggerNerethTrapHeal(state: GameState, playerId: PlayerId, isMagicTrap: boolean): void {
  if (!isMagicTrap) {
    return;
  }
  const duelist = player(state, playerId);
  const nereth = duelist.unitSlots.find((slot): slot is UnitInstance => slot?.cardId === "MU-006");
  if (!nereth) {
    return;
  }
  const key = `nereth-trap-heal-${nereth.instanceId}-${state.turnNumber}`;
  if (nereth.flags[key]) {
    return;
  }
  nereth.flags[key] = true;
  healUnit(state, nereth, 200, "NERETH_TRAP_HEAL");
}

function markExecutioner(state: GameState, sourcePlayerId: PlayerId, targetInstanceId: CardInstanceId): void {
  const enemyOfTarget = opponent(state, player(state, sourcePlayerId).id);
  void enemyOfTarget;
  const source = player(state, sourcePlayerId);
  for (const unit of source.unitSlots) {
    if (!unit || unit.cardId !== "MU-003") {
      continue;
    }
    const marked = Array.isArray(unit.flags.markedInstanceIds) ? [...(unit.flags.markedInstanceIds as string[])] : [];
    if (!marked.includes(targetInstanceId)) {
      marked.push(targetInstanceId);
    }
    unit.flags.markedInstanceIds = marked;
  }
}

export function resolveLookTop(state: GameState, playerId: PlayerId, optionId: string): void {
  const duelist = player(state, playerId);
  const top = duelist.deck[0];
  if (!top) {
    return;
  }
  if (optionId === "DISCARD") {
    duelist.deck.shift();
    top.zone = "DISCARD";
    top.revealed = true;
    duelist.discard.push(top);
    emit(state, EventTypes.CARD_DISCARDED, {
      instanceId: top.instanceId,
      cardId: top.cardId,
      cardName: def(state, top.cardId).name,
      reason: "VEIL_STUDY",
    });
  }
}

export function autoRecoverNerethTrap(state: GameState, playerId: PlayerId): void {
  const duelist = player(state, playerId);
  if (firstEmptySupportSlot(duelist) === undefined) {
    return;
  }
  const trap = duelist.discard.find((card) => def(state, card.cardId).category === "MAGIC_TRAP");
  if (!trap) {
    return;
  }
  setTrap(state, playerId, trap.instanceId, undefined, true);
}
