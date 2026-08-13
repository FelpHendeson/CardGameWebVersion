import type {
  CardInstanceId,
  GameState,
  LegalAction,
  PlayerId,
  TargetOption,
  UnitInstance,
} from "@duelo/shared";
import { def } from "./catalog.js";
import { computeAttack } from "./combat.js";
import { computeMaxHp, hasNoIdentity } from "./continuous.js";
import {
  canDirectAttack,
  controlledUnits,
  firstEmptySupportSlot,
  firstEmptyUnitSlot,
  hasSummonSickness,
  isFireBeastUnit,
  isStunned,
  opponent,
  player,
} from "./state-utils.js";

export function getLegalActions(state: GameState, playerId: PlayerId): LegalAction[] {
  if (state.status === "FINISHED") {
    return [];
  }
  if (state.pendingDecision) {
    if (state.pendingDecision.playerId !== playerId) {
      return [];
    }
    return state.pendingDecision.options.map((option) => ({
      type: "RESOLVE_DECISION",
      label: option.label,
      instanceId: option.instanceId,
      payload: { decisionId: state.pendingDecision!.id, optionId: option.id },
    }));
  }
  if (state.activePlayerId !== playerId) {
    return [{ type: "CONCEDE", label: "Desistir" }];
  }

  const duelist = player(state, playerId);
  const actions: LegalAction[] = [
    { type: "END_TURN", label: "Encerrar turno" },
    { type: "CONCEDE", label: "Desistir" },
  ];

  for (const card of duelist.hand) {
    const definition = def(state, card.cardId);
    if (definition.category === "UNIT" && definition.summon) {
      const canAfford = duelist.actionsRemaining >= definition.summon.actionCost;
      const hasSlot = firstEmptyUnitSlot(duelist) !== undefined;
      const requirementOk = canSummon(state, playerId, card.cardId);
      if (canAfford && hasSlot && requirementOk) {
        actions.push({
          type: "SUMMON_UNIT",
          label: `Invocar ${definition.name}`,
          instanceId: card.instanceId,
          requiresSlot: "UNIT",
        });
      }
    }
    if (definition.category === "SPELL" && duelist.actionsRemaining >= (definition.play?.actionCost ?? 1)) {
      actions.push({
        type: "PLAY_SPELL",
        label: `Usar ${definition.name}`,
        instanceId: card.instanceId,
        requiresTarget: true,
      });
    }
    if (
      (definition.category === "EQUIPMENT" || definition.category === "MAGIC_EQUIPMENT") &&
      duelist.actionsRemaining >= (definition.play?.actionCost ?? 1) &&
      firstEmptySupportSlot(duelist) !== undefined
    ) {
      actions.push({
        type: "PLAY_EQUIPMENT",
        label: `Equipar ${definition.name}`,
        instanceId: card.instanceId,
        requiresTarget: true,
        requiresSlot: "SUPPORT",
      });
    }
    if (
      (definition.category === "TRAP" || definition.category === "MAGIC_TRAP") &&
      duelist.actionsRemaining >= (definition.play?.actionCost ?? 1) &&
      firstEmptySupportSlot(duelist) !== undefined
    ) {
      actions.push({
        type: "SET_TRAP",
        label: `Preparar ${definition.name}`,
        instanceId: card.instanceId,
        requiresSlot: "SUPPORT",
      });
    }
    if (definition.category === "FIELD" && duelist.actionsRemaining >= (definition.play?.actionCost ?? 1)) {
      actions.push({
        type: "PLAY_FIELD",
        label: `Jogar ${definition.name}`,
        instanceId: card.instanceId,
      });
    }
  }

  for (const unit of controlledUnits(state, playerId)) {
    const card = def(state, unit.cardId);
    if (isStunned(unit) || hasSummonSickness(state, unit, card.keywords) || unit.hasAttackedThisTurn) {
      continue;
    }
    for (const attack of card.attacks ?? []) {
      if (duelist.actionsRemaining < attack.actionCost) {
        continue;
      }
      if (attack.id === "thermal-frenzy" && unit.damageTakenTotal < 300) {
        continue;
      }
      actions.push({
        type: "DECLARE_ATTACK",
        label: `${card.name}: ${attack.name}`,
        instanceId: unit.instanceId,
        attackId: attack.id,
        requiresTarget: true,
      });
    }
  }

  return actions;
}

export function getValidTargets(
  state: GameState,
  playerId: PlayerId,
  action: { type: string; instanceId?: CardInstanceId; attackId?: string },
): TargetOption[] {
  const duelist = player(state, playerId);
  const enemy = opponent(state, playerId);

  if (action.type === "SUMMON_UNIT") {
    return duelist.unitSlots.map((slot, index) => ({
      kind: "SLOT" as const,
      id: `unit-slot-${index}`,
      playerId,
      slotIndex: index,
      valid: slot === null,
      reason: slot ? "Ocupado" : undefined,
    }));
  }

  if (action.type === "SET_TRAP" || action.type === "PLAY_EQUIPMENT") {
    const slots: TargetOption[] = duelist.supportSlots.map((slot, index) => ({
      kind: "SLOT" as const,
      id: `support-slot-${index}`,
      playerId,
      slotIndex: index,
      valid: slot === null,
      reason: slot ? "Ocupado" : undefined,
    }));
    if (action.type === "PLAY_EQUIPMENT") {
      const card = action.instanceId ? duelist.hand.find((entry) => entry.instanceId === action.instanceId) : undefined;
      const definition = card ? def(state, card.cardId) : undefined;
      for (const unit of controlledUnits(state, playerId)) {
        const unitCard = def(state, unit.cardId);
        let valid = true;
        let reason: string | undefined;
        if (definition?.id === "MU-008" && (!unitCard.types.includes("MAGE") || hasNoIdentity(state, unit))) {
          valid = false;
          reason = "Incompatível";
        }
        slots.push({
          kind: "UNIT",
          id: unit.instanceId,
          playerId,
          instanceId: unit.instanceId,
          valid,
          reason,
        });
      }
    }
    return slots;
  }

  if (action.type === "PLAY_SPELL") {
    const card = duelist.hand.find((entry) => entry.instanceId === action.instanceId);
    if (!card) {
      return [];
    }
    if (card.cardId === "BF-007") {
      return controlledUnits(state, playerId).map((unit) => {
        const unitCard = def(state, unit.cardId);
        const valid = isFireBeastUnit(unitCard.types, unitCard.archetype);
        return {
          kind: "UNIT" as const,
          id: unit.instanceId,
          playerId,
          instanceId: unit.instanceId,
          valid,
          reason: valid ? undefined : "Apenas Bestas de Fogo",
        };
      });
    }
    if (card.cardId === "MU-007") {
      return allBoardUnits(state).map((unit) => ({
        kind: "UNIT" as const,
        id: unit.instanceId,
        playerId: unit.controllerId,
        instanceId: unit.instanceId,
        valid: true,
      }));
    }
  }

  if (action.type === "DECLARE_ATTACK" && action.instanceId && action.attackId) {
    const attacker = controlledUnits(state, playerId).find((unit) => unit.instanceId === action.instanceId);
    if (!attacker) {
      return [];
    }
    const targets: TargetOption[] = [];
    for (const unit of enemy.unitSlots) {
      if (!unit) {
        continue;
      }
      targets.push({
        kind: "UNIT",
        id: unit.instanceId,
        playerId: enemy.id,
        instanceId: unit.instanceId,
        valid: true,
      });
    }
    const direct = canDirectAttack(state, enemy.id);
    targets.push({
      kind: "DUELIST",
      id: enemy.id,
      playerId: enemy.id,
      valid: direct,
      reason: direct ? undefined : "Protegido por Unidades",
    });
    return targets;
  }

  return [];
}

export function previewAttackDamage(
  state: GameState,
  attackerInstanceId: CardInstanceId,
  attackId: string,
  target: { kind: "UNIT" | "DUELIST"; instanceId?: CardInstanceId; playerId: PlayerId },
): number | undefined {
  const attacker = allBoardUnits(state).find((unit) => unit.instanceId === attackerInstanceId);
  if (!attacker) {
    return undefined;
  }
  const attack = def(state, attacker.cardId).attacks?.find((entry) => entry.id === attackId);
  if (!attack) {
    return undefined;
  }
  return computeAttack(state, attacker, attack, target).damage;
}

export function unitViewFlags(state: GameState, unit: UnitInstance) {
  const card = def(state, unit.cardId);
  return {
    summonSickness: hasSummonSickness(state, unit, card.keywords),
    stunned: isStunned(unit),
    burned: unit.statuses.some((status) => status.type === "BURN"),
    poisoned: unit.statuses.some((status) => status.type === "POISON" || status.type === "SHADOW_POISON"),
    protected: unit.statuses.some((status) => status.type === "PROTECTION"),
    hasAttacked: unit.hasAttackedThisTurn,
    canAttack: !isStunned(unit) && !hasSummonSickness(state, unit, card.keywords) && !unit.hasAttackedThisTurn,
    currentHp: unit.currentHp,
    maxHp: computeMaxHp(state, unit),
    equipments: unit.equipmentInstanceIds,
  };
}

function canSummon(state: GameState, playerId: PlayerId, cardId: string): boolean {
  const duelist = player(state, playerId);
  if (cardId === "BF-006") {
    const controls = controlledUnits(state, playerId).some((unit) => {
      const ally = def(state, unit.cardId);
      return isFireBeastUnit(ally.types, ally.archetype) && (ally.level ?? 0) >= 3;
    });
    if (controls) {
      return true;
    }
    return duelist.hand.some((card) => {
      const definition = def(state, card.cardId);
      return (
        definition.category === "UNIT" &&
        isFireBeastUnit(definition.types, definition.archetype) &&
        (definition.level ?? 0) >= 3
      );
    });
  }
  if (cardId === "MU-006") {
    return duelist.discard.some((card) => {
      const definition = def(state, card.cardId);
      return definition.category === "SPELL" || definition.category === "MAGIC_TRAP";
    });
  }
  return true;
}

function allBoardUnits(state: GameState): UnitInstance[] {
  return state.players.flatMap((entry) => entry.unitSlots.filter((slot): slot is UnitInstance => slot !== null));
}
