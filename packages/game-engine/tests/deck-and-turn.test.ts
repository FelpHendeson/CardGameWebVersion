import { describe, expect, it } from "vitest";
import { createDuel, executeCommand } from "../src/index.js";
import { FIRE_BEASTS_STARTER_DECK, UMBRAL_MAGES_STARTER_DECK } from "@duelo/game-data";
import { P1, P2, cmd, deckWith, duelist, must, startScriptedDuel } from "./helpers.js";

describe("Deck e compra", () => {
  it("embaralha de forma determinística", () => {
    const a = createDuel({
      mode: "QUICK",
      seed: "ABC123",
      players: [
        { id: P1, name: "A", deck: FIRE_BEASTS_STARTER_DECK.cards },
        { id: P2, name: "B", deck: UMBRAL_MAGES_STARTER_DECK.cards },
      ],
    });
    const b = createDuel({
      mode: "QUICK",
      seed: "ABC123",
      players: [
        { id: P1, name: "A", deck: FIRE_BEASTS_STARTER_DECK.cards },
        { id: P2, name: "B", deck: UMBRAL_MAGES_STARTER_DECK.cards },
      ],
    });
    expect(a.players[0].deck.map((card) => card.cardId)).toEqual(b.players[0].deck.map((card) => card.cardId));
    expect(a.players[0].hand.map((card) => card.cardId)).toEqual(b.players[0].hand.map((card) => card.cardId));
    expect(a.firstPlayerId).toBe(b.firstPlayerId);
  });

  it("compra mão inicial de 5", () => {
    const state = startScriptedDuel();
    expect(duelist(state, P1).hand).toHaveLength(5);
    expect(duelist(state, P2).hand).toHaveLength(5);
    expect(duelist(state, P1).deck).toHaveLength(25);
  });

  it("primeiro jogador não compra no primeiro turno por padrão", () => {
    const state = startScriptedDuel();
    expect(duelist(state, P1).hand).toHaveLength(5);
    const after = must(state, cmd("END_TURN", P1));
    expect(duelist(after, P2).hand).toHaveLength(6);
  });

  it("derrota ao comprar com Deck vazio", () => {
    let current = startScriptedDuel();
    const remaining = duelist(current, P1).deck.length;
    current = must(current, cmd("DEBUG_DRAW", P1, { amount: remaining }));
    current = must(current, cmd("END_TURN", P1));
    current = must(current, cmd("END_TURN", P2));
    expect(current.status).toBe("FINISHED");
    expect(current.result?.reason).toBe("DECK_OUT");
    expect(current.result?.loserId).toBe(P1);
  });
});

describe("Banco de Ações", () => {
  it("restaura 3 ações no início do turno", () => {
    const state = startScriptedDuel();
    expect(duelist(state, P1).actionsRemaining).toBe(3);
  });

  it("consome ações e impede valor negativo", () => {
    const state = startScriptedDuel({
      p1Cards: deckWith(["BF-001", "BF-003", "BF-003", "BF-001", "BF-001"]),
    });
    const filhote = duelist(state, P1).hand.find((card) => card.cardId === "BF-001")!;
    let after = must(state, cmd("SUMMON_UNIT", P1, { instanceId: filhote.instanceId, slotIndex: 0 }));
    expect(duelist(after, P1).actionsRemaining).toBe(2);
    const filhote2 = duelist(after, P1).hand.find((card) => card.cardId === "BF-001")!;
    after = must(after, cmd("SUMMON_UNIT", P1, { instanceId: filhote2.instanceId, slotIndex: 1 }));
    expect(duelist(after, P1).actionsRemaining).toBe(1);
    const cao = duelist(after, P1).hand.find((card) => card.cardId === "BF-003");
    expect(cao).toBeTruthy();
    const failed = executeCommand(after, cmd("SUMMON_UNIT", P1, { instanceId: cao!.instanceId, slotIndex: 2 }));
    expect(failed.ok).toBe(false);
    expect(failed.error?.code).toBe("INSUFFICIENT_ACTIONS");
    expect(duelist(failed.state, P1).actionsRemaining).toBe(1);
  });

  it("ações não acumulam entre turnos", () => {
    const state = startScriptedDuel();
    expect(duelist(state, P1).actionsRemaining).toBe(3);
    const after = must(must(state, cmd("END_TURN", P1)), cmd("END_TURN", P2));
    expect(duelist(after, P1).actionsRemaining).toBe(3);
  });
});
