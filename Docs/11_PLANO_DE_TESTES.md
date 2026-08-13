# Plano de Testes

**Versão:** 0.1

---

## 1. Objetivo

Validar três coisas diferentes:

1. **correção** — o motor executa as regras como definido;
2. **robustez** — não entra em estados impossíveis;
3. **design/balanceamento** — as decisões produzem partidas interessantes.

Essas três categorias não devem ser confundidas.

---

## 2. Testes unitários do motor

Cobertura obrigatória:

### Turno

- restaura 3 Ações;
- compra 1 carta;
- não acumula Ações;
- limpa `já atacou`.

### Deck

- valida 30 cartas;
- rejeita 29/31;
- rejeita mais de 3 cópias;
- derrota ao tentar comprar de Deck vazio.

### Invocação

- Nível 1–2 custa 1;
- Nível 3–4 custa 2;
- requisito de carta especial;
- campo cheio;
- Ações insuficientes.

### Ataque

- custa 1 Ação;
- só uma vez por turno;
- Estado de Invocação bloqueia;
- Investida permite;
- alvo ilegal é rejeitado;
- proteção do Duelista funciona.

### Dano

- persiste entre turnos;
- redução não gera valor negativo;
- destruição em 0;
- dano excedente normal é perdido;
- Perfuração transfere excesso.

### Armadilhas

- preparação consome Ação;
- ativação não consome nova Ação;
- gatilho incorreto não ativa;
- carta oculta não vaza para adversário.

---

## 3. Testes por carta

Toda carta deve possuir ao menos:

- teste de legalidade;
- teste de efeito principal;
- teste de interação mais importante;
- teste de edge case se possuir habilidade única.

Lendárias e handlers especializados exigem cobertura adicional.

---

## 4. Casos iniciais essenciais

### BF-002 — Rasga-Cinzas

- Frenesi não pode ser usado sem 300 de dano sofrido;
- pode ser usado após atingir requisito;
- Ferocidade ativa em metade ou menos dos PV.

### BF-003 — Cão Magmático de Arkh

- pode atacar no turno de Invocação;
- Investida Magmática causa dano próprio após ataque.

### BF-006 — Pyraxa

- requisito de Invocação;
- cura Bestas ao entrar;
- salva uma Besta da primeira destruição aplicável no turno;
- Perfuração em Mandíbula Solar.

### MU-001 — Aprendiz do Véu

- examina topo ao ser Invocado;
- mantém ou envia ao Descarte sem revelar informação indevida.

### MU-004 — Arconte Sem-Rosto

- não é alvo de efeito que exija tipo específico;
- Roubo de Forma copia apenas efeito permitido pelo contrato.

### MU-006 — Nereth

- recupera Armadilha Mágica do Descarte;
- não paga Ação ao prepará-la pelo efeito;
- cura uma vez por turno ao ativar Armadilha Mágica.

---

## 5. Testes de propriedade

Gerar estados/jogadas automaticamente para garantir invariantes:

- nunca mais de 3 Unidades por jogador;
- Ações nunca negativas;
- uma carta só existe em uma localização lógica por vez;
- PV de exibição nunca negativo;
- Deck + mão + campo + descarte preservam número de instâncias, salvo zonas especiais futuras;
- partida finalizada não aceita novas jogadas.

---

## 6. Simulações automáticas

Bot vs Bot deve gerar lotes de partidas.

Métricas mínimas:

- vencedor;
- primeiro jogador;
- turnos;
- PV final;
- cartas compradas;
- Ações gastas e desperdiçadas;
- frequência de cada carta;
- turno médio de Invocação por Nível;
- dano por fonte;
- Unidades destruídas;
- motivo da vitória.

---

## 7. Alertas de balanceamento

Não são regras automáticas de nerf, apenas sinais para revisão.

Exemplos:

- Deck acima de ~60% de vitória em amostra relevante;
- carta presente em praticamente todas as vitórias;
- carta nunca jogada mesmo quando comprada;
- Nível 5+ raramente chega ao campo;
- primeiro jogador com vantagem excessiva;
- média de Ações desperdiçadas muito alta;
- partidas frequentemente travadas por campo impossível de romper.

---

## 8. Teste humano

Cada sessão deve registrar:

- versão das regras;
- versão das cartas;
- jogadores/decks;
- resultado;
- quantidade de turnos;
- decisões consideradas interessantes;
- momentos frustrantes;
- cartas mortas na mão;
- jogadas dominantes;
- dúvidas de regra;
- sugestões, sem alterar regra no meio da partida quando possível.

---

## 9. Relatório padrão

```md
# Relatório de Teste #NNN

- Motor:
- Catálogo:
- Modo:
- Deck A:
- Deck B:
- Resultado:
- Turnos:

## Problemas de regra

## Problemas de balanceamento

## Bugs

## Momentos interessantes

## Mudanças candidatas
```

---

## 10. Gate para multiplayer

Não iniciar multiplayer real antes de:

- [ ] 100% das regras básicas terem testes;
- [ ] replay determinístico funcionar;
- [ ] 20+ partidas automáticas consecutivas terminarem sem erro;
- [ ] pelo menos 3 sessões humanas completas serem registradas;
- [ ] nenhum bug conhecido permitir divergência de estado.
