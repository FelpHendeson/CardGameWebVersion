# Guerra das Cinzas e do Véu

Protótipo Web jogável 0.1 — **Bestas de Fogo vs Magos Umbrais** no mesmo navegador.

Sandbox local, sem multiplayer, sem login e sem loja. O objetivo é provar que o duelo funciona.

## Requisitos

- Node.js 20+
- pnpm 9+ (`corepack enable` se ainda não tiver)

## Rodar em casa

```bash
pnpm install
pnpm dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000).

1. Escolha Duelo Rápido (4000 PV) ou Oficial (8000 PV).
2. Opcionalmente informe uma seed (mesma seed = mesma ordem de Deck).
3. Clique em **Iniciar Duelo**.
4. Clique na carta → escolha a ação → escolha alvo/espaço → confirme.
5. **Encerrar turno** passa o controle para o outro Duelista (hotseat).

Decks iniciais: 3 cópias de cada uma das 10 cartas de cada arquétipo (30 cartas, mão inicial 5, 3 Ações por turno).

Em desenvolvimento, o painel **Debug** à direita mostra o `GameState`, a seed e atalhos (comprar carta, setar PV, etc.).

## Qualidade

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Se `pnpm dev` já estiver rodando, o Playwright reutiliza a porta 3000.

## Pacotes

| Pacote | Função |
| --- | --- |
| `@duelo/shared` | Tipos e contratos |
| `@duelo/game-data` | Cartas, regras, decks |
| `@duelo/game-engine` | Motor determinístico (sem React/DOM/Next) |
| `@duelo/web` | Mesa Sandbox |

Uma futura app React Native poderá importar `game-engine`, `game-data` e `shared` sem reescrever as regras.

## Documentação

Fonte de verdade em `Docs/`. Notas técnicas:

- `Docs/IMPLEMENTACAO.md` — como o código está organizado
- `Docs/DECISOES_PROVISORIAS.md` — interpretações do protótipo (não são cânone)
- `Docs/BUGS_CONHECIDOS.md`

## Fora deste milestone

Autenticação, banco, multiplayer, matchmaking, loja, pacotes e campanha.
