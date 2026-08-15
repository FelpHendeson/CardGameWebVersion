"use client";

import { getCardDefinition } from "@duelo/game-data";
import { computeMaxHp, unitViewFlags } from "@duelo/game-engine";
import type { GameState, LegalAction, PlayerState, TargetOption, UnitInstance } from "@duelo/shared";
import { CardView } from "./CardView";
import { shouldRevealSupportArtwork } from "../lib/card-artwork";

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
  const fieldCard = duelist.fieldSlot ? getCardDefinition(duelist.fieldSlot.cardId) : null;

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
          {fieldCard ? (
            <CardView card={fieldCard} variant="field" />
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-stone-500">—</div>
          )}
        </div>
        {!hideHand ? (
          <div>
            <p className="mb-1 text-xs uppercase text-stone-400">Mão</p>
            <div className="flex gap-2 overflow-x-auto pb-1" data-testid="active-hand">
              {duelist.hand.map((card) => {
                const definition = getCardDefinition(card.cardId);
                const selected = selectedId === card.instanceId;
                return (
                  <button
                    key={card.instanceId}
                    className={`shrink-0 rounded-xl text-left transition ${selected ? "opacity-100" : "opacity-95 hover:opacity-100"}`}
                    onClick={() => onSelectCard(card.instanceId)}
                    data-testid="hand-card"
                    data-card-id={card.cardId}
                    data-category={definition.category}
                  >
                    <CardView card={definition} variant="hand" selected={selected} />
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
              className={`min-h-[7.5rem] rounded-xl border p-2 text-left text-xs ${
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
              {target ? (
                <span className={`mb-1 block text-[10px] font-semibold uppercase ${target.valid ? "text-emerald-300" : "text-red-300"}`}>
                  {target.valid ? "Alvo válido" : "Alvo inválido"}
                </span>
              ) : null}
              {!slot ? (
                <span className="text-stone-500">Vazio</span>
              ) : "currentHp" in slot ? (
                <UnitCard unit={slot} state={state} />
              ) : (
                <SupportCard slot={slot} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function unitStatusChips(flags: ReturnType<typeof unitViewFlags>, hasEquipment: boolean): string[] {
  const chips: string[] = [];
  if (flags.summonSickness) chips.push("Invocação");
  if (flags.hasAttacked) chips.push("Já atacou");
  if (flags.canAttack) chips.push("Apta");
  if (flags.stunned) chips.push("Atordoada");
  if (flags.burned) chips.push("Queimada");
  if (flags.poisoned) chips.push("Veneno");
  if (flags.protected) chips.push("Proteção");
  if (hasEquipment) chips.push("Equip.");
  return chips;
}

function UnitCard({ unit, state }: { unit: UnitInstance; state: GameState }) {
  const card = getCardDefinition(unit.cardId);
  const flags = unitViewFlags(state, unit);
  const maxHp = computeMaxHp(state, unit);
  const chips = unitStatusChips(flags, unit.equipmentInstanceIds.length > 0);
  return (
    <CardView
      card={card}
      variant="board"
      currentHp={unit.currentHp}
      maxHp={maxHp}
      statusChips={chips}
      hpTestId={`unit-hp-${unit.instanceId}`}
    />
  );
}

function SupportCard({ slot }: { slot: { instanceId: string; cardId: string; revealed?: boolean } }) {
  const revealed = shouldRevealSupportArtwork(slot.revealed);
  if (!revealed) {
    return <CardView card={getCardDefinition(slot.cardId)} variant="support" hidden />;
  }
  const card = getCardDefinition(slot.cardId);
  const chips = card.category === "EQUIPMENT" || card.category === "MAGIC_EQUIPMENT" ? ["Equip."] : [];
  return <CardView card={card} variant="support" statusChips={chips} />;
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
  const boardUnit = fromBoard && "currentHp" in fromBoard ? fromBoard : undefined;
  const maxHp = boardUnit ? computeMaxHp(state, boardUnit) : card.maxHp;
  return (
    <div className="mt-4 text-sm" data-testid="card-details">
      <CardView
        card={card}
        variant="detail"
        currentHp={boardUnit?.currentHp}
        maxHp={maxHp}
      />
    </div>
  );
}
