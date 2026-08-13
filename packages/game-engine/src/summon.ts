import { ErrorCodes, type CardInstanceId, type GameState, type PlayerId, type UnitInstance } from "@duelo/shared";
import { def } from "./catalog.js";
import { computeMaxHp } from "./continuous.js";
import { fail } from "./errors.js";
import { emit, EventTypes } from "./events.js";
import { requestLookTop, requestNerethRecover, maybeOfferSummonTraps } from "./decisions.js";
import {
  controlledUnits,
  emptyUnitSlot,
  firstEmptyUnitSlot,
  isFireBeastUnit,
  player,
  removeFromHand,
  requireCardInHand,
  spendActions,
} from "./state-utils.js";
import { healUnit } from "./damage.js";

export function summonUnit(
  state: GameState,
  playerId: PlayerId,
  instanceId: CardInstanceId,
  slotIndex?: number,
  discardInstanceId?: CardInstanceId,
): void {
  const duelist = player(state, playerId);
  const cardInstance = requireCardInHand(duelist, instanceId);
  const card = def(state, cardInstance.cardId);
  if (card.category !== "UNIT" || !card.summon || card.level === undefined || card.maxHp === undefined) {
    fail(ErrorCodes.INVALID_CARD_TYPE, "Esta carta não é uma Unidade invocável.", { cardId: card.id });
  }

  const cost = card.summon.actionCost;
  if (duelist.actionsRemaining < cost) {
    fail(ErrorCodes.INSUFFICIENT_ACTIONS, "Ações insuficientes para Invocar.", { required: cost });
  }

  const slot = slotIndex ?? firstEmptyUnitSlot(duelist);
  if (slot === undefined) {
    fail(ErrorCodes.UNIT_ZONE_FULL, "Não há espaço de Unidade disponível.");
  }
  if (!emptyUnitSlot(duelist, slot)) {
    fail(ErrorCodes.SLOT_OCCUPIED, "O espaço escolhido já está ocupado.", { slotIndex: slot });
  }

  validateSummonRequirements(state, playerId, card.id, discardInstanceId);

  spendActions(state, playerId, cost);

  if (discardInstanceId) {
    const discarded = removeFromHand(duelist, discardInstanceId);
    discarded.zone = "DISCARD";
    discarded.revealed = true;
    duelist.discard.push(discarded);
    emit(state, EventTypes.CARD_DISCARDED, {
      instanceId: discarded.instanceId,
      cardId: discarded.cardId,
      cardName: def(state, discarded.cardId).name,
      reason: "SUMMON_REQUIREMENT",
    });
  }

  const moved = removeFromHand(duelist, instanceId);
  const unit: UnitInstance = {
    instanceId: moved.instanceId,
    cardId: moved.cardId,
    ownerId: moved.ownerId,
    controllerId: playerId,
    slotIndex: slot,
    currentHp: card.maxHp,
    maxHpBase: card.maxHp,
    summonedOnTurn: state.turnNumber,
    hasAttackedThisTurn: false,
    statuses: [],
    temporaryEffects: [],
    equipmentInstanceIds: [],
    damageTakenTotal: 0,
    flags: {},
  };
  duelist.unitSlots[slot] = unit;
  unit.currentHp = computeMaxHp(state, unit);

  emit(
    state,
    EventTypes.CARD_SUMMONED,
    {
      instanceId: unit.instanceId,
      cardId: unit.cardId,
      cardName: card.name,
      playerId,
      slotIndex: slot,
      currentHp: unit.currentHp,
      maxHp: computeMaxHp(state, unit),
      summonSickness: !card.keywords?.includes("CHARGE"),
    },
    { actorId: playerId, sourceInstanceId: unit.instanceId },
  );

  resolveOnSummonEffects(state, unit);
  maybeOfferSummonTraps(state, playerId, unit.instanceId);
  if (!state.pendingDecision) {
    resolveOnSummonDecisions(state, unit);
  }
}

function validateSummonRequirements(
  state: GameState,
  playerId: PlayerId,
  cardId: string,
  discardInstanceId?: CardInstanceId,
): void {
  const duelist = player(state, playerId);
  if (cardId === "BF-006") {
    const controlsQualified = controlledUnits(state, playerId).some((unit) => {
      const ally = def(state, unit.cardId);
      return isFireBeastUnit(ally.types, ally.archetype) && (ally.level ?? 0) >= 3;
    });
    if (controlsQualified) {
      return;
    }
    if (!discardInstanceId) {
      fail(ErrorCodes.REQUIREMENT_NOT_MET, "Pyraxa exige controlar ou descartar uma Besta de Fogo de Nível 3+.");
    }
    const fromHand = duelist.hand.find((card) => card.instanceId === discardInstanceId);
    if (!fromHand) {
      fail(ErrorCodes.REQUIREMENT_NOT_MET, "Carta de descarte inválida para Invocar Pyraxa.");
    }
    const discarded = def(state, fromHand.cardId);
    if (
      discarded.category !== "UNIT" ||
      !isFireBeastUnit(discarded.types, discarded.archetype) ||
      (discarded.level ?? 0) < 3
    ) {
      fail(ErrorCodes.REQUIREMENT_NOT_MET, "O descarte precisa ser uma Besta de Fogo de Nível 3+.");
    }
    return;
  }

  if (cardId === "MU-006") {
    const ok = duelist.discard.some((card) => {
      const definition = def(state, card.cardId);
      return definition.category === "SPELL" || definition.category === "MAGIC_TRAP";
    });
    if (!ok) {
      fail(ErrorCodes.REQUIREMENT_NOT_MET, "Nereth exige ao menos uma Magia ou Armadilha Mágica no Descarte.");
    }
  }
}

function resolveOnSummonEffects(state: GameState, unit: UnitInstance): void {
  if (unit.cardId === "BF-006") {
    for (const ally of controlledUnits(state, unit.controllerId)) {
      if (ally.instanceId === unit.instanceId) {
        continue;
      }
      const allyCard = def(state, ally.cardId);
      if (isFireBeastUnit(allyCard.types, allyCard.archetype)) {
        healUnit(state, ally, 300, "PYRAXA_SUMMON");
      }
    }
  }
}

export function resolveOnSummonDecisions(state: GameState, unit: UnitInstance): void {
  if (unit.cardId === "MU-001") {
    requestLookTop(state, unit.controllerId, unit.instanceId);
  }
  if (unit.cardId === "MU-006") {
    requestNerethRecover(state, unit.controllerId, unit.instanceId);
  }
}
