---
name: game-engine-tdd
description: "Fluxo TDD para implementar ou corrigir regras determinísticas no packages/game-engine, preservando comandos, eventos, seed, replay e invariantes."
paths:
  - "packages/game-engine/**/*.ts"
  - "tests/**/*.ts"
---
# Game Engine TDD

## Ciclo

1. Defina o comportamento a partir da documentação.
2. Escreva/reproduza um teste que falha.
3. Se for bug de partida, fixe seed e sequência mínima de comandos.
4. Corrija na menor camada responsável.
5. Verifique que comando inválido não muta estado.
6. Verifique eventos produzidos, não apenas snapshot final.
7. Verifique invariantes relevantes.
8. Rode teste focado e suíte do game-engine.

## Regras especiais

- Não use relógio/aleatoriedade global não controlada.
- Não coloque React, DOM, Fastify, Socket.IO ou persistência no motor.
- Não modifique `CardDefinition` durante duelo.
- Não duplique custo de Ação ou constantes em handlers se já existe resolução central.
- Se o caso exigir nova regra não documentada, interrompa essa parte e sinalize decisão necessária.
