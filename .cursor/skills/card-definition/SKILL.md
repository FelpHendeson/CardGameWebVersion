---
name: card-definition
description: "Cria ou ajusta a definição executável de uma carta já aprovada, usando o Catálogo como fonte e mantendo efeitos majoritariamente declarativos."
paths:
  - "packages/card-data/**"
  - "**/cards/**/*.json"
  - "**/cards/**/*.ts"
---
# Card Definition

## Fonte

Use `02_CATALOGO_DE_CARTAS.md` como verdade para a carta solicitada.

## Procedimento

1. Localize a carta por ID canônico.
2. Extraia apenas dados documentados: categoria, raridade, tipos, Nível, PV, ataques, efeitos, requisitos, keywords, lore/visual quando fazem parte do schema.
3. Mapeie efeitos simples para operações declarativas.
4. Use handler especializado somente quando o schema vigente não representar o efeito com clareza.
5. Se usar handler, crie teste dedicado.
6. Valide o schema e a versão de balanceamento conforme o contrato atual.
7. Compare definição final com o Catálogo.

Nunca crie uma carta nova ou complete informação ausente por conta própria.
