---
name: duel-debugging
description: "Investiga bugs de Duelo de forma reproduzível por seed, comandos, eventos e invariantes antes de corrigir."
disable-model-invocation: true
---
# Duel Debugging

1. Reúna `gameId` se houver, seed, versão do motor, versão do catálogo e sequência de comandos.
2. Reproduza com o menor conjunto possível.
3. Identifique o primeiro evento/transição divergente, não apenas o sintoma final.
4. Classifique: validação, targeting, custo de Ação, efeito, dano, status, zona, vitória, serialização/replay ou UI.
5. Escreva teste de regressão que falha.
6. Corrija na autoridade responsável.
7. Reexecute replay/teste e verifique eventos.
8. Execute suíte relacionada.
9. Entregue causa raiz + evidência do fix.
