# Arquitetura Web Recomendada

**Versão:** 0.1

---

## 1. Stack escolhida

Para o primeiro produto Web:

- **TypeScript** em todas as camadas;
- **React + Vite** no cliente;
- **Node.js + Fastify** no servidor;
- **Socket.IO** para multiplayer em tempo real e reconexão simplificada;
- **pnpm workspace** para monorepo;
- **Vitest** para testes unitários;
- **Playwright** para testes E2E;
- persistência inicialmente opcional/local; banco pode entrar quando perfil/matchmaking deixarem de ser protótipo.

A decisão principal é compartilhar contratos e motor entre Web, servidor e futura versão mobile.

---

## 2. Estrutura de repositório

```text
/
├─ apps/
│  ├─ web/
│  └─ server/
├─ packages/
│  ├─ game-engine/
│  ├─ card-data/
│  ├─ shared/
│  └─ ui-models/
├─ tests/
│  ├─ simulations/
│  └─ fixtures/
└─ docs/
```

---

## 3. packages/game-engine

Não pode importar React, Fastify, Socket.IO ou APIs do navegador.

Responsabilidades:

- estado;
- validação;
- comandos;
- eventos;
- efeitos;
- combate;
- status;
- vitória;
- serialização;
- replay.

API conceitual:

```ts
createDuel(config): GameState
executeCommand(state, command): EngineResult
replay(initialState, commands): GameState
```

---

## 4. packages/card-data

Contém:

- schema das cartas;
- definições BF/MU;
- validação em build/teste;
- versões de balanceamento.

Nenhuma carta deve depender diretamente da UI.

---

## 5. apps/web

Responsabilidades:

- renderizar estado;
- capturar intenção do usuário;
- enviar comandos;
- apresentar eventos;
- Deck Builder;
- catálogo;
- sandbox.

A Web não calcula resultado de ataque por conta própria. Pode exibir preview estimado apenas se esse preview vier de uma função do motor.

---

## 6. apps/server

No multiplayer:

- mantém a partida autoritativa;
- recebe comandos;
- valida através do `game-engine`;
- persiste estado quando necessário;
- filtra informações ocultas por jogador;
- envia eventos/snapshots.

---

## 7. Estado no cliente

Separar:

### Estado de jogo

Snapshot recebido do motor/servidor.

### Estado de UI

- carta selecionada;
- modal aberto;
- ataque sendo escolhido;
- animação atual;
- filtros do Catálogo.

Nunca misturar estado de regra com estado visual.

---

## 8. Modo local

Para Sandbox e desenvolvimento:

```text
Web
 ↓ comando
Game Engine local
 ↓ eventos
Web
```

Sem servidor obrigatório.

---

## 9. Modo multiplayer

```text
Web A ──command──► Server
                    │
                    ▼
               Game Engine
                    │
                 events
                    │
           ┌────────┴────────┐
           ▼                 ▼
        Web A             Web B
```

O servidor filtra o estado para não revelar mão/Deck adversários.

---

## 10. Persistência

### Etapa protótipo

- LocalStorage/IndexedDB para Decks e preferências;
- arquivos/replays exportáveis para testes.

### Etapa online

Banco relacional recomendado para:

- usuários;
- Decks;
- partidas;
- resultados;
- progressão;
- versões de cartas.

O estado transitório de partidas pode ser mantido em memória inicialmente e evoluir para armazenamento apropriado quando houver necessidade real de escala/reconexão durável.

---

## 11. Configuração central

Exemplo:

```ts
const duelRules = {
  officialLife: 8000,
  quickLife: 4000,
  actionsPerTurn: 3,
  initialHandSize: 5,
  drawPerTurn: 1,
  unitSlots: 3,
  supportSlots: 3,
  deckSize: 30,
  maxCopiesPerCard: 3
};
```

Esses valores não devem ser duplicados em componentes.

---

## 12. Observabilidade

Toda partida de desenvolvimento deve possuir:

- `gameId`;
- seed;
- versão do motor;
- versão do catálogo;
- sequência de comandos;
- eventos;
- resultado.

Isso transforma bugs de “aconteceu uma coisa estranha” em casos reproduzíveis.

---

## 13. Segurança futura

No online:

- cliente nunca escolhe carta comprada;
- cliente nunca informa dano final;
- cliente nunca envia “eu destruí esta Unidade”;
- cliente envia intenção;
- servidor decide resultado.

Exemplo correto:

`DECLARE_ATTACK(attacker, attackId, target)`

Exemplo incorreto:

`DEAL_900_DAMAGE_TO(target)`

---

## 14. Compatibilidade futura com React Native

A futura aplicação React Native poderá reutilizar:

- `game-engine`;
- `card-data`;
- contratos `shared`;
- regras de Deck;
- protocolo multiplayer.

A camada de interface será substituída, mas o jogo continuará sendo o mesmo motor.
