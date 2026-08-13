# Especificação do Motor de Duelo

**Versão:** 0.1  
**Objetivo:** transformar as regras canônicas em comportamento determinístico e testável.

---

## 1. Princípio central

O motor deve ser uma biblioteca TypeScript independente de React, DOM, banco de dados ou rede.

Modelo:

```text
GameState + Command
        ↓
    Validation
        ↓
     Events
        ↓
   Reducer/Rules
        ↓
  New GameState
```

A interface nunca altera diretamente o estado de uma partida.

---

## 2. Estado mínimo da partida

`GameState` deve conter:

- id da partida;
- modo;
- status;
- número do turno;
- id do jogador ativo;
- fase lógica atual;
- jogadores;
- pilha/fila interna de eventos em resolução;
- log de eventos já confirmados;
- seed do embaralhamento;
- resultado quando finalizado.

Cada jogador contém:

- id;
- PV atual;
- PV inicial;
- Ações disponíveis;
- Deck;
- Mão;
- Descarte;
- 3 zonas de Unidade;
- 3 zonas de Suporte;
- zona de Campo;
- efeitos globais/controlados.

---

## 3. Comandos do jogador

Comandos iniciais:

- `START_DUEL`
- `SUMMON_UNIT`
- `DECLARE_ATTACK`
- `PLAY_SPELL`
- `PLAY_EQUIPMENT`
- `SET_TRAP`
- `ACTIVATE_TRIGGERED_CARD`
- `PLAY_FIELD`
- `ACTIVATE_ABILITY`
- `END_TURN`
- `SURRENDER`

Todo comando deve incluir:

- `gameId`;
- `playerId`;
- `commandId` único;
- payload específico;
- versão esperada do estado, quando usado em multiplayer.

---

## 4. Validação

Antes de produzir qualquer evento, o motor valida:

1. partida está ativa;
2. jogador possui direito de executar o comando;
3. carta/Unidade existe no local declarado;
4. alvo existe e é válido;
5. há Ações suficientes;
6. há espaço disponível;
7. requisitos específicos são satisfeitos;
8. estados impeditivos são respeitados;
9. a jogada não viola regra global.

Falha retorna erro estruturado e **não altera estado**.

Exemplos de códigos:

- `NOT_YOUR_TURN`
- `INSUFFICIENT_ACTIONS`
- `INVALID_TARGET`
- `UNIT_ALREADY_ATTACKED`
- `SUMMON_SICKNESS`
- `UNIT_ZONE_FULL`
- `REQUIREMENT_NOT_MET`
- `DIRECT_ATTACK_BLOCKED`

---

## 5. Início da partida

Sequência:

1. validar Decks;
2. criar instâncias das cartas;
3. embaralhar com seed conhecida;
4. definir primeiro jogador;
5. definir PV pelo modo;
6. comprar 5 cartas para cada Duelista;
7. definir turno 1;
8. iniciar fluxo de turno.

### PROVISÓRIO

A regra sobre o primeiro jogador comprar ou não no primeiro turno ainda deve ser validada em testes. O motor deve permitir configuração.

---

## 6. Fluxo do turno

Estados lógicos:

`TURN_START → DRAW → ACTION_REFRESH → FREE_PHASE → TURN_END`

### TURN_START

Processa efeitos que ocorram no início do turno.

### DRAW

Compra 1 carta, salvo modificadores.

Se o Deck estiver vazio quando uma compra obrigatória for realizada, o jogador perde.

### ACTION_REFRESH

Define as Ações disponíveis para o valor configurado, atualmente 3.

### FREE_PHASE

Aceita comandos válidos do Duelista ativo.

### TURN_END

Processa efeitos de fim de turno, limpa marcadores temporários e passa o turno.

---

## 7. Instância de carta

Uma carta do Catálogo é imutável como definição.

Durante a partida, o motor cria uma `CardInstance` com estado próprio.

Exemplo conceitual:

```ts
interface CardInstance {
  instanceId: string;
  cardId: string;
  ownerId: string;
  controllerId: string;
  zone: Zone;
  revealed: boolean;
}
```

Unidades estendem o estado com:

- `currentHp`;
- `maxHpModifier`;
- `hasAttackedThisTurn`;
- `summonedOnTurn`;
- condições;
- equipamentos vinculados;
- modificadores temporários/permanentes.

---

## 8. Invocação

Entrada: `SUMMON_UNIT`.

Valida:

- carta está na mão;
- zona escolhida está vazia;
- custo pode ser pago;
- requisitos especiais são atendidos.

Eventos típicos:

1. `ACTIONS_SPENT`
2. `CARD_MOVED`
3. `UNIT_SUMMONED`
4. `ON_SUMMON_TRIGGERS_CREATED`
5. `STATE_STABILIZED`

A Unidade recebe Estado de Invocação até a regra liberar seu ataque.

---

## 9. Estado de Invocação

Regra padrão:

Uma Unidade não pode atacar no mesmo turno em que foi Invocada.

**Investida** ignora essa restrição.

O motor não deve armazenar apenas um booleano arbitrário; deve ser possível determinar a restrição pela combinação de:

- turno de Invocação;
- palavras-chave;
- efeitos ativos.

---

## 10. Ataque

Entrada: `DECLARE_ATTACK`.

Payload mínimo:

- Unidade atacante;
- id do ataque;
- alvo.

Valida:

- Unidade pertence/controlada pelo jogador ativo;
- Unidade pode agir;
- não atacou nesse turno;
- há pelo menos 1 Ação;
- ataque existe;
- alvo é legal;
- ataque direto está permitido.

Eventos:

1. `ATTACK_DECLARED`
2. `ACTIONS_SPENT`
3. abertura dos gatilhos de Armadilha aplicáveis;
4. resolução dos gatilhos;
5. se o ataque continuar válido: `DAMAGE_DEALT`;
6. aplicar efeitos pós-dano;
7. verificar destruições;
8. processar Perfuração;
9. `UNIT_ATTACK_MARKED`;
10. estabilizar estado.

---

## 11. Ordem de resolução

O protótipo não possui uma pilha de respostas livre.

Modelo recomendado:

1. comando é declarado;
2. gatilhos obrigatórios são identificados;
3. gatilhos opcionais elegíveis são oferecidos ao controlador quando necessário;
4. efeitos de prevenção/substituição são aplicados;
5. efeito principal resolve;
6. efeitos derivados são emitidos;
7. destruições são processadas;
8. condições de vitória são verificadas;
9. estado é estabilizado.

Uma nova ação voluntária só pode ser iniciada quando o estado estiver estável.

---

## 12. Dano

Todo dano deve possuir metadados:

- fonte;
- alvo;
- valor base;
- valor final;
- tipo/origem;
- se veio de ataque, Magia, Armadilha, condição etc.;
- tags relevantes.

Pipeline recomendado:

```text
Dano base
→ modificadores de fonte
→ modificadores do alvo
→ prevenção/redução
→ valor final
→ aplicação de PV
→ efeitos pós-dano
```

Nenhum PV deve ficar abaixo de 0 para exibição; internamente o evento pode registrar o excesso antes da normalização.

---

## 13. Perfuração

Ao destruir uma Unidade por ataque com Perfuração:

```text
excesso = dano_final - PV_da_unidade_imediatamente_antes_do_dano
```

Se `excesso > 0`, causar esse valor ao Duelista defensor.

Perfuração não deve ocorrer em dano que não seja ataque, salvo texto explícito da carta.

---

## 14. Destruição

Quando uma Unidade possui PV <= 0 após estabilização de dano:

1. marcar `PENDING_DESTRUCTION`;
2. aplicar efeitos de substituição, como permanecer com 100 PV;
3. caso não seja salva, emitir `UNIT_DESTROYED`;
4. remover Equipamentos conforme regras aplicáveis;
5. mover a Unidade para o Descarte;
6. liberar zona;
7. emitir gatilhos de destruição.

---

## 15. Armadilhas

Uma Armadilha preparada possui:

- `setTurn`;
- `revealed = false`;
- gatilho definido pela carta;
- estado de elegibilidade.

Quando um evento satisfaz o gatilho:

- criar oportunidade de ativação;
- se obrigatória, ativar automaticamente;
- se opcional, solicitar decisão ao controlador;
- revelar;
- resolver;
- mover ao destino definido pela carta.

Ativação não consome Ação adicional.

---

## 16. Magias, Equipamentos e Campos

### Magias

Efeito de uso normalmente imediato e depois Descarte.

### Equipamentos

Criam vínculo com uma Unidade. O vínculo deve ser uma relação explícita no estado, não apenas um modificador solto.

### Campos

Cada jogador possui no máximo um Campo próprio no protótipo. Substituir um Campo remove seus efeitos antes de aplicar o novo.

---

## 17. Status

Um `StatusInstance` deve possuir:

- tipo;
- fonte;
- alvo;
- intensidade;
- duração;
- turno aplicado;
- momento de tick;
- regras de acumulação.

### PROVISÓRIO

Os valores exatos de Queimadura e Veneno ainda não são canônicos. Devem ser definidos como parâmetros configuráveis por carta/efeito, não como número global obrigatório.

---

## 18. Modificadores

Modificadores não devem alterar a definição original da carta.

Tipos:

- temporário;
- enquanto condição for verdadeira;
- enquanto fonte permanecer em campo;
- até fim do turno;
- permanente naquela instância durante a partida.

Ordem de aplicação deve ser determinística.

---

## 19. Vitória

Após cada estabilização relevante, verificar:

1. algum Duelista possui PV <= 0;
2. ocorreu falha de compra obrigatória por Deck vazio;
3. houve desistência;
4. existe condição alternativa declarada por carta futura.

O resultado gera `DUEL_ENDED` e bloqueia novos comandos de jogo.

---

## 20. Determinismo

Com:

- mesmo estado inicial;
- mesma seed;
- mesma sequência de comandos;

...o motor deve gerar os mesmos eventos e o mesmo estado final.

Essa propriedade é obrigatória para:

- testes;
- replay;
- debugging;
- multiplayer;
- simulações de balanceamento.

---

## 21. Snapshot e replay

O motor deve permitir serializar `GameState`.

Para testes, guardar:

- seed;
- snapshot inicial;
- sequência de comandos;
- eventos resultantes.

Uma partida deve poder ser reproduzida localmente sem servidor externo.

---

## 22. Contrato de erro

Exemplo:

```ts
interface RuleError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}
```

A UI traduz `code` em mensagem amigável, mas o motor permanece independente de idioma.

---

## 23. Critérios de aceite do motor v0.1

- [ ] mesma seed produz mesma ordem de Deck;
- [ ] comandos inválidos não alteram estado;
- [ ] custo de Ações é aplicado uma única vez;
- [ ] Invocação respeita Nível e requisitos;
- [ ] Estado de Invocação funciona;
- [ ] Investida funciona;
- [ ] ataque só ocorre uma vez por Unidade/turno;
- [ ] dano persiste;
- [ ] destruição libera zona;
- [ ] Perfuração calcula excesso corretamente;
- [ ] Armadilha dispara em gatilho correto;
- [ ] efeitos de Campo entram e saem corretamente;
- [ ] vitória por PV funciona;
- [ ] derrota por Deck vazio funciona;
- [ ] log de eventos permite reconstruir a partida;
- [ ] Bestas de Fogo vs Magos Umbrais pode ser concluído sem estado impossível.
