export { createDuel } from "./create-duel.js";
export { executeCommand } from "./execute-command.js";
export { getLegalActions, getValidTargets, previewAttackDamage, unitViewFlags } from "./queries.js";
export { computeMaxHp } from "./continuous.js";
export { createRng, hashSeed, shuffleInPlace } from "./rng.js";
export { RuleViolation } from "./errors.js";

import type { Command, EngineResult, GameState } from "@duelo/shared";
import { executeCommand } from "./execute-command.js";

export function replay(initialState: GameState, commands: Command[]): EngineResult {
  let state = initialState;
  const events = [...initialState.events];
  for (const command of commands) {
    const result = executeCommand(state, command);
    if (!result.ok) {
      return result;
    }
    state = result.state;
    events.push(...result.events);
  }
  return { ok: true, state, events };
}
