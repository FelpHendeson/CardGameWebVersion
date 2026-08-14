---
name: frontend-game-flow
description: "Implementa fluxos da Web que transformam interação do jogador em comandos e feedback de eventos sem duplicar regras do motor."
paths:
  - "apps/web/**/*.ts"
  - "apps/web/**/*.tsx"
---
# Frontend Game Flow

Para cada interação:

1. Identifique intenção do usuário.
2. Consulte estado/projeção permitida.
3. Construa comando tipado.
4. Envie ao motor local ou servidor conforme modo.
5. Trate sucesso/rejeição de forma explícita.
6. Atualize UI a partir de estado/eventos confirmados.

Mantenha separado:

- estado de jogo;
- seleção/modal/animação/filtros;
- preview calculado por API/engine quando existir.

Não faça cálculo autoritativo de regras na UI.
