---
name: multiplayer-contract
description: "Implementa ou revisa contratos multiplayer server-authoritative, incluindo intenção, idempotência, versionamento, snapshots filtrados e reconexão."
paths:
  - "apps/server/**"
  - "packages/shared/**"
---
# Multiplayer Contract

Antes de implementar, confirme que a tarefa pertence à onda multiplayer e que gates aplicáveis foram satisfeitos ou explicitamente dispensados.

Checklist:

- cliente envia comandos/intenção;
- servidor executa game-engine;
- `commandId` idempotente;
- versão esperada tratada;
- snapshot filtrado por jogador;
- ordem do Deck e mão adversária não vazam;
- Armadilhas ocultas permanecem ocultas;
- seed/aleatoriedade no servidor;
- reconexão recebe snapshot atual e decisão pendente;
- erros são estruturados;
- testes cobrem informação oculta e comando duplicado.
