import type { CardInstanceId, GameState, PendingDecision, PlayerId, SupportInstance } from "@duelo/shared";
import { def } from "./catalog.js";
import { emit, EventTypes } from "./events.js";
import { opponent, player } from "./state-utils.js";
import { autoRecoverNerethTrap } from "./support-cards.js";

export function maybeOfferAttackTraps(state: GameState, attackerPlayerId: PlayerId, attackerInstanceId: CardInstanceId): void {
  const defender = opponent(state, attackerPlayerId);
  const traps = defender.supportSlots.filter(
    (slot): slot is SupportInstance =>
      !!slot && (slot.category === "TRAP" || slot.category === "MAGIC_TRAP") && !slot.revealed,
  ).filter((trap) => {
    const card = def(state, trap.cardId);
    return card.play?.trigger?.kind === "ON_ATTACK_DECLARED" && card.play.trigger.enemyOnly !== false;
  });
  queueTraps(state, defender.id, traps, attackerInstanceId);
}

export function maybeOfferSummonTraps(state: GameState, summonerId: PlayerId, summonedInstanceId: CardInstanceId): void {
  const defender = opponent(state, summonerId);
  const traps = defender.supportSlots.filter(
    (slot): slot is SupportInstance =>
      !!slot && (slot.category === "TRAP" || slot.category === "MAGIC_TRAP") && !slot.revealed,
  ).filter((trap) => {
    const card = def(state, trap.cardId);
    return card.play?.trigger?.kind === "ON_UNIT_SUMMONED" && card.play.trigger.enemyOnly !== false;
  });
  if (!state.pendingResolution) {
    state.pendingResolution = {
      kind: "SUMMON",
      actorId: summonerId,
      summonedInstanceId,
      remainingTrapInstanceIds: [],
    };
  } else {
    state.pendingResolution.summonedInstanceId = summonedInstanceId;
  }
  queueTraps(state, defender.id, traps, summonedInstanceId);
}

function queueTraps(
  state: GameState,
  controllerId: PlayerId,
  traps: SupportInstance[],
  sourceInstanceId: CardInstanceId,
): void {
  if (traps.length === 0) {
    return;
  }
  const ids = traps.map((trap) => trap.instanceId);
  if (!state.pendingResolution) {
    state.pendingResolution = {
      kind: "ATTACK",
      actorId: state.activePlayerId,
      remainingTrapInstanceIds: ids,
    };
  } else {
    state.pendingResolution.remainingTrapInstanceIds = ids;
  }
  offerNextTrap(state, controllerId, sourceInstanceId);
}

export function offerNextTrap(state: GameState, controllerId: PlayerId, sourceInstanceId?: CardInstanceId): void {
  const remaining = state.pendingResolution?.remainingTrapInstanceIds ?? [];
  const nextId = remaining[0];
  if (!nextId) {
    return;
  }
  const trap = player(state, controllerId).supportSlots.find((slot) => slot?.instanceId === nextId);
  if (!trap) {
    state.pendingResolution!.remainingTrapInstanceIds = remaining.slice(1);
    offerNextTrap(state, controllerId, sourceInstanceId);
    return;
  }
  const card = def(state, trap.cardId);
  if (state.decisionPolicy === "AUTO_ACCEPT") {
    return;
  }
  const decision: PendingDecision = {
    id: `${state.id}-d-${state.eventCounter + 1}`,
    type: "OPTIONAL_TRAP",
    playerId: controllerId,
    prompt: `Ativar ${card.name}?`,
    options: [
      { id: "ACTIVATE", label: "Ativar", instanceId: trap.instanceId },
      { id: "PASS", label: "Não ativar", instanceId: trap.instanceId },
    ],
    context: {
      trapInstanceId: trap.instanceId,
      sourceInstanceId,
    },
  };
  state.pendingDecision = decision;
  emit(state, EventTypes.DECISION_REQUESTED, {
    type: decision.type,
    playerId: controllerId,
    cardName: card.name,
  });
}

export function requestLookTop(state: GameState, playerId: PlayerId, sourceInstanceId: CardInstanceId): void {
  const duelist = player(state, playerId);
  const top = duelist.deck[0];
  if (!top) {
    return;
  }
  emit(state, EventTypes.TOP_CARD_LOOKED, { playerId, instanceId: top.instanceId }, { actorId: playerId });
  if (state.decisionPolicy === "AUTO_ACCEPT") {
    return;
  }
  const card = def(state, top.cardId);
  state.pendingDecision = {
    id: `${state.id}-d-look-${state.eventCounter + 1}`,
    type: "LOOK_TOP_DECK",
    playerId,
    prompt: `Topo do Deck: ${card.name}. Manter ou descartar?`,
    options: [
      { id: "KEEP", label: "Manter no topo", instanceId: top.instanceId },
      { id: "DISCARD", label: "Enviar ao Descarte", instanceId: top.instanceId },
    ],
    context: { sourceInstanceId, instanceId: top.instanceId, cardId: top.cardId },
  };
  emit(state, EventTypes.DECISION_REQUESTED, { type: "LOOK_TOP_DECK", playerId });
}

export function requestNerethRecover(state: GameState, playerId: PlayerId, sourceInstanceId: CardInstanceId): void {
  const duelist = player(state, playerId);
  const traps = duelist.discard.filter((card) => def(state, card.cardId).category === "MAGIC_TRAP");
  if (traps.length === 0) {
    return;
  }
  if (state.decisionPolicy === "AUTO_ACCEPT" || traps.length === 1) {
    autoRecoverNerethTrap(state, playerId);
    return;
  }
  state.pendingDecision = {
    id: `${state.id}-d-nereth-${state.eventCounter + 1}`,
    type: "CHOOSE_DISCARD_CARD",
    playerId,
    prompt: "Escolha uma Armadilha Mágica do Descarte para preparar sem Ação.",
    options: [
      ...traps.map((card) => ({
        id: card.instanceId,
        label: def(state, card.cardId).name,
        instanceId: card.instanceId,
      })),
      { id: "PASS", label: "Não preparar" },
    ],
    context: { sourceInstanceId },
  };
  emit(state, EventTypes.DECISION_REQUESTED, { type: "CHOOSE_DISCARD_CARD", playerId });
}

export function autoTrapInstanceIds(state: GameState, controllerId: PlayerId): string[] {
  return state.pendingResolution?.remainingTrapInstanceIds?.filter((id) =>
    player(state, controllerId).supportSlots.some((slot) => slot?.instanceId === id),
  ) ?? [];
}
