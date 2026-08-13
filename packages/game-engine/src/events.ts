import { EventTypes, type DuelEvent, type GameState, type PlayerId } from "@duelo/shared";

export function emit(
  state: GameState,
  type: string,
  payload: Record<string, unknown> = {},
  extra?: {
    actorId?: PlayerId;
    sourceInstanceId?: string;
    targetIds?: string[];
  },
): DuelEvent {
  state.eventCounter += 1;
  const event: DuelEvent = {
    eventId: `${state.id}-e${state.eventCounter}`,
    sequence: state.eventCounter,
    turn: state.turnNumber,
    type,
    actorId: extra?.actorId,
    sourceInstanceId: extra?.sourceInstanceId,
    targetIds: extra?.targetIds,
    payload,
  };
  state.events.push(event);
  return event;
}

export { EventTypes };
