import { describe, expect, it } from "vitest";
import { executeCommand } from "../src/index.js";
import { P1, P2, cmd, deckWith, duelist, must, startScriptedDuel, unitOf } from "./helpers.js";

describe("Invocação", () => {
  it("Nível 1 custa 1 ação e entra em Estado de Invocação", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-001", "BF-001", "BF-001", "BF-002", "BF-002"]),
    });
    const card = duelist(state, P1).hand[0]!;
    const after = must(state, cmd("SUMMON_UNIT", P1, { instanceId: card.instanceId, slotIndex: 0 }));
    const unit = unitOf(after, P1, "BF-001")!;
    expect(unit.currentHp).toBe(600);
    expect(duelist(after, P1).actionsRemaining).toBe(2);
    const attack = executeCommand(
      after,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: unit.instanceId,
        attackId: "incandescent-bite",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(attack.ok).toBe(false);
    expect(attack.error?.code).toBe("SUMMON_SICKNESS");
  });

  it("Investida permite atacar no turno de Invocação", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-003", "BF-003", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-001", "MU-001", "MU-001"], "UMBRAL"),
    });
    const cao = duelist(state, P1).hand.find((card) => card.cardId === "BF-003")!;
    let current = must(state, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: cao.instanceId, slotIndex: 0 }));
    const unit = unitOf(current, P1, "BF-003")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: unit.instanceId,
        attackId: "volcanic-bite",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(duelist(current, P2).currentHp).toBe(3600);
    expect(unitOf(current, P1, "BF-003")?.statuses.some((status) => status.type === "BURN")).toBe(false);
  });

  it("campo cheio impede nova Invocação", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-001", "BF-001", "BF-001", "BF-002", "BF-002"]),
    });
    let current = state;
    for (let i = 0; i < 3; i += 1) {
      const card = duelist(current, P1).hand.find((entry) => entry.cardId === "BF-001")!;
      current = must(current, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
      current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: card.instanceId, slotIndex: i }));
    }
    const extra = duelist(current, P1).hand.find((entry) => entry.cardId === "BF-002")!;
    const failed = executeCommand(current, cmd("SUMMON_UNIT", P1, { instanceId: extra.instanceId, slotIndex: 0 }));
    expect(failed.ok).toBe(false);
    expect(["SLOT_OCCUPIED", "UNIT_ZONE_FULL"]).toContain(failed.error?.code);
  });
});

describe("Ataque e dano", () => {
  it("custa 1 ação, persiste dano e destrói em 0 PV", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-002", "BF-002", "BF-002", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-001", "MU-001", "MU-001"], "UMBRAL"),
    });
    const rasga = duelist(state, P1).hand.find((card) => card.cardId === "BF-002")!;
    let current = must(state, cmd("SUMMON_UNIT", P1, { instanceId: rasga.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P1));
    const aprendiz = duelist(current, P2).hand.find((card) => card.cardId === "MU-001")!;
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: aprendiz.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P2));
    const attacker = unitOf(current, P1, "BF-002")!;
    const defender = unitOf(current, P2, "MU-001")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: attacker.instanceId,
        attackId: "carbonized-claws",
        targetKind: "UNIT",
        targetInstanceId: defender.instanceId,
        targetPlayerId: P2,
      }),
    );
    expect(unitOf(current, P2, "MU-001")?.currentHp).toBe(200);
    current = must(current, cmd("END_TURN", P1));
    current = must(current, cmd("END_TURN", P2));
    const attacker2 = unitOf(current, P1, "BF-002")!;
    const defender2 = unitOf(current, P2, "MU-001")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: attacker2.instanceId,
        attackId: "carbonized-claws",
        targetKind: "UNIT",
        targetInstanceId: defender2.instanceId,
        targetPlayerId: P2,
      }),
    );
    expect(unitOf(current, P2, "MU-001")).toBeNull();
    expect(duelist(current, P2).discard.some((card) => card.cardId === "MU-001")).toBe(true);
    expect(duelist(current, P2).unitSlots[0]).toBeNull();
  });

  it("bloqueia ataque direto enquanto houver Unidade", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-002", "BF-002", "BF-002", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-001", "MU-001", "MU-001"], "UMBRAL"),
    });
    const rasga = duelist(state, P1).hand.find((card) => card.cardId === "BF-002")!;
    let current = must(state, cmd("SUMMON_UNIT", P1, { instanceId: rasga.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P1));
    const aprendiz = duelist(current, P2).hand.find((card) => card.cardId === "MU-001")!;
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: aprendiz.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P2));
    const attacker = unitOf(current, P1, "BF-002")!;
    const failed = executeCommand(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: attacker.instanceId,
        attackId: "carbonized-claws",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(failed.ok).toBe(false);
    expect(failed.error?.code).toBe("DIRECT_ATTACK_BLOCKED");
  });

  it("Perfuração transfere o excedente ao Duelista", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-003", "BF-006", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-001", "MU-001", "MU-001"], "UMBRAL"),
    });
    const beast = duelist(state, P1).hand.find((card) => card.cardId === "BF-003")!;
    let current = must(state, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: beast.instanceId, slotIndex: 0 }));
    const pyraxa = duelist(current, P1).hand.find((card) => card.cardId === "BF-006")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: pyraxa.instanceId, slotIndex: 1 }));
    current = must(current, cmd("END_TURN", P1));
    const aprendiz = duelist(current, P2).hand.find((card) => card.cardId === "MU-001")!;
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: aprendiz.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P2));
    const attacker = unitOf(current, P1, "BF-006")!;
    const defender = unitOf(current, P2, "MU-001")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: attacker.instanceId,
        attackId: "solar-jaw",
        targetKind: "UNIT",
        targetInstanceId: defender.instanceId,
        targetPlayerId: P2,
      }),
    );
    expect(unitOf(current, P2, "MU-001")).toBeNull();
    expect(duelist(current, P2).currentHp).toBe(4000 - (1100 - 500));
  });

  it("uma Unidade só ataca uma vez por turno", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-003", "BF-003", "BF-001", "BF-001"]),
    });
    const cao = duelist(state, P1).hand.find((card) => card.cardId === "BF-003")!;
    let current = must(state, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: cao.instanceId, slotIndex: 0 }));
    const unit = unitOf(current, P1, "BF-003")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: unit.instanceId,
        attackId: "volcanic-bite",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    const second = executeCommand(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: unit.instanceId,
        attackId: "volcanic-bite",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(second.ok).toBe(false);
    expect(second.error?.code).toBe("UNIT_ALREADY_ATTACKED");
  });
});

describe("Vitória", () => {
  it("encerra quando PV do Duelista chega a 0", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-003", "BF-003", "BF-001", "BF-001"]),
    });
    const cao = duelist(state, P1).hand.find((card) => card.cardId === "BF-003")!;
    let current = must(state, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: cao.instanceId, slotIndex: 0 }));
    current = must(current, cmd("DEBUG_SET_HP", P2, { hp: 100 }));
    const unit = unitOf(current, P1, "BF-003")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: unit.instanceId,
        attackId: "volcanic-bite",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(current.status).toBe("FINISHED");
    expect(current.result?.winnerId).toBe(P1);
    expect(current.result?.reason).toBe("LIFE_ZERO");
  });
});
