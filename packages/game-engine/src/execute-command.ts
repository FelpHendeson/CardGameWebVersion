import {
  ErrorCodes,
  type Command,
  type EngineResult,
  type GameState,
} from "@duelo/shared";
import { getCardDefinition } from "@duelo/game-data";
import { resolvePendingAttack } from "./combat.js";
import { declareAttack } from "./combat.js";
import { autoTrapInstanceIds, offerNextTrap } from "./decisions.js";
import { RuleViolation } from "./errors.js";
import { emit, EventTypes } from "./events.js";
import { cloneState, player } from "./state-utils.js";
import { autoRecoverNerethTrap, activateTrap, playEquipment, playField, playSpell, resolveLookTop, setTrap } from "./support-cards.js";
import { resolveOnSummonDecisions, summonUnit } from "./summon.js";
import { drawCards, endTurn } from "./turn.js";
import { endGame } from "./victory.js";

export function executeCommand(state: GameState, command: Command): EngineResult {
  if (state.status === "FINISHED") {
    return {
      ok: false,
      state,
      events: [],
      error: { code: ErrorCodes.GAME_NOT_ACTIVE, message: "A partida já foi encerrada." },
    };
  }

  try {
    const draft = cloneState(state);
    const start = draft.events.length;
    dispatch(draft, command);
    draft.stateVersion += 1;
    return {
      ok: true,
      state: draft,
      events: draft.events.slice(start),
    };
  } catch (error) {
    if (error instanceof RuleViolation) {
      return { ok: false, state, events: [], error: error.error };
    }
    throw error;
  }
}

function dispatch(state: GameState, command: Command): void {
  if (command.type.startsWith("DEBUG_")) {
    runDebug(state, command);
    return;
  }

  if (state.pendingDecision && command.type !== "RESOLVE_DECISION" && command.type !== "CONCEDE") {
    throw new RuleViolation(ErrorCodes.PENDING_DECISION, "Há uma decisão pendente.");
  }

  if (
    command.type !== "CONCEDE" &&
    command.type !== "RESOLVE_DECISION" &&
    command.playerId !== state.activePlayerId
  ) {
    throw new RuleViolation(ErrorCodes.NOT_YOUR_TURN, "Não é o seu turno.");
  }

  switch (command.type) {
    case "SUMMON_UNIT": {
      summonUnit(
        state,
        command.playerId,
        String(command.payload?.instanceId ?? ""),
        optionalNumber(command.payload?.slotIndex),
        optionalString(command.payload?.discardInstanceId),
      );
      autoResolveAfterSummon(state, command.playerId);
      break;
    }
    case "DECLARE_ATTACK": {
      const targetKind = command.payload?.targetKind === "DUELIST" ? "DUELIST" : "UNIT";
      declareAttack(state, command.playerId, String(command.payload?.instanceId ?? ""), String(command.payload?.attackId ?? ""), {
        kind: targetKind,
        instanceId: optionalString(command.payload?.targetInstanceId),
        playerId: String(command.payload?.targetPlayerId ?? ""),
      });
      autoResolveAfterAttack(state);
      break;
    }
    case "PLAY_SPELL":
      playSpell(state, command.playerId, String(command.payload?.instanceId ?? ""), optionalString(command.payload?.targetInstanceId));
      break;
    case "PLAY_EQUIPMENT":
      playEquipment(
        state,
        command.playerId,
        String(command.payload?.instanceId ?? ""),
        String(command.payload?.targetInstanceId ?? ""),
        optionalNumber(command.payload?.slotIndex),
      );
      break;
    case "SET_TRAP":
      setTrap(state, command.playerId, String(command.payload?.instanceId ?? ""), optionalNumber(command.payload?.slotIndex));
      break;
    case "PLAY_FIELD":
      playField(state, command.playerId, String(command.payload?.instanceId ?? ""));
      break;
    case "END_TURN":
      endTurn(state, command.playerId);
      break;
    case "CONCEDE": {
      const loser = command.playerId;
      const winner = state.players.find((entry) => entry.id !== loser)?.id;
      if (!winner) {
        throw new RuleViolation(ErrorCodes.INVALID_COMMAND, "Adversário não encontrado.");
      }
      endGame(state, winner, loser, "SURRENDER");
      break;
    }
    case "RESOLVE_DECISION":
      resolveDecision(state, command.playerId, String(command.payload?.optionId ?? ""));
      break;
    case "START_GAME":
      throw new RuleViolation(ErrorCodes.GAME_ALREADY_STARTED, "A partida já foi iniciada.");
    default:
      throw new RuleViolation(ErrorCodes.INVALID_COMMAND, "Comando desconhecido.", { type: command.type });
  }
}

function autoResolveAfterSummon(state: GameState, summonerId: string): void {
  if (state.decisionPolicy === "AUTO_ACCEPT") {
    const defenderId = state.players.find((entry) => entry.id !== summonerId)?.id;
    if (defenderId) {
      for (const trapId of [...autoTrapInstanceIds(state, defenderId)]) {
        activateTrap(state, trapId);
      }
      if (state.pendingResolution) {
        state.pendingResolution.remainingTrapInstanceIds = [];
      }
    }
    const summoned = state.pendingResolution?.summonedInstanceId;
    const summonedUnit = summoned
      ? state.players.flatMap((entry) => entry.unitSlots).find((slot) => slot?.instanceId === summoned)
      : undefined;
    if (summonedUnit?.cardId === "MU-001") {
      resolveLookTop(state, summonerId, "KEEP");
    }
    if (summonedUnit?.cardId === "MU-006") {
      autoRecoverNerethTrap(state, summonerId);
    }
    state.pendingResolution = undefined;
    state.pendingDecision = undefined;
    return;
  }
  if (!state.pendingDecision && state.pendingResolution?.kind === "SUMMON") {
    const summonedUnit = state.players
      .flatMap((entry) => entry.unitSlots)
      .find((slot) => slot?.instanceId === state.pendingResolution?.summonedInstanceId);
    if (summonedUnit?.cardId === "MU-006") {
      autoRecoverNerethTrap(state, summonerId);
    }
    if (!state.pendingDecision) {
      state.pendingResolution = undefined;
    }
  }
}

function autoResolveAfterAttack(state: GameState): void {
  if (state.decisionPolicy !== "AUTO_ACCEPT") {
    return;
  }
  const defenderId = state.pendingResolution?.targetPlayerId
    ?? state.players.find((entry) => entry.id !== state.pendingResolution?.actorId)?.id;
  if (defenderId) {
    for (const trapId of [...autoTrapInstanceIds(state, defenderId)]) {
      activateTrap(state, trapId);
    }
  }
  if (state.pendingResolution) {
    state.pendingResolution.remainingTrapInstanceIds = [];
  }
  state.pendingDecision = undefined;
  resolvePendingAttack(state);
}

function resolveDecision(state: GameState, playerId: string, optionId: string): void {
  const decision = state.pendingDecision;
  if (!decision || decision.playerId !== playerId) {
    throw new RuleViolation(ErrorCodes.INVALID_DECISION, "Decisão inválida.");
  }
  emit(state, EventTypes.DECISION_RESOLVED, { type: decision.type, optionId, playerId });
  state.pendingDecision = undefined;

  if (decision.type === "LOOK_TOP_DECK") {
    resolveLookTop(state, playerId, optionId);
    if (!state.pendingDecision && state.pendingResolution?.kind === "SUMMON" && !state.pendingResolution.remainingTrapInstanceIds.length) {
      state.pendingResolution = undefined;
    }
    return;
  }

  if (decision.type === "CHOOSE_DISCARD_CARD") {
    if (optionId !== "PASS") {
      setTrap(state, playerId, optionId, undefined, true);
    }
    state.pendingResolution = undefined;
    return;
  }

  if (decision.type === "OPTIONAL_TRAP") {
    const trapInstanceId = String(decision.context.trapInstanceId ?? "");
    if (optionId === "ACTIVATE") {
      activateTrap(state, trapInstanceId);
    }
    if (state.pendingResolution) {
      state.pendingResolution.remainingTrapInstanceIds = state.pendingResolution.remainingTrapInstanceIds.filter(
        (id) => id !== trapInstanceId,
      );
    }
    const remaining = state.pendingResolution?.remainingTrapInstanceIds ?? [];
    if (remaining.length > 0) {
      offerNextTrap(state, playerId, String(decision.context.sourceInstanceId ?? ""));
      return;
    }
    if (state.pendingResolution?.kind === "ATTACK") {
      resolvePendingAttack(state);
    } else if (state.pendingResolution?.kind === "SUMMON") {
      const summonedId = state.pendingResolution.summonedInstanceId;
      const summoned = summonedId
        ? state.players.flatMap((entry) => entry.unitSlots).find((slot) => slot?.instanceId === summonedId)
        : undefined;
      state.pendingResolution = undefined;
      if (summoned) {
        resolveOnSummonDecisions(state, summoned);
      }
    } else {
      state.pendingResolution = undefined;
    }
  }
}

function runDebug(state: GameState, command: Command): void {
  if (!state.debug) {
    throw new RuleViolation(ErrorCodes.DEBUG_DISABLED, "Comandos de debug estão desativados.");
  }
  const duelist = player(state, command.playerId);
  switch (command.type) {
    case "DEBUG_DRAW":
      drawCards(state, command.playerId, Number(command.payload?.amount ?? 1), "DEBUG");
      break;
    case "DEBUG_SET_HP": {
      const targetInstanceId = optionalString(command.payload?.instanceId);
      const amount = Number(command.payload?.hp ?? 0);
      if (targetInstanceId) {
        const unit = state.players
          .flatMap((entry) => entry.unitSlots)
          .find((slot) => slot?.instanceId === targetInstanceId);
        if (unit) {
          if (amount < unit.currentHp) {
            unit.damageTakenTotal += unit.currentHp - amount;
          }
          unit.currentHp = Math.max(0, amount);
        }
      } else {
        const targetPlayerId = optionalString(command.payload?.targetPlayerId) ?? command.playerId;
        player(state, targetPlayerId).currentHp = Math.max(0, amount);
      }
      break;
    }
    case "DEBUG_ADD_TO_HAND": {
      const cardId = String(command.payload?.cardId ?? "");
      getCardDefinition(cardId);
      state.cardCounter += 1;
      duelist.hand.push({
        instanceId: `${state.id}-c${state.cardCounter}`,
        cardId,
        ownerId: duelist.id,
        controllerId: duelist.id,
        zone: "HAND",
        revealed: true,
      });
      break;
    }
    case "DEBUG_SET_ACTIONS":
      duelist.actionsRemaining = Math.max(0, Number(command.payload?.actions ?? 0));
      break;
    default:
      throw new RuleViolation(ErrorCodes.INVALID_COMMAND, "Comando de debug desconhecido.");
  }
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
