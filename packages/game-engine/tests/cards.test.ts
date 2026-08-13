import { describe, expect, it } from "vitest";
import { executeCommand } from "../src/index.js";
import { P1, P2, cmd, deckWith, duelist, must, startScriptedDuel, unitOf } from "./helpers.js";

describe("Rasga-Cinzas", () => {
  it("Frenesi Térmico exige 300 de dano sofrido e Ferocidade ativa em metade dos PV", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-002", "BF-002", "BF-002", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-001", "MU-001", "MU-001"], "UMBRAL"),
    });
    const rasga = duelist(state, P1).hand.find((card) => card.cardId === "BF-002")!;
    let current = must(state, cmd("SUMMON_UNIT", P1, { instanceId: rasga.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P1));
    current = must(current, cmd("END_TURN", P2));
    const unit = unitOf(current, P1, "BF-002")!;
    const blocked = executeCommand(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: unit.instanceId,
        attackId: "thermal-frenzy",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(blocked.ok).toBe(false);
    expect(blocked.error?.code).toBe("REQUIREMENT_NOT_MET");
    current = must(current, cmd("DEBUG_SET_HP", P1, { instanceId: unit.instanceId, hp: 400 }));
    const damaged = unitOf(current, P1, "BF-002")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: damaged.instanceId,
        attackId: "thermal-frenzy",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(duelist(current, P2).currentHp).toBe(4000 - 600);
  });
});

describe("Cão Magmático", () => {
  it("Investida Magmática causa dano próprio após o ataque", () => {
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
        attackId: "magma-charge",
        targetKind: "DUELIST",
        targetPlayerId: P2,
      }),
    );
    expect(unitOf(current, P1, "BF-003")?.currentHp).toBe(1300);
    expect(duelist(current, P2).currentHp).toBe(3300);
  });
});

describe("Serpe da Cratera Rubra", () => {
  it("Sangue Vulcânico devolve 200 quando sofre 500+ de um único efeito", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-004", "BF-004", "BF-004", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-005", "MU-005", "MU-005", "MU-001", "MU-001"], "UMBRAL"),
    });
    const serpeCard = duelist(state, P1).hand.find((card) => card.cardId === "BF-004")!;
    let current = must(state, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: serpeCard.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P1));
    const velkaCard = duelist(current, P2).hand.find((card) => card.cardId === "MU-005")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P2, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: velkaCard.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P2));
    current = must(current, cmd("END_TURN", P1));
    const velka = unitOf(current, P2, "MU-005")!;
    const serpe = unitOf(current, P1, "BF-004")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P2, { actions: 3 }));
    current = must(
      current,
      cmd("DECLARE_ATTACK", P2, {
        instanceId: velka.instanceId,
        attackId: "shadow-devours-shadow",
        targetKind: "UNIT",
        targetInstanceId: serpe.instanceId,
        targetPlayerId: P1,
      }),
    );
    expect(unitOf(current, P1, "BF-004")?.currentHp).toBe(2100 - 800);
    expect(unitOf(current, P2, "MU-005")?.currentHp).toBe(2400 - 200);
  });
});

describe("Vharak e Pyraxa", () => {
  it("Pyraxa exige Besta de Fogo Nível 3+ e cura aliadas ao entrar", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-006", "BF-001", "BF-001", "BF-001", "BF-002"]),
    });
    const pyraxa = duelist(state, P1).hand.find((card) => card.cardId === "BF-006")!;
    const failed = executeCommand(state, cmd("SUMMON_UNIT", P1, { instanceId: pyraxa.instanceId, slotIndex: 0 }));
    expect(failed.ok).toBe(false);
    expect(failed.error?.code).toBe("REQUIREMENT_NOT_MET");

    const withBeast = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-006", "BF-001", "BF-001", "BF-001"]),
    });
    const cao = duelist(withBeast, P1).hand.find((card) => card.cardId === "BF-003")!;
    let current = must(withBeast, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: cao.instanceId, slotIndex: 0 }));
    current = must(current, cmd("DEBUG_SET_HP", P1, { instanceId: unitOf(current, P1, "BF-003")!.instanceId, hp: 1000 }));
    const py = duelist(current, P1).hand.find((card) => card.cardId === "BF-006")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: py.instanceId, slotIndex: 1 }));
    expect(unitOf(current, P1, "BF-003")?.currentHp).toBe(1300);
    expect(unitOf(current, P1, "BF-006")).toBeTruthy();
  });

  it("Pyraxa salva uma Besta da primeira destruição do turno", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-006", "BF-001", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-006", "MU-007", "MU-007", "MU-007", "MU-001"], "UMBRAL"),
    });
    const cao = duelist(state, P1).hand.find((card) => card.cardId === "BF-003")!;
    let current = must(state, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: cao.instanceId, slotIndex: 0 }));
    const py = duelist(current, P1).hand.find((card) => card.cardId === "BF-006")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: py.instanceId, slotIndex: 1 }));
    current = must(current, cmd("DEBUG_SET_HP", P1, { instanceId: unitOf(current, P1, "BF-003")!.instanceId, hp: 50 }));
    current = must(current, cmd("END_TURN", P1));
    const touch = duelist(current, P2).hand.find((card) => card.cardId === "MU-007")!;
    current = must(
      current,
      cmd("PLAY_SPELL", P2, { instanceId: touch.instanceId, targetInstanceId: unitOf(current, P1, "BF-003")!.instanceId }),
    );
    expect(unitOf(current, P1, "BF-003")?.currentHp).toBe(100);
  });
});

describe("Carrasco, Arconte, Velka, Nereth", () => {
  it("Carrasco marca alvo ferido por Magia e recebe +100", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-001", "BF-001", "BF-001", "BF-002", "BF-002"]),
      p2Cards: deckWith(["MU-003", "MU-007", "MU-007", "MU-001", "MU-001"], "UMBRAL"),
    });
    const filhote = duelist(state, P1).hand.find((card) => card.cardId === "BF-001")!;
    let current = must(state, cmd("SUMMON_UNIT", P1, { instanceId: filhote.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P1));
    const carrascoCard = duelist(current, P2).hand.find((card) => card.cardId === "MU-003")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P2, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: carrascoCard.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P2));
    current = must(current, cmd("END_TURN", P1));
    const touch = duelist(current, P2).hand.find((card) => card.cardId === "MU-007")!;
    const target = unitOf(current, P1, "BF-001")!;
    current = must(current, cmd("PLAY_SPELL", P2, { instanceId: touch.instanceId, targetInstanceId: target.instanceId }));
    const carrasco = unitOf(current, P2, "MU-003")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P2, {
        instanceId: carrasco.instanceId,
        attackId: "veil-cut",
        targetKind: "UNIT",
        targetInstanceId: unitOf(current, P1, "BF-001")!.instanceId,
        targetPlayerId: P1,
      }),
    );
    expect(unitOf(current, P1, "BF-001")).toBeNull();
  });

  it("Arconte não pode receber Bastão (exige tipo Mago)", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-001", "BF-001", "BF-001", "BF-002", "BF-002"]),
      p2Cards: deckWith(["MU-004", "MU-008", "MU-008", "MU-001", "MU-001"], "UMBRAL"),
    });
    let current = must(state, cmd("END_TURN", P1));
    const archon = duelist(current, P2).hand.find((card) => card.cardId === "MU-004")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P2, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: archon.instanceId, slotIndex: 0 }));
    const staff = duelist(current, P2).hand.find((card) => card.cardId === "MU-008")!;
    const failed = executeCommand(
      current,
      cmd("PLAY_EQUIPMENT", P2, {
        instanceId: staff.instanceId,
        targetInstanceId: unitOf(current, P2, "MU-004")!.instanceId,
        slotIndex: 0,
      }),
    );
    expect(failed.ok).toBe(false);
    expect(failed.error?.code).toBe("INVALID_TARGET");
  });

  it("Velka aplica Veneno Sombrio e reduz o primeiro dano de ataque", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-002", "BF-002", "BF-002", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-005", "MU-005", "MU-001", "MU-001", "MU-001"], "UMBRAL"),
    });
    const rasga = duelist(state, P1).hand.find((card) => card.cardId === "BF-002")!;
    let current = must(state, cmd("SUMMON_UNIT", P1, { instanceId: rasga.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P1));
    const velkaCard = duelist(current, P2).hand.find((card) => card.cardId === "MU-005")!;
    current = must(current, cmd("DEBUG_SET_ACTIONS", P2, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: velkaCard.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P2));
    const attacker = unitOf(current, P1, "BF-002")!;
    const velka = unitOf(current, P2, "MU-005")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P1, {
        instanceId: attacker.instanceId,
        attackId: "carbonized-claws",
        targetKind: "UNIT",
        targetInstanceId: velka.instanceId,
        targetPlayerId: P2,
      }),
    );
    expect(unitOf(current, P2, "MU-005")?.currentHp).toBe(2400 - 100);
  });

  it("Nereth exige Magia/Armadilha Mágica no Descarte e recupera Armadilha", () => {
    const state = startScriptedDuel({
      p2Cards: deckWith(["MU-001", "MU-006", "MU-007", "MU-009", "MU-002"], "UMBRAL"),
    });
    let current = must(state, cmd("END_TURN", P1));
    const nereth = duelist(current, P2).hand.find((card) => card.cardId === "MU-006")!;
    const blocked = executeCommand(current, cmd("SUMMON_UNIT", P2, { instanceId: nereth.instanceId, slotIndex: 0 }));
    expect(blocked.ok).toBe(false);
    const aprendiz = duelist(current, P2).hand.find((card) => card.cardId === "MU-001")!;
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: aprendiz.instanceId, slotIndex: 0 }));
    const touch = duelist(current, P2).hand.find((card) => card.cardId === "MU-007")!;
    current = must(
      current,
      cmd("PLAY_SPELL", P2, {
        instanceId: touch.instanceId,
        targetInstanceId: unitOf(current, P2, "MU-001")!.instanceId,
      }),
    );
    current = must(current, cmd("DEBUG_SET_ACTIONS", P2, { actions: 3 }));
    const nereth2 = duelist(current, P2).hand.find((card) => card.cardId === "MU-006")!;
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: nereth2.instanceId, slotIndex: 1 }));
    expect(unitOf(current, P2, "MU-006")).toBeTruthy();
  });
});

describe("Suportes", () => {
  it("prepara Armadilha, ativa sem custo e Campo aplica bônus", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-009", "BF-010", "BF-003", "BF-001", "BF-001"]),
      p2Cards: deckWith(["MU-001", "MU-001", "MU-001"], "UMBRAL"),
    });
    const trap = duelist(state, P1).hand.find((card) => card.cardId === "BF-009")!;
    const field = duelist(state, P1).hand.find((card) => card.cardId === "BF-010")!;
    let current = must(state, cmd("SET_TRAP", P1, { instanceId: trap.instanceId, slotIndex: 0 }));
    expect(duelist(current, P1).actionsRemaining).toBe(2);
    current = must(current, cmd("PLAY_FIELD", P1, { instanceId: field.instanceId }));
    expect(duelist(current, P1).fieldSlot?.cardId).toBe("BF-010");
    current = must(current, cmd("END_TURN", P1));
    const aprendiz = duelist(current, P2).hand.find((card) => card.cardId === "MU-001")!;
    current = must(current, cmd("SUMMON_UNIT", P2, { instanceId: aprendiz.instanceId, slotIndex: 0 }));
    current = must(current, cmd("END_TURN", P2));
    current = must(current, cmd("END_TURN", P1));
    const unit = unitOf(current, P2, "MU-001")!;
    current = must(
      current,
      cmd("DECLARE_ATTACK", P2, {
        instanceId: unit.instanceId,
        attackId: "shadow-burst",
        targetKind: "DUELIST",
        targetPlayerId: P1,
      }),
    );
    expect(unitOf(current, P2, "MU-001")?.currentHp).toBe(100);
    expect(unitOf(current, P2, "MU-001")?.statuses.some((status) => status.type === "BURN")).toBe(true);
    expect(duelist(current, P1).supportSlots[0]).toBeNull();
  });

  it("Equipamento Presas de Obsidiana aumenta dano", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-003", "BF-008", "BF-001", "BF-001", "BF-002"]),
    });
    const cao = duelist(state, P1).hand.find((card) => card.cardId === "BF-003")!;
    let current = must(state, cmd("DEBUG_SET_ACTIONS", P1, { actions: 3 }));
    current = must(current, cmd("SUMMON_UNIT", P1, { instanceId: cao.instanceId, slotIndex: 0 }));
    const fangs = duelist(current, P1).hand.find((card) => card.cardId === "BF-008")!;
    current = must(
      current,
      cmd("PLAY_EQUIPMENT", P1, {
        instanceId: fangs.instanceId,
        targetInstanceId: unitOf(current, P1, "BF-003")!.instanceId,
        slotIndex: 0,
      }),
    );
    current = must(current, cmd("DEBUG_SET_ACTIONS", P1, { actions: 1 }));
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
    expect(duelist(current, P2).currentHp).toBe(4000 - 600);
  });
});
