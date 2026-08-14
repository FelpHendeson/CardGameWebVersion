---
name: implement-backlog-item
description: "Implementa uma história/onda do backlog do MVP com escopo, critérios de aceite, testes e handoff claros. Use para itens WEB-, GAME-, UI-, DEV-, DECK-, BOT- ou NET-."
---
# Implement Backlog Item

## Antes de editar

1. Localize o item no backlog vigente.
2. Leia documentação canônica e técnica afetada.
3. Liste critérios de aceite exatamente como documentados.
4. Identifique arquivos/pacotes afetados e não escopo.
5. Se a mudança atravessar módulos, peça apoio do subagente `architect` ou faça um plano explícito.
6. Se houver ambiguidade de regra, marque decisão necessária antes de codificar essa parte.

## Implementação

- Faça a menor mudança que satisfaça o item.
- Preserve fronteiras do `game-engine`, Web e servidor.
- Para regras do motor, use a skill `game-engine-tdd`.
- Para carta, use `card-definition`.
- Não faça refatorações amplas não necessárias.

## Gate

1. Execute testes focados.
2. Execute typecheck/lint/suíte relevante se disponíveis.
3. Rode `canon-check` quando houver regra/carta.
4. Para mudança não trivial, peça verificação ao `test-verifier`.
5. Entregue handoff com critérios de aceite marcados como PASSOU/FALHOU/NÃO EXECUTADO.
