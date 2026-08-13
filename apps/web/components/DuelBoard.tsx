"use client";

import { getCardDefinition } from "@duelo/game-data";
import { computeMaxHp, unitViewFlags } from "@duelo/game-engine";
import type { GameState, LegalAction, PlayerState, TargetOption, UnitInstance } from "@duelo/shared";

type Selection =
  | { kind: "none" }
  | { kind: "card"; instanceId: string }
  | { kind: "action"; action: LegalAction };

export function DuelBoard(props: {
  state: GameState;
  legal: LegalAction[];
  targets: TargetOption[];
  selection: Selection;
  error: string | null;
  onSelectCard: (instanceId: string) => void;
  onSelectAction: (action: LegalAction) => void;
  onSelectTarget: (target: TargetOption) => void;
  onEndTurn: () => void;
  onConcede: () => void;
  onRestart: () => void;
}) {
  const { state } = props;
  const viewerId = state.pendingDecision?.playerId ?? state.activePlayerId;
  const active = state.players.find((player) => player.id === viewerId)!;
  const opponent = state.players.find((player) => player.id !== viewerId)!;
  const selectedId = props.selection.kind === "card" ? props.selection.instanceId : props.selection.kind === "action" ? props.selection.action.instanceId : undefined;
  const cardActions = props.legal.filter((action) => action.instanceId === selectedId && action.type !== "END_TURN" && action.type !== "CONCEDE");

  if (state.status === "FINISHED" && state.result) {
    const winner = state.players.find((player) => player.id === state.result?.winnerId);
    return (
      <main className="flex flex-col items-center justify-center gap-6 p-10" data-testid="duel-result">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Fim de Duelo</p>
        <h1 className="font-display text-5xl">Vitória de {winner?.name}</h1>
        <p className="text-stone-300">Turnos: {state.turnNumber} · Motivo: {state.result.reason}</p>
        <button className="rounded-xl bg-orange-600 px-6 py-3 font-semibold" onClick={props.onRestart} data-testid="new-duel">
          Novo Duelo
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4 lg:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-400">Sandbox · {state.mode}</p>
          <h1 className="font-display text-2xl">Turno {state.turnNumber} · {active.name}</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-stone-800 px-3 py-2 text-sm" onClick={props.onConcede}>
            Desistir
          </button>
          <button className="rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold" onClick={props.onEndTurn} data-testid="end-turn">
            Encerrar turno
          </button>
        </div>
      </header>

      {state.pendingDecision ? (
        <section className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-4" data-testid="pending-decision">
          <p className="mb-3 font-semibold">{state.pendingDecision.prompt}</p>
          <div className="flex flex-wrap gap-2">
            {props.legal
              .filter((action) => action.type === "RESOLVE_DECISION")
              .map((action) => (
                <button
                  key={String(action.payload?.optionId)}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold"
                  onClick={() => props.onSelectAction(action)}
                >
                  {action.label}
                </button>
              ))}
          </div>
        </section>
      ) : null}

      <PlayerPanel
        duelist={opponent}
        state={state}
        hideHand
        selectedId={selectedId}
        targets={props.targets}
        onSelectCard={props.onSelectCard}
        onSelectTarget={props.onSelectTarget}
        opponent
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <PlayerPanel
          duelist={active}
          state={state}
          hideHand={false}
          selectedId={selectedId}
          targets={props.targets}
          onSelectCard={props.onSelectCard}
          onSelectTarget={props.onSelectTarget}
        />
        <aside className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-stone-400">Ações</p>
          <ActionDots count={active.actionsRemaining} />
          <p className="mt-2 text-sm" data-testid="actions-remaining">
            {active.actionsRemaining} / {state.rules.actionsPerTurn}
          </p>
          {props.error ? <p className="mt-3 text-sm text-red-400" data-testid="rule-error">{props.error}</p> : null}
          {selectedId ? (
            <CardDetails instanceId={selectedId} duelist={active} opponent={opponent} state={state} />
          ) : (
            <p className="mt-4 text-sm text-stone-400">Selecione uma carta da mão ou uma Unidade.</p>
          )}
          <div className="mt-4 flex flex-col gap-2">
            {cardActions.map((action) => (
              <button
                key={`${action.type}-${action.attackId ?? action.instanceId}`}
                className="rounded-lg bg-orange-700 px-3 py-2 text-left text-sm font-semibold hover:bg-orange-600"
                onClick={() => props.onSelectAction(action)}
                data-testid={`action-${action.type}`}
              >
                {action.label}
              </button>
            ))}
          </div>
          {props.selection.kind === "action" ? (
            <p className="mt-3 text-xs text-amber-300">
              {props.selection.action.type === "PLAY_EQUIPMENT" && !props.selection.action.payload?.targetInstanceId
                ? "Escolha a Unidade e depois o espaço de Suporte."
                : "Escolha um alvo ou espaço destacado."}
            </p>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function ActionDots({ count }: { count: number }) {
  return (
    <div className="flex gap-2" data-testid="action-dots">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`h-4 w-4 rounded-full ${index < count ? "bg-orange-400" : "bg-stone-700"}`}
        />
      ))}
    </div>
  );
}

function PlayerPanel({
  duelist,
  state,
  hideHand,
  opponent,
  selectedId,
  targets,
  onSelectCard,
  onSelectTarget,
}: {
  duelist: PlayerState;
  state: GameState;
  hideHand: boolean;
  opponent?: boolean;
  selectedId?: string;
  targets: TargetOption[];
  onSelectCard: (instanceId: string) => void;
  onSelectTarget: (target: TargetOption) => void;
}) {
  const duelistTarget = targets.find((target) => target.kind === "DUELIST" && target.playerId === duelist.id);
  return (
    <section className={`rounded-2xl border border-white/10 p-4 ${opponent ? "bg-violet-950/30" : "bg-orange-950/20"}`} data-testid={opponent ? "opponent-panel" : "active-panel"}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{duelist.name}</h2>
          <p className="text-sm text-stone-300">
            Mão {duelist.hand.length} · Deck {duelist.deck.length} · Descarte {duelist.discard.length}
          </p>
        </div>
        <button
          className={`rounded-full px-4 py-1 text-lg font-bold ${duelistTarget ? (duelistTarget.valid ? "ring-2 ring-emerald-400" : "ring-2 ring-red-500") : "bg-black/40"}`}
          onClick={() => duelistTarget && onSelectTarget(duelistTarget)}
          data-testid={`${duelist.id}-hp`}
        >
          {duelist.currentHp} PV
        </button>
      </div>
      <div className="grid gap-3">
        <SlotRow
          label="Unidades"
          slots={duelist.unitSlots}
          kind="UNIT"
          playerId={duelist.id}
          state={state}
          selectedId={selectedId}
          targets={targets}
          onSelectCard={onSelectCard}
          onSelectTarget={onSelectTarget}
        />
        <SlotRow
          label="Suportes"
          slots={duelist.supportSlots}
          kind="SUPPORT"
          playerId={duelist.id}
          state={state}
          selectedId={selectedId}
          targets={targets}
          onSelectCard={onSelectCard}
          onSelectTarget={onSelectTarget}
        />
        <div>
          <p className="mb-1 text-xs uppercase text-stone-400">Campo</p>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            {duelist.fieldSlot ? getCardDefinition(duelist.fieldSlot.cardId).name : "—"}
          </div>
        </div>
        {!hideHand ? (
          <div>
            <p className="mb-1 text-xs uppercase text-stone-400">Mão</p>
            <div className="flex flex-wrap gap-2" data-testid="active-hand">
              {duelist.hand.map((card) => {
                const definition = getCardDefinition(card.cardId);
                const selected = selectedId === card.instanceId;
                return (
                  <button
                    key={card.instanceId}
                    className={`min-w-[8.5rem] rounded-xl border px-3 py-2 text-left text-sm ${selected ? "border-orange-400 bg-orange-950" : "border-white/10 bg-black/30"}`}
                    onClick={() => onSelectCard(card.instanceId)}
                    data-testid="hand-card"
                    data-card-id={card.cardId}
                    data-category={definition.category}
                  >
                    <span className="block text-[10px] uppercase text-stone-400">{definition.category}</span>
                    {definition.name}
                    {definition.level ? <span className="mt-1 block text-[10px]">Nv. {definition.level}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-400" data-testid="opponent-hand-count">Cartas na mão: {duelist.hand.length}</p>
        )}
      </div>
    </section>
  );
}

function SlotRow({
  label,
  slots,
  kind,
  playerId,
  state,
  selectedId,
  targets,
  onSelectCard,
  onSelectTarget,
}: {
  label: string;
  slots: Array<UnitInstance | { instanceId: string; cardId: string; revealed?: boolean } | null>;
  kind: "UNIT" | "SUPPORT";
  playerId: string;
  state: GameState;
  selectedId?: string;
  targets: TargetOption[];
  onSelectCard: (instanceId: string) => void;
  onSelectTarget: (target: TargetOption) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase text-stone-400">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot, index) => {
          const slotTarget = targets.find((target) => target.kind === "SLOT" && target.slotIndex === index && target.playerId === playerId && (kind === "UNIT" ? target.id.startsWith("unit") : target.id.startsWith("support")));
          const unitTarget = slot && "currentHp" in slot ? targets.find((target) => target.kind === "UNIT" && target.instanceId === slot.instanceId) : undefined;
          const target = unitTarget ?? slotTarget;
          const selected = slot && selectedId === slot.instanceId;
          return (
            <button
              key={`${kind}-${index}`}
              className={`min-h-[7rem] rounded-xl border p-2 text-left text-xs ${
                target ? (target.valid ? "border-emerald-400 bg-emerald-950/40" : "border-red-500 bg-red-950/30") : selected ? "border-orange-400 bg-orange-950/40" : "border-white/10 bg-black/20"
              }`}
              onClick={() => {
                if (target) {
                  onSelectTarget(target);
                  return;
                }
                if (slot && "currentHp" in slot) {
                  onSelectCard(slot.instanceId);
                }
              }}
              data-testid={`${kind.toLowerCase()}-slot-${playerId}-${index}`}
            >
              {!slot ? (
                <span className="text-stone-500">Vazio</span>
              ) : "currentHp" in slot ? (
                <UnitCard unit={slot} state={state} />
              ) : (
                <span>{slot.revealed === false ? "Armadilha preparada" : getCardDefinition(slot.cardId).name}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UnitCard({ unit, state }: { unit: UnitInstance; state: GameState }) {
  const card = getCardDefinition(unit.cardId);
  const flags = unitViewFlags(state, unit);
  const maxHp = computeMaxHp(state, unit);
  return (
    <div>
      <p className="font-semibold">{card.name}</p>
      <p data-testid={`unit-hp-${unit.instanceId}`}>
        {unit.currentHp}/{maxHp} PV
      </p>
      <div className="mt-1 flex flex-wrap gap-1 text-[10px] uppercase">
        {flags.summonSickness ? <span className="rounded bg-sky-900 px-1">Invocação</span> : null}
        {flags.hasAttacked ? <span className="rounded bg-stone-700 px-1">Já atacou</span> : null}
        {flags.canAttack ? <span className="rounded bg-emerald-800 px-1">Apta</span> : null}
        {flags.stunned ? <span className="rounded bg-yellow-800 px-1">Atordoada</span> : null}
        {flags.burned ? <span className="rounded bg-orange-800 px-1">Queimada</span> : null}
        {flags.poisoned ? <span className="rounded bg-lime-900 px-1">Veneno</span> : null}
        {flags.protected ? <span className="rounded bg-blue-900 px-1">Proteção</span> : null}
        {unit.equipmentInstanceIds.length > 0 ? <span className="rounded bg-amber-900 px-1">Equip.</span> : null}
      </div>
    </div>
  );
}

function CardDetails({
  instanceId,
  duelist,
  opponent,
  state,
}: {
  instanceId: string;
  duelist: PlayerState;
  opponent: PlayerState;
  state: GameState;
}) {
  const fromHand = duelist.hand.find((card) => card.instanceId === instanceId);
  const fromBoard = [...duelist.unitSlots, ...opponent.unitSlots].find((slot) => slot?.instanceId === instanceId);
  const cardId = fromHand?.cardId ?? fromBoard?.cardId;
  if (!cardId) {
    return null;
  }
  const card = getCardDefinition(cardId);
  return (
    <div className="mt-4 text-sm" data-testid="card-details">
      <p className="font-semibold">{card.name}</p>
      <p className="text-xs text-stone-400">{card.id} · {card.rarity}</p>
      {card.level ? <p>Nível {card.level} · PV {fromBoard && "currentHp" in fromBoard ? `${fromBoard.currentHp}/${computeMaxHp(state, fromBoard)}` : card.maxHp}</p> : null}
      <p className="mt-2 text-stone-300">{card.rulesText}</p>
    </div>
  );
}
