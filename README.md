# Guerra das Cinzas e do Véu

Protótipo Web jogável 0.1 — Bestas de Fogo vs Magos Umbrais no mesmo navegador.

## Stack

- TypeScript (strict)
- pnpm workspaces
- React + Next.js (App Router)
- Tailwind CSS
- Vitest + Playwright

## Rodar o Sandbox

```bash
pnpm install
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Qualidade

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Pacotes

| Pacote | Função |
| --- | --- |
| `@duelo/shared` | Contratos e tipos |
| `@duelo/game-data` | Cartas, regras, decks |
| `@duelo/game-engine` | Motor determinístico |
| `@duelo/web` | Mesa Sandbox |

O motor não depende de React, DOM ou Next.js. A futura app React Native poderá reutilizar `game-engine`, `game-data` e `shared`.

## Documentação

Fonte de verdade em `Docs/`. Notas de implementação em:

- `Docs/IMPLEMENTACAO.md`
- `Docs/DECISOES_PROVISORIAS.md`
- `Docs/BUGS_CONHECIDOS.md`
