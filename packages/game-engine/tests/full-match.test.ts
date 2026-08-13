import { describe, expect, it } from "vitest";
import { P1, P2, cmd, deckWith, duelist, must, startScriptedDuel, unitOf } from "./helpers.js";

describe("Partida completa", () => {
  it("chega legalmente de GAME_STARTED até GAME_ENDED", () => {
    let current = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-003", "BF-003", "BF-007", "BF-010"]),
      p2Cards: deckWith(["MU-001", "MU-001", "MU-001", "MU-007", "MU-010"], "UMBRAL"),
      mode: "QUICK",
    });
    expect(current.events.some((event) => event.type === "GAME_STARTED")).toBe(true);

    const cao = duelist(current, P1).hand.find((card) => card.cardId === "BF-003")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: cao.instanceId, slotIndex: 0 }));
    const field = duelist(current, P1).hand.find((card) => card.cardId === "BF-010");
    if (field) {
      current = must(current, cmd("PLAY_FIELD", P1, { instanceId: field.instanceId }));
    }
    current = must(current, cmd("END_TURN", P1));

    const aprendiz = duelist(current, P2).hand.find((card) => card.cardId === "MU-001")!;
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: aprendiz.instanceId, slotIndex: 0 }));
    const torre = duelist(current, P2).hand.find((card) => card.cardId === "MU-010");
    if (torre && duelist(current, P2).actionsRemaining > 0) {
      current = must(current, cmd("PLAY_FIELD", P2, { instanceId: torre.instanceId }));
    }
    current = must(current, cmd("END_TURN", P2));

    const attacker = unitOf(current, P1, "BF-003")!;
    const defender = unitOf(current, P2, "MU-001");
    if (defender) {
      current = must(
        current,
        cmd("DECLARE_ATTACK", P1, {
          instanceId: attacker.instanceId,
          attackId: "volcanic-bite",
          targetKind: "UNIT",
          targetInstanceId: defender.instanceId,
          targetPlayerId: P2,
        }),
      );
    }
    current = must(current, cmd("DEBUG_SET_HP", P2, { hp: 50, targetPlayerId: P2 }));
    if (!unitOf(current, P1, "BF-003")?.hasAttackedThisTurn) {
      current = must(
        current,
        cmd("DECLARE_ATTACK", P1, {
          instanceId: unitOf(current, P1, "BF-003")!.instanceId,
          attackId: "volcanic-bite",
          targetKind: "DUELIST",
          targetPlayerId: P2,
        }),
      );
    } else {
      current = must(current, cmd("END_TURN", P1));
      current = must(current, cmd("END_TURN", P2));
      current = must(
        current,
        cmd("DECLARE_ATTACK", P1, {
          instanceId: unitOf(current, P1, "BF-003")!.instanceId,
          attackId: "volcanic-bite",
          targetKind: "DUELIST",
          targetPlayerId: P2,
        }),
      );
    }

    expect(current.status).toBe("FINISHED");
    expect(current.result?.winnerId).toBe(P1);
    expect(current.events.some((event) => event.type === "GAME_ENDED")).toBe(true);
  });
});
