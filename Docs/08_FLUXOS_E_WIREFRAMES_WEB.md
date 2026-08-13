# Fluxos e Wireframes — Web

**Versão:** 0.1

---

## 1. Fluxo principal do usuário

```text
Tela Inicial
   ↓
Dashboard
   ├── Catálogo
   ├── Decks
   └── Duelar
          ↓
     Selecionar modo
          ↓
     Selecionar Deck
          ↓
        Duelo
          ↓
       Resultado
          ↓
     Novo Duelo / Dashboard
```

---

## 2. Dashboard

```text
┌──────────────────────────────────────────────────────────┐
│ LOGO                         Recruta III   [Configurações]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│                BEM-VINDO, DUELISTA                       │
│                                                          │
│                   [  DUELAR  ]                           │
│                                                          │
│   Deck ativo                                             │
│   ┌───────────────────────────────┐                      │
│   │ Bestas de Fogo                │                      │
│   │ 30/30 cartas                  │                      │
│   └───────────────────────────────┘                      │
│                                                          │
│   [Decks]       [Catálogo]       [Histórico]             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Catálogo

```text
┌──────────────────────────────────────────────────────────┐
│ Catálogo                                                 │
│ [Buscar________________] [Tipo▼] [Raridade▼] [Nível▼]   │
├──────────────────────────────────────────────────────────┤
│ [Carta] [Carta] [Carta] [Carta]                          │
│ [Carta] [Carta] [Carta] [Carta]                          │
│ [Carta] [Carta] [Carta] [Carta]                          │
└──────────────────────────────────────────────────────────┘
```

Ao selecionar uma carta:

```text
┌──────────────────────────────────────────────────────────┐
│ [ARTE GRANDE]   Pyraxa, Mãe da Chama Primeva            │
│                Nível 7 • Lendária                        │
│                Besta Ancestral / Fogo                    │
│                PV 4200                                   │
│                                                          │
│                Ataques                                   │
│                • Rugido Primordial                       │
│                • Mandíbula Solar                         │
│                                                          │
│                [Mecânica] [Lore]                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Deck Builder

Desktop em duas colunas:

```text
┌────────────────────────────┬─────────────────────────────┐
│ Catálogo                   │ Deck: Bestas de Fogo       │
│ [Filtros]                  │ 30/30                      │
│                            │                             │
│ [Carta] [Carta] [Carta]    │ BF-001 x3                  │
│ [Carta] [Carta] [Carta]    │ BF-002 x3                  │
│                            │ BF-003 x2                  │
│                            │ ...                         │
│                            │                             │
│                            │ [Salvar] [Validar]          │
└────────────────────────────┴─────────────────────────────┘
```

Interações:

- clique adiciona;
- botão `+/-` altera quantidade;
- hover/clique mostra detalhes;
- filtros permanecem visíveis;
- status de validade é persistente.

---

## 5. Seleção de Duelo

```text
┌─────────────────────────────────────────┐
│ Escolha o Duelo                         │
│                                         │
│ [ Duelo Oficial ]  8000 PV              │
│ [ Duelo Rápido  ]  4000 PV              │
│                                         │
│ Deck: [Bestas de Fogo ▼]                │
│                                         │
│            [ INICIAR ]                  │
└─────────────────────────────────────────┘
```

---

## 6. Mesa de Duelo

Desktop deve manter todo estado essencial visível sem rolagem vertical.

```text
┌───────────────────────────────────────────────────────────┐
│ NerethFan — 8000 PV     Mão 4 | Deck 20 | Descarte 3     │
│                                                           │
│       [U1]            [U2]            [U3]                │
│       [S1]            [S2]            [S3]                │
│                     [Campo]                               │
│───────────────────────────────────────────────────────────│
│                     [Campo]                               │
│       [S1]            [S2]            [S3]                │
│       [U1]            [U2]            [U3]                │
│                                                           │
│ Ações: ● ● ○                           [Encerrar turno]   │
│                                                           │
│ [C1] [C2] [C3] [C4] [C5] [C6]                           │
│ Felipe — 6700 PV        Deck 18 | Descarte 5             │
└───────────────────────────────────────────────────────────┘
```

### Painel lateral opcional

- log;
- detalhes da carta selecionada;
- efeitos ativos;
- histórico do turno.

---

## 7. Interação durante ataque

1. clique na Unidade;
2. menu mostra ataques disponíveis;
3. selecionar ataque;
4. alvos válidos recebem destaque;
5. clicar no alvo;
6. preview apresenta dano base e custo;
7. confirmar.

A UI não deve revelar resultado futuro de Armadilhas ocultas.

---

## 8. Estados visuais

Unidade deve comunicar claramente:

- PV atual/máximo;
- pode atacar;
- já atacou;
- Estado de Invocação;
- Atordoamento;
- Queimadura;
- Veneno;
- Proteção;
- Equipamentos.

Evitar depender apenas de cor. Utilizar ícone + texto/tooltip.

---

## 9. Resultado

```text
┌──────────────────────────────────────┐
│               VITÓRIA               │
│                                      │
│ Turnos: 13                           │
│ Dano causado: 9.400                  │
│ Unidades destruídas: 7               │
│                                      │
│ [Novo Duelo]      [Dashboard]        │
└──────────────────────────────────────┘
```

---

## 10. Sandbox / Debug

Em ambiente de desenvolvimento:

```text
[Estado JSON] [Seed] [Pular animações]
[Comprar carta] [Adicionar ação] [Reiniciar]
[Exportar replay] [Importar replay]
```

Esses controles não aparecem na build normal.
