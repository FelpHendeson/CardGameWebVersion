# Jogo de Cartas — Instruções para Agentes

## Fonte de verdade

Antes de alterar regras, cartas, motor ou fluxos de Duelo, localize e leia a documentação canônica do projeto.

Hierarquia atual:

1. `01_DOCUMENTO_DO_JOGO.md` — regras e decisões canônicas.
2. `02_CATALOGO_DE_CARTAS.md` — definições canônicas das cartas.
3. `03_ESPECIFICACAO_FUNCIONAL_WEB.md` — comportamento do MVP Web.
4. `04_ESPECIFICACAO_MOTOR_DUELO.md` — comportamento determinístico do motor.
5. Demais documentos técnicos — domínio, dados, efeitos, wireframes, backlog, arquitetura, testes e multiplayer.

Se existir `00_README.md`, ele é o índice da documentação e deve ser consultado para confirmar a hierarquia vigente.

## Princípios obrigatórios

- Código não redefine o cânone silenciosamente.
- Não invente regras para preencher lacunas da documentação.
- Marcadores `PROVISÓRIO` continuam provisórios até decisão explícita.
- Não crie cartas, efeitos, palavras-chave ou números de balanceamento não aprovados.
- Mudanças em `01_DOCUMENTO_DO_JOGO.md` e `02_CATALOGO_DE_CARTAS.md` exigem pedido ou aprovação explícita do responsável pelo projeto.
- O motor de Duelo é a autoridade sobre regras; a UI envia intenções e renderiza resultados.
- Regras ajustáveis devem vir de configuração/dados centralizados, não de números duplicados.
- Toda mudança de regra executável deve possuir teste reproduzível.
- Bugs de Duelo devem ser reproduzidos por seed + comandos sempre que possível.
- Agentes que escrevem em paralelo devem trabalhar em worktrees ou checkouts isolados e possuir ownership de arquivos não sobrepostos.
- Revisão final deve ser feita por contexto/agente diferente do implementador quando a mudança não for trivial.

## Stack alvo do MVP

- TypeScript
- React + Vite
- Node.js + Fastify
- Socket.IO
- pnpm workspace
- Vitest
- Playwright

Não troque a stack por preferência pessoal sem uma decisão explícita de arquitetura.
