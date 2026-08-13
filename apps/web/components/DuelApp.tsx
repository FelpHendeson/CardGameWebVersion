"use client";

import {
  FIRE_BEASTS_STARTER_DECK,
  UMBRAL_MAGES_STARTER_DECK,
} from "@duelo/game-data";
import { createDuel, executeCommand, getLegalActions, getValidTargets } from "@duelo/game-engine";
import type { Command, DuelMode, GameState, LegalAction, TargetOption } from "@duelo/shared";
import { useMemo, useState } from "react";
import { DuelBoard } from "./DuelBoard";
import { DebugPanel } from "./DebugPanel";
import { EventLog } from "./EventLog";

type Selection =
  | { kind: "none" }
  | { kind: "card"; instanceId: string }
  | { kind: "action"; action: LegalAction };

export function DuelApp() {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>({ kind: "none" });
  const [debug, setDebug] = useState(process.env.NODE_ENV === "development");

  const [mode, setMode] = useState<DuelMode>("QUICK");
  const [seed, setSeed] = useState("sandbox-001");
  const [p1Name, setP1Name] = useState("Bestas de Fogo");
  const [p2Name, setP2Name] = useState("Magos Umbrais");

  const viewerId = state?.pendingDecision?.playerId ?? state?.activePlayerId;
  const legal = useMemo(
    () => (state && viewerId ? getLegalActions(state, viewerId) : []),
    [state, viewerId],
  );
  const targets = useMemo(() => {
    if (!state || !viewerId || selection.kind !== "action") {
      return [] as TargetOption[];
    }
    return getValidTargets(state, viewerId, selection.action);
  }, [state, viewerId, selection]);

  function startDuel() {
    try {
      const scripted = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("scripted") === "1";
      const next = createDuel({
        mode,
        seed: seed.trim() || `seed-${Date.now()}`,
        debug: process.env.NODE_ENV === "development",
        decisionPolicy: scripted ? "AUTO_ACCEPT" : "MANUAL",
        shuffle: scripted ? false : true,
        firstPlayerId: scripted ? "p1" : undefined,
        players: [
          { id: "p1", name: p1Name, deck: FIRE_BEASTS_STARTER_DECK.cards },
          { id: "p2", name: p2Name, deck: UMBRAL_MAGES_STARTER_DECK.cards },
        ],
      });
      setState(next);
      setSelection({ kind: "none" });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao iniciar o Duelo.");
    }
  }

  function run(command: Command) {
    if (!state) {
      return;
    }
    const result = executeCommand(state, command);
    if (!result.ok) {
      setError(result.error?.message ?? "Jogada ilegal.");
      return;
    }
    setState(result.state);
    setSelection({ kind: "none" });
    setError(null);
  }

  if (!state) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-12">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Protótipo 0.1</p>
          <h1 className="mt-3 font-display text-4xl text-stone-50">Guerra das Cinzas e do Véu</h1>
          <p className="mt-3 max-w-xl text-stone-300">
            Sandbox local. Dois Duelistas no mesmo navegador. Bestas de Fogo contra Magos Umbrais.
          </p>
        </div>
        <form
          className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            startDuel();
          }}
        >
          <label className="block text-sm">
            Modo
            <select
              className="mt-1 w-full rounded-lg bg-stone-900 p-2"
              value={mode}
              onChange={(event) => setMode(event.target.value as DuelMode)}
              data-testid="mode-select"
            >
              <option value="QUICK">Duelo Rápido — 4000 PV</option>
              <option value="OFFICIAL">Duelo Oficial — 8000 PV</option>
            </select>
          </label>
          <label className="block text-sm">
            Seed (opcional)
            <input
              className="mt-1 w-full rounded-lg bg-stone-900 p-2"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              data-testid="seed-input"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Jogador 1 — Bestas de Fogo
              <input className="mt-1 w-full rounded-lg bg-stone-900 p-2" value={p1Name} onChange={(e) => setP1Name(e.target.value)} />
            </label>
            <label className="block text-sm">
              Jogador 2 — Magos Umbrais
              <input className="mt-1 w-full rounded-lg bg-stone-900 p-2" value={p2Name} onChange={(e) => setP2Name(e.target.value)} />
            </label>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-500"
            data-testid="start-duel"
          >
            Iniciar Duelo
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[1fr_320px]">
      <DuelBoard
        state={state}
        legal={legal}
        targets={targets}
        selection={selection}
        error={error}
        onSelectCard={(instanceId) => setSelection({ kind: "card", instanceId })}
        onSelectAction={(action) => {
          if (!action.requiresTarget && !action.requiresSlot) {
            run({
              commandId: `ui-${Date.now()}`,
              type: action.type,
              playerId: viewerId ?? state.activePlayerId,
              payload: { ...action.payload, instanceId: action.instanceId, attackId: action.attackId },
            });
            return;
          }
          setSelection({ kind: "action", action });
        }}
        onSelectTarget={(target) => {
          if (selection.kind !== "action") {
            return;
          }
          const action = selection.action;
          const payload: Record<string, unknown> = {
            ...action.payload,
            instanceId: action.instanceId,
            attackId: action.attackId,
          };
          if (target.kind === "SLOT") {
            payload.slotIndex = target.slotIndex;
          }
          if (target.kind === "UNIT" || target.kind === "CARD") {
            if (action.type === "PLAY_EQUIPMENT" && !payload.targetInstanceId) {
              payload.targetInstanceId = target.instanceId;
              setSelection({ kind: "action", action: { ...action, payload } });
              return;
            }
            payload.targetInstanceId = target.instanceId;
          }
          if (target.kind === "DUELIST") {
            payload.targetKind = "DUELIST";
            payload.targetPlayerId = target.playerId;
          } else if (action.type === "DECLARE_ATTACK") {
            payload.targetKind = "UNIT";
            payload.targetPlayerId = target.playerId;
          }
          if (action.type === "PLAY_EQUIPMENT" && payload.targetInstanceId && payload.slotIndex === undefined) {
            setSelection({ kind: "action", action: { ...action, payload } });
            return;
          }
          run({
            commandId: `ui-${Date.now()}`,
            type: action.type,
            playerId: viewerId ?? state.activePlayerId,
            payload,
          });
        }}
        onEndTurn={() =>
          run({ commandId: `end-${Date.now()}`, type: "END_TURN", playerId: state.activePlayerId })
        }
        onConcede={() =>
          run({ commandId: `concede-${Date.now()}`, type: "CONCEDE", playerId: state.activePlayerId })
        }
        onRestart={() => {
          setState(null);
          setSelection({ kind: "none" });
        }}
      />
      <aside className="border-t border-white/10 bg-black/40 xl:border-l xl:border-t-0">
        <EventLog events={state.events} />
        {debug ? (
          <DebugPanel
            state={state}
            onCommand={(command) => run(command)}
            onToggle={() => setDebug(false)}
          />
        ) : process.env.NODE_ENV === "development" ? (
          <button className="m-3 text-xs text-stone-400 underline" onClick={() => setDebug(true)}>
            Ativar debug
          </button>
        ) : null}
      </aside>
    </div>
  );
}
