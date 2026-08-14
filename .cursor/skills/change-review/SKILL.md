---
name: change-review
description: "Executa gate final de uma mudança: escopo, diff, testes, documentação, cânone e riscos antes de considerar pronta."
disable-model-invocation: true
---
# Change Review

## Revisão

1. Releia objetivo e critérios de aceite.
2. Inspecione diff completo e arquivos novos.
3. Procure mudanças fora do escopo.
4. Verifique contratos e dependências afetados.
5. Rode testes focados e suíte relevante.
6. Rode `canon-check` se houver jogo/cartas/regras.
7. Para motor, solicite `engine-reviewer`; para Web, `ui-reviewer`.
8. Use `test-verifier` como verificação independente quando a mudança não for trivial.

## Resultado

Retorne um dos estados:

- READY — critérios e gates atendidos;
- READY WITH NOTES — pronto, com observações não bloqueantes;
- NOT READY — existe falha bloqueante;
- DECISION REQUIRED — falta decisão de produto/cânone.
