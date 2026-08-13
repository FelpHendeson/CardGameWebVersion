import type { DuelEvent } from "@duelo/shared";

export function formatEvent(event: DuelEvent): string {
  const p = event.payload;
  switch (event.type) {
    case "GAME_STARTED":
      return `Partida iniciada (${String(p.mode)}). PV inicial: ${String(p.life)}.`;
    case "FIRST_PLAYER_CHOSEN":
      return `Primeiro jogador definido.`;
    case "DECK_SHUFFLED":
      return `Decks embaralhados.`;
    case "TURN_STARTED":
      return `Turno ${event.turn} iniciado (${String(p.name ?? p.playerId)}).`;
    case "CARD_DRAWN":
      return p.reason === "INITIAL_HAND"
        ? `${String(p.playerId)} recebeu carta inicial.`
        : `${String(p.playerId)} comprou ${String(p.cardId)}.`;
    case "ACTIONS_REFRESHED":
      return `Banco restaurado: ${String(p.actions)} Ações.`;
    case "ACTIONS_SPENT":
      return `${String(p.amount)} Ação(ões) gasta(s). ${String(p.remaining)} restante(s).`;
    case "CARD_SUMMONED":
      return `${String(p.cardName)} foi Invocado.${p.summonSickness ? " Não pode atacar neste turno." : ""}`;
    case "ATTACK_DECLARED":
      return `${String(p.attackerName)} usou ${String(p.attackName)}.`;
    case "DAMAGE_DEALT":
      if (p.targetKind === "DUELIST") {
        return `O Duelista sofreu ${String(p.amount)} de dano.`;
      }
      return `${String(p.cardName)} sofreu ${String(p.amount)} de dano.`;
    case "HP_CHANGED":
      if (p.reason === "HEAL" || p.reason === "PYRAXA_SUMMON" || p.reason === "ALPHA_PREDATOR") {
        return `${String(p.cardName ?? "Alvo")} recuperou ${String(p.amount)} PV.`;
      }
      return p.cardName ? `${String(p.cardName)}: ${String(p.currentHp)} PV.` : `PV do Duelista: ${String(p.currentHp)}.`;
    case "STATUS_APPLIED":
      return `${String(p.cardName)} recebeu ${translateStatus(String(p.statusType))}.`;
    case "STATUS_EXPIRED":
      return `${translateStatus(String(p.statusType))} expirou.`;
    case "CARD_DESTROYED":
      return `${String(p.cardName)} foi destruído.`;
    case "CARD_DISCARDED":
      return `${String(p.cardName)} foi para o Descarte.`;
    case "TRAP_SET":
      return `Armadilha preparada.`;
    case "TRAP_ACTIVATED":
      return `${String(p.cardName)} foi ativada.`;
    case "SPELL_PLAYED":
      return `${String(p.cardName)} foi ativada.`;
    case "EQUIPMENT_PLAYED":
      return `${String(p.cardName)} foi equipado em ${String(p.targetName)}.`;
    case "FIELD_PLAYED":
      return `${String(p.cardName)} entrou em Campo.`;
    case "TURN_ENDED":
      return `Turno encerrado.`;
    case "GAME_ENDED":
      return `Fim de Duelo. Vencedor: ${String(p.winnerId)} (${String(p.reason)}).`;
    case "DECISION_REQUESTED":
      return `Decisão pendente: ${String(p.type)}.`;
    case "DECISION_RESOLVED":
      return `Decisão resolvida.`;
    case "UNIT_ATTACK_MARKED":
      return `Unidade marcada como já ter atacado.`;
    case "MODIFIER_APPLIED":
      return `Modificador aplicado.`;
    default:
      return event.type;
  }
}

function translateStatus(type: string): string {
  switch (type) {
    case "BURN":
      return "Queimadura";
    case "POISON":
      return "Veneno";
    case "SHADOW_POISON":
      return "Veneno Sombrio";
    case "STUN":
      return "Atordoamento";
    case "PROTECTION":
      return "Proteção";
    default:
      return type;
  }
}
