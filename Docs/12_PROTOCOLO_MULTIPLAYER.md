# Protocolo Multiplayer

**Versão:** 0.1  
**Status:** Preparação futura; não bloqueia o protótipo local.

---

## 1. Princípio

Servidor autoritativo.

O cliente envia **intenções**, nunca resultados finais.

---

## 2. Conexão

Fluxo conceitual:

1. jogador autentica;
2. entra em fila/sala;
3. servidor cria `gameId`;
4. ambos recebem snapshot inicial filtrado;
5. cliente ativo envia comandos;
6. servidor valida;
7. servidor executa motor;
8. servidor envia eventos e novo snapshot/delta;
9. processo se repete até `DUEL_ENDED`.

---

## 3. Mensagens cliente → servidor

### `duel.command`

```json
{
  "gameId": "game-123",
  "commandId": "cmd-456",
  "expectedVersion": 17,
  "type": "DECLARE_ATTACK",
  "payload": {
    "attackerInstanceId": "ci-10",
    "attackId": "carbonized-claws",
    "targetInstanceId": "ci-22"
  }
}
```

### `duel.surrender`

### `duel.sync.request`

Solicita snapshot atual após reconexão ou divergência detectada.

---

## 4. Mensagens servidor → cliente

### `duel.snapshot`

Estado filtrado para aquele jogador.

### `duel.events`

Eventos públicos/permitidos desde a última versão.

### `duel.command.rejected`

```json
{
  "commandId": "cmd-456",
  "code": "UNIT_ALREADY_ATTACKED"
}
```

### `duel.ended`

Resultado final.

---

## 5. Versionamento do estado

Cada transição confirmada incrementa `stateVersion`.

Cliente envia `expectedVersion`.

Se estiver desatualizado:

- servidor rejeita ou solicita sincronização;
- cliente recebe snapshot atualizado;
- comando pode ser reapresentado apenas se ainda fizer sentido.

---

## 6. Informação oculta

O servidor mantém o estado completo.

Cada cliente recebe uma projeção.

Adversário não recebe:

- ids canônicos das cartas na mão;
- identidade de cartas não reveladas;
- ordem do Deck;
- identidade de Armadilhas preparadas.

Pode receber identificadores opacos de instância quando necessário para renderização de verso da carta.

---

## 7. Armadilhas e decisões pendentes

Quando uma Armadilha opcional puder ativar, o servidor pode abrir um `DecisionRequest` ao controlador.

Exemplo:

```json
{
  "decisionId": "dec-10",
  "type": "OPTIONAL_TRIGGER",
  "source": "ci-77",
  "options": ["ACTIVATE", "PASS"]
}
```

Enquanto uma decisão obrigatória estiver pendente, novos comandos normais são bloqueados.

---

## 8. Reconexão

Ao reconectar:

1. autenticar jogador;
2. localizar partida ativa;
3. enviar snapshot filtrado atual;
4. enviar decisão pendente, se houver;
5. retomar.

Tempo limite de abandono será configurável futuramente.

---

## 9. Idempotência

`commandId` é único.

Se o mesmo comando for recebido novamente por problema de rede, o servidor não executa duas vezes.

---

## 10. Seed e aleatoriedade

A seed da partida é controlada pelo servidor.

O cliente não decide:

- embaralhamento;
- carta comprada;
- resultado de aleatoriedade futura.

Eventos públicos revelam apenas o necessário.

---

## 11. Anti-cheat estrutural

O protocolo não aceita mensagens como:

- `setMyLife(8000)`;
- `drawCard(BF-006)`;
- `dealDamage(9999)`.

Aceita apenas comandos compatíveis com intenção de jogo.

---

## 12. Critérios para ativar multiplayer

- motor determinístico;
- informação oculta testada;
- replay funcional;
- comandos idempotentes;
- reconexão por snapshot;
- nenhuma regra executada exclusivamente no cliente;
- logs do servidor suficientes para reconstruir divergências.
