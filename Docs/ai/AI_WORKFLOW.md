# Método de Trabalho com IA — Jogo de Cartas

**Versão:** 1.0  
**Objetivo:** permitir desenvolvimento assistido por múltiplos agentes com velocidade, rastreabilidade e preservação do cânone.

---

## 1. Modelo operacional

O projeto usa seis camadas complementares:

1. **Rules** — restrições persistentes e fronteiras arquiteturais.
2. **Skills** — procedimentos reutilizáveis e específicos de domínio.
3. **Commands** — entradas explícitas e curtas para os fluxos mais comuns.
4. **Subagents** — especialistas isolados para pesquisa e revisão.
5. **Worktrees** — isolamento de agentes que precisam escrever em paralelo.
6. **Hooks** — barreiras automáticas contra operações perigosas.

O agente principal da conversa/tarefa atua como **coordenador e integrador**.

---

## 2. Regra de ouro

**Paralelismo para leitura; isolamento para escrita; integração em um único ponto.**

Subagentes read-only podem explorar/revisar simultaneamente. Agentes que alteram código em paralelo devem trabalhar em worktrees/checkouts diferentes.

Nunca permita dois escritores alterando o mesmo arquivo ou contrato ao mesmo tempo.

---

## 3. Fluxo padrão de uma tarefa

### Etapa A — Intake

Classifique a solicitação:

- bug;
- backlog/feature;
- refatoração;
- regra/design;
- balanceamento;
- documentação;
- arquitetura.

Localize os documentos que governam a mudança.

### Etapa B — Context Pack

Antes de delegar, o coordenador monta um pacote de contexto curto:

```md
# Task Brief — <ID/NOME>

## Objetivo

## Não escopo

## Fontes de verdade

## Critérios de aceite

## Arquivos/pacotes afetados

## Dependências

## Decisões pendentes

## Estratégia de testes
```

Um subagente começa com contexto limpo; portanto o prompt delegado precisa conter tudo que ele realmente necessita.

### Etapa C — Plan Gate

Use planejamento explícito quando a tarefa:

- tocar mais de um pacote;
- mudar contrato público;
- alterar regra de Duelo;
- exigir migração/schema;
- possuir múltiplas abordagens plausíveis;
- puder ser dividida entre agentes.

Tarefas pequenas e mecânicas podem ir direto para implementação.

### Etapa D — Decomposição

Divida por fronteira de responsabilidade, não por quantidade arbitrária de arquivos.

Exemplo:

```text
Coordenador
├─ Architect (read-only) ─ impacto e contratos
├─ Worktree A ─ game-engine
├─ Worktree B ─ UI
└─ Test Verifier (read-only) ─ gate após integração
```

Se B depender do contrato produzido por A, não execute os dois como escritores simultâneos antes de congelar o contrato.

### Etapa E — Ownership

Cada frente recebe ownership explícito:

```text
WT-engine: packages/game-engine/** + testes do engine
WT-web: apps/web/**
WT-card-data: packages/card-data/**
```

Arquivos compartilhados, como `packages/shared`, devem possuir um único dono por rodada ou ser atualizados antes de liberar frentes dependentes.

### Etapa F — Implementação

Regras:

- menor mudança coerente;
- teste antes/ao lado da regra quando possível;
- nenhuma mudança de cânone escondida;
- nenhuma refatoração extensa oportunista;
- commits lógicos por unidade de trabalho quando Git estiver sendo usado.

### Etapa G — Handoff

Cada agente escritor devolve:

```md
## Handoff

- Objetivo:
- Arquivos alterados:
- Decisões técnicas:
- Testes executados:
- Resultado dos testes:
- Suposições:
- Pendências/riscos:
- Divergências com docs:
- Contratos alterados:
```

### Etapa H — Integração

O coordenador:

1. inspeciona diffs;
2. resolve conflitos pela fonte de verdade;
3. integra na ordem das dependências;
4. executa testes combinados;
5. chama revisão independente.

### Etapa I — Verification Gate

Uma mudança não trivial só é considerada pronta quando:

- critérios de aceite foram verificados;
- testes relevantes passaram;
- typecheck/lint relevantes passaram, quando configurados;
- não existe divergência canônica silenciosa;
- contratos compartilhados continuam consistentes;
- pendências bloqueantes foram resolvidas ou explicitadas.

Estados de saída:

- `READY`;
- `READY WITH NOTES`;
- `NOT READY`;
- `DECISION REQUIRED`.

---

## 4. Protocolo para mudanças de regra/cânone

Código nunca deve ganhar autoridade sobre a documentação por acidente.

Quando uma implementação exigir decisão ainda não definida:

1. pare apenas a parte dependente;
2. registre a dúvida;
3. mostre opções e impacto;
4. aguarde decisão explícita;
5. atualize primeiro a fonte canônica aprovada;
6. sincronize especificações técnicas;
7. implemente/teste a nova regra.

Isso é especialmente importante para regras marcadas como `PROVISÓRIO`, condições sem valor fechado e palavras-chave conceituais.

---

## 5. Protocolo para bugs do Duelo

Ordem obrigatória:

```text
Relato
  ↓
Seed + comandos + versões
  ↓
Reprodução mínima
  ↓
Primeira transição/evento incorreto
  ↓
Teste de regressão falhando
  ↓
Correção
  ↓
Replay + suíte
  ↓
Revisão
```

Evite corrigir o sintoma na UI quando a causa é o motor.

---

## 6. Protocolo para balanceamento

Balanceamento não é bugfix.

Use:

- simulações Bot vs Bot;
- métricas documentadas;
- sessões humanas;
- comparação entre versões de balanceamento.

Sinais como win rate alto são gatilhos de investigação, não comandos automáticos de nerf.

Mudança numérica precisa ser aprovada como mudança de design e registrada no Catálogo/versão de balanceamento correspondente.

---

## 7. Estratégia de uso dos agentes

### `architect`

Use antes de mudanças multi-módulo ou de contrato.

### `canon-guardian`

Use sempre que regra, carta, balanceamento ou documentação possam divergir.

### `engine-reviewer`

Use após alterações no motor.

### `ui-reviewer`

Use após fluxos relevantes da Web.

### `test-verifier`

Use como gate independente ao final.

### `balance-analyst`

Use para interpretar dados e sugerir experimentos, nunca para aplicar alterações automaticamente.

### `integration-reviewer`

Use quando duas ou mais worktrees/frentes precisarem ser combinadas.

---

## 8. Quando NÃO usar múltiplos agentes

Não paralelize quando:

- a tarefa é pequena;
- todos precisariam editar o mesmo arquivo;
- a segunda frente depende de uma decisão ainda não tomada pela primeira;
- custo de coordenação é maior que o trabalho;
- ainda não existe contrato suficiente para dividir responsabilidade.

Mais agentes não significa automaticamente mais velocidade. Às vezes significa apenas uma reunião corporativa, só que os participantes são GPUs.

---

## 9. Commands recomendados

- `/jc-plan` — produzir plano e decomposição.
- `/jc-implement` — implementar tarefa/backlog.
- `/jc-review` — executar gate final.
- `/jc-bug` — reproduzir/corrigir bug de Duelo.
- `/jc-card` — implementar uma carta já aprovada.
- `/jc-balance` — analisar balanceamento sem alteração automática.

---

## 10. Definition of Done para trabalho de IA

Além do DoD funcional do projeto, uma entrega assistida por IA deve responder claramente:

- O que mudou?
- Por quê?
- Qual fonte autorizou o comportamento?
- Quais testes provaram a mudança?
- Alguma decisão de design foi introduzida?
- Alguma documentação precisa ser sincronizada?
- Existe forma de reproduzir o comportamento relevante?

Se uma dessas respostas for desconhecida em uma mudança não trivial, a entrega ainda não está pronta.
