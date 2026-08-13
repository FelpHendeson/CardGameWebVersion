# Modelo de Domínio

**Versão:** 0.1

---

## 1. Visão

O domínio é dividido em quatro áreas:

1. **Catálogo** — definições imutáveis das cartas.
2. **Deckbuilding** — Decks construídos por Duelistas.
3. **Duelo** — instâncias temporárias de cartas e estado da partida.
4. **Progressão** — perfil, Rank, títulos e histórico.

---

## 2. Entidades principais

### Duelist

- `id`
- `displayName`
- `rank`
- `rankProgress`
- `equippedTitleId?`
- `stats`

### CardDefinition

Representa a carta canônica no Catálogo.

- `id` — exemplo `BF-002`
- `name`
- `category`
- `rarity`
- `level?`
- `types[]`
- `rulesText`
- `lore`
- `visualDescription`
- `mechanics`

### DeckDefinition

- `id`
- `ownerId`
- `name`
- `cards[]` com `cardId` e quantidade
- `format`
- `isValid`

### Duel

- `id`
- `mode`
- `status`
- `players[]`
- `turn`
- `activePlayerId`
- `seed`
- `result?`

### DuelPlayerState

- `duelistId`
- `life`
- `actions`
- `deck[]`
- `hand[]`
- `discard[]`
- `unitZones[3]`
- `supportZones[3]`
- `fieldZone?`

### CardInstance

Instância única de uma carta dentro de um Duelo.

- `instanceId`
- `cardId`
- `ownerId`
- `controllerId`
- `zone`
- `revealed`

### UnitInstanceState

- `instanceId`
- `currentHp`
- `hasAttackedThisTurn`
- `summonedOnTurn`
- `statuses[]`
- `equipmentIds[]`
- `modifiers[]`

### StatusInstance

- `id`
- `type`
- `sourceInstanceId?`
- `targetInstanceId`
- `intensity`
- `duration`
- `tickTiming`

### Modifier

- `id`
- `source`
- `target`
- `property`
- `operation`
- `value`
- `duration`

### DuelEvent

Evento imutável produzido pelo motor.

- `eventId`
- `sequence`
- `turn`
- `type`
- `actorId?`
- `sourceInstanceId?`
- `targetIds[]`
- `payload`

---

## 3. Value Objects

### LifePoints

Valor inteiro não negativo para exibição.

### ActionPoints

Quantidade disponível de Ações.

### CardId

Identificador canônico estável.

### CardInstanceId

Identificador único da cópia durante uma partida.

### Zone

Valores iniciais:

- `DECK`
- `HAND`
- `UNIT`
- `SUPPORT`
- `FIELD`
- `DISCARD`

Estados como `EQUIPPED` e `SET` podem ser modelados por relação/estado específico em vez de zona independente, desde que o motor preserve clareza.

---

## 4. Agregados

### Catalog Aggregate

Fonte de definição das cartas.

### Deck Aggregate

Responsável por:

- contagem;
- limite de cópias;
- validação de formato.

### Duel Aggregate

Única autoridade sobre:

- zonas;
- PV;
- Ações;
- turno;
- efeitos;
- legalidade das jogadas;
- resultado.

A UI não pode alterar membros internos do agregado diretamente.

---

## 5. Serviços de domínio

### DeckValidator

Valida regras de Deck.

### RuleEngine

Valida comandos e produz eventos.

### EffectResolver

Executa efeitos declarativos.

### TargetResolver

Determina alvos válidos.

### DamageResolver

Calcula dano, redução, prevenção e Perfuração.

### StatusResolver

Gerencia aplicação e expiração de condições.

### VictoryResolver

Verifica condições de encerramento.

---

## 6. Relações importantes

```text
Duelist 1 ─── N DeckDefinition

DeckDefinition N ─── N CardDefinition

Duel 1 ─── 2 DuelPlayerState

DuelPlayerState 1 ─── N CardInstance

CardInstance 1 ─── 0..1 UnitInstanceState

UnitInstanceState 1 ─── N StatusInstance
UnitInstanceState 1 ─── N Modifier

Duel 1 ─── N DuelEvent
```

---

## 7. Regra de imutabilidade

`CardDefinition` nunca é alterada durante uma partida.

Se uma carta recebe +100 PV, o motor cria um modificador na instância. Isso evita que efeitos temporários contaminem a definição global da carta.
