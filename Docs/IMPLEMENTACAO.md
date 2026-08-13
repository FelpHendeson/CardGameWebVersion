# Implementação — Sandbox 0.1

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:3000`.

Qualidade:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Estrutura

```text
apps/web                 Next.js App Router — Sandbox
packages/shared          Tipos e contratos
packages/game-data       Catálogo, regras, decks iniciais
packages/game-engine     Motor puro (Node), sem React/DOM
Docs/                    Documentação canônica + notas técnicas
```

## API pública do motor

```ts
createDuel(input) → GameState
executeCommand(state, command) → EngineResult
getLegalActions(state, playerId)
getValidTargets(state, playerId, action)
previewAttackDamage(...)
replay(initialState, commands)
```

A UI **não** aplica regras. Ela pergunta ao motor e envia comandos.

## Decks do Sandbox

- Bestas de Fogo: 3 cópias de BF-001…BF-010 (30)
- Magos Umbrais: 3 cópias de MU-001…MU-010 (30)

## Debug (apenas development)

No painel lateral: GameState JSON, seed, comprar carta, setar PV, adicionar carta à mão, restaurar Ações.

E2E usa `/?scripted=1` para embaralhar de forma previsível (`shuffle: false`, P1 primeiro).

```bash
pnpm test:e2e
```

Se a porta 3000 já estiver em uso pelo `pnpm dev`, o Playwright reutiliza o servidor.
