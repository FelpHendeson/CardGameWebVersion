# Backlog do MVP Web

**Versão:** 0.1  
**Objetivo:** implementar o jogo em ondas que sempre deixem algo testável.

---

# Onda 0 — Fundação

## WEB-001 — Monorepo TypeScript

**Aceite**

- [ ] workspace criado;
- [ ] lint, format e testes configurados;
- [ ] `apps/web`, `apps/server`, `packages/game-engine`, `packages/card-data`, `packages/shared`.

## WEB-002 — Catálogo carregável

- [ ] cartas carregadas por JSON/TS estruturado;
- [ ] BF-001 a BF-010;
- [ ] MU-001 a MU-010;
- [ ] validação de schema.

---

# Onda 1 — Motor mínimo

## GAME-001 — Estado inicial do Duelo

- [ ] dois jogadores;
- [ ] PV por modo;
- [ ] Deck, mão, Descarte e zonas;
- [ ] seed determinística.

## GAME-002 — Compra

- [ ] mão inicial de 5;
- [ ] compra por turno;
- [ ] derrota por Deck vazio.

## GAME-003 — Banco de Ações

- [ ] 3 Ações restauradas por turno;
- [ ] consumo centralizado;
- [ ] ação inválida não altera estado.

---

# Onda 2 — Unidades e combate

## GAME-010 — Invocação

- [ ] custo por Nível;
- [ ] 3 zonas;
- [ ] requisitos especiais;
- [ ] Estado de Invocação.

## GAME-011 — Ataque

- [ ] escolher ataque e alvo;
- [ ] custo de 1 Ação;
- [ ] uma vez por turno;
- [ ] proteção do Duelista.

## GAME-012 — Dano persistente

- [ ] currentHp;
- [ ] destruição;
- [ ] Descarte;
- [ ] dano excedente perdido.

## GAME-013 — Perfuração

- [ ] cálculo de excesso;
- [ ] dano ao Duelista.

## GAME-014 — Investida

- [ ] ignora Estado de Invocação para ataque.

---

# Onda 3 — Cartas de suporte

## GAME-020 — Magias

## GAME-021 — Equipamentos

## GAME-022 — Equipamentos Mágicos

## GAME-023 — Armadilhas

## GAME-024 — Armadilhas Mágicas

## GAME-025 — Campos

Cada história deve possuir testes com pelo menos uma carta real do Catálogo.

---

# Onda 4 — Condições e efeitos

## GAME-030 — Sistema de Status

- [ ] aplicação;
- [ ] duração;
- [ ] remoção;
- [ ] tick configurável.

## GAME-031 — Atordoamento

## GAME-032 — Queimadura

## GAME-033 — Veneno/Veneno Sombrio

## GAME-034 — Proteção/redução de dano

---

# Onda 5 — Web jogável

## UI-001 — Mesa

## UI-002 — Mão

## UI-003 — Seleção e preview de carta

## UI-004 — Invocação por clique

## UI-005 — Fluxo de ataque

## UI-006 — Feedback de dano/status

## UI-007 — Log da partida

## UI-008 — Tela de resultado

---

# Onda 6 — Ferramentas de teste

## DEV-001 — Sandbox dois jogadores

## DEV-002 — Seed reproduzível

## DEV-003 — Exportação de replay

## DEV-004 — Importação de replay

## DEV-005 — Painel de estado/debug

---

# Onda 7 — Deck Builder

## DECK-001 — Catálogo

## DECK-002 — Criar/editar Deck

## DECK-003 — Regra 30 cartas

## DECK-004 — Máximo 3 cópias

## DECK-005 — Decks iniciais pré-montados

---

# Onda 8 — Bot de teste

## BOT-001 — Jogadas válidas

## BOT-002 — Heurística de Invocação

## BOT-003 — Heurística de ataque

## BOT-004 — Uso básico de suporte

Objetivo não é inteligência competitiva, e sim gerar partidas automaticamente.

---

# Onda 9 — Multiplayer

Só iniciar após uma partida local completa e reproduzível.

## NET-001 — Servidor autoritativo

## NET-002 — Sala de Duelo

## NET-003 — Comandos via socket

## NET-004 — Eventos para clientes

## NET-005 — Reconexão

## NET-006 — Ocultação de informações

---

# Definition of Done do MVP

O MVP está pronto quando:

1. Bestas de Fogo e Magos Umbrais conseguem completar partidas;
2. motor é determinístico;
3. regras críticas possuem testes automatizados;
4. toda ação gera log;
5. partida pode ser reproduzida por seed + comandos;
6. UI não consegue executar jogada rejeitada pelo motor;
7. pelo menos 10 partidas automatizadas podem ser executadas em sequência sem crash ou estado impossível.
