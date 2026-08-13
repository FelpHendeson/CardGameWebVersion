"use client";

import { CARD_CATALOG } from "@duelo/game-data";
import type { Command, GameState } from "@duelo/shared";
import { useState } from "react";

export function DebugPanel({
  state,
  onCommand,
  onToggle,
}: {
  state: GameState;
  onCommand: (command: Command) => void;
  onToggle: () => void;
}) {
  const [cardId, setCardId] = useState("BF-001");
  const [hp, setHp] = useState(1000);
  const active = state.activePlayerId;

  function send(type: Command["type"], payload?: Record<string, unknown>) {
    onCommand({ commandId: `debug-${Date.now()}`, type, playerId: active, payload });
  }

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <section className="space-y-3 p-4 text-xs" data-testid="debug-panel">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold uppercase tracking-wider text-amber-400">Debug</h2>
        <button onClick={onToggle} className="text-stone-500">
          ocultar
        </button>
      </div>
      <p>Seed RNG: {state.rng.seed}</p>
      <p>Turno {state.turnNumber} · {state.phase} · {state.status}</p>
      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-stone-800 px-2 py-1" onClick={() => send("DEBUG_DRAW", { amount: 1 })}>
          Comprar
        </button>
        <button className="rounded bg-stone-800 px-2 py-1" onClick={() => send("DEBUG_SET_ACTIONS", { actions: 3 })}>
          +3 Ações
        </button>
        <button className="rounded bg-stone-800 px-2 py-1" onClick={() => send("END_TURN")}>
          Avançar turno
        </button>
      </div>
      <div className="flex gap-2">
        <input className="w-20 rounded bg-stone-900 px-2 py-1" value={hp} onChange={(e) => setHp(Number(e.target.value))} />
        <button className="rounded bg-stone-800 px-2 py-1" onClick={() => send("DEBUG_SET_HP", { hp, targetPlayerId: active })}>
          Setar PV
        </button>
      </div>
      <div className="flex gap-2">
        <select className="flex-1 rounded bg-stone-900 px-2 py-1" value={cardId} onChange={(e) => setCardId(e.target.value)}>
          {Object.keys(CARD_CATALOG).map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <button className="rounded bg-stone-800 px-2 py-1" onClick={() => send("DEBUG_ADD_TO_HAND", { cardId })}>
          +Mão
        </button>
      </div>
      <details>
        <summary className="cursor-pointer text-stone-400">GameState JSON</summary>
        <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/60 p-2 text-[10px] text-stone-300">
          {JSON.stringify(state, null, 2)}
        </pre>
      </details>
    </section>
  );
}
