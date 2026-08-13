# Decisões Provisórias

**Status:** NÃO canônicas. Devem ser validadas em partidas antes de entrar no Documento do Jogo.

Estas decisões existem apenas para o Sandbox 0.1 poder ser jogado e testado.

---

## 1. Semântica de condições (protótipo)

Definidas em `DEFAULT_GAME_RULES.status` (`packages/game-data`).

### Queimadura

- 100 de dano no **início do turno do controlador** da Unidade.
- Duração padrão: **2 ativações**.
- Se **Caldeira de Cinerath** estiver ativa, o tick causa +100 adicional.

### Veneno / Veneno Sombrio

- 100 de dano no **final do turno do controlador**.
- Permanece enquanto a Unidade estiver no campo, salvo remoção.
- Veneno Sombrio é uma tag/variante de Veneno (`SHADOW_POISON`) para interações futuras.

### Atordoamento

- A Unidade **não pode atacar**.
- Expira no **fim do turno do controlador**:
  - se aplicado no turno do controlador, expira no fim desse turno;
  - se aplicado no turno do adversário, expira no fim do próximo turno do controlador.
- Divergência consciente da redação “até o início do próximo turno”: a leitura literal tornaria Constrição Ardente inútil.

### Proteção

- Quantidade de redução/absorção definida pelo efeito que a concedeu.
- Não é aumento de PV.
- Nenhuma carta do catálogo 0.1 aplica Proteção genérica ainda; o status existe para Nereth (ignorar Proteção) e para extensão futura.

---

## 2. Primeiro jogador e compra

- O primeiro jogador é determinado pelo RNG com seed.
- `drawOnFirstTurn = false`: o primeiro jogador **não compra** no primeiro turno.
- O segundo jogador compra normalmente no próprio primeiro turno.
- Configurável em `GameRulesConfig.drawOnFirstTurn`.

---

## 3. Stack / resolução

- Não há pilha estilo Magic.
- Cadeia determinística: comando → validação → gatilhos/armadilhas (opcionais, uma a uma, da esquerda para a direita) → efeito principal → derivados → dano → status → destruições → vitória.

---

## 4. Equipamentos e zona de Suporte

- Equipamentos **ocupam um espaço de Suporte** e ficam vinculados à Unidade.
- Ao destruir a Unidade, o Equipamento vai ao Descarte e o espaço é liberado.

---

## 5. Campos

- Cada Duelista pode ter 1 Campo próprio simultaneamente.
- Efeitos de Campo são **globais** enquanto a carta estiver ativa (afetam cartas que casem com o texto, de qualquer lado).
- Substituir um Campo envia o anterior ao Descarte.

---

## 6. Interpretações mínimas de cartas

| Carta | Interpretação provisória |
| --- | --- |
| BF-001 Instinto de Matilha | +100 PV máximo se controlar **outra** Besta de Fogo. Aumentar máximo não cura automaticamente; reduzir máximo limita o PV atual. |
| BF-006 Rugido Primordial | 600 no alvo escolhido **e** 100 em todas as Unidades inimigas. |
| BF-006 Mãe das Bestas (sobrevivência) | Uma vez por turno de jogo (qualquer jogador), a primeira Besta aliada que seria destruída por dano permanece com 100 PV. |
| BF-008 corpo a corpo | Todos os ataques atuais são tratados como corpo a corpo (não há palavra-chave de alcance ainda). |
| MU-003 Caçador de Feridos | A marcação é **automática** (o texto diz “pode”). Vale para Magia e Armadilha Mágica, não para Armadilha comum. Expira no fim do turno do Carrasco. |
| MU-004 Roubo de Forma | Copia **todos** os efeitos passivos da Unidade atacada até o fim do turno. |
| MU-004 Sem Identidade | Não pode ser alvo de efeitos/equipamentos com filtro de Tipo. Ataques sem filtro de tipo ainda funcionam. |
| MU-006 Eclipse Artificial | 700 no alvo **e** 100 em todas as **outras** Unidades (incluindo aliadas). |
| MU-006 recuperação de Armadilha | Se não houver espaço de Suporte, o efeito falha. Se houver exatamente uma Armadilha Mágica no Descarte, ela é escolhida automaticamente. |
| MU-010 cura por condição | Cura o Mago Umbral aliado com menor PV atual (desempate por slot). |

---

## 7. Stack de implementação vs documento de arquitetura

O milestone do Sandbox 0.1 pede:

- Next.js + App Router + Tailwind
- `packages/game-data`

O documento `10_ARQUITETURA_WEB.md` menciona Vite + Fastify + `card-data`.

**Prevalece o milestone atual** para o protótipo jogável. O servidor multiplayer e o app Vite não foram iniciados de propósito.

---

## 8. Numeração de turnos

Cada vez que um Duelista inicia sua Fase Livre, `turnNumber` incrementa (turno do jogador, não “rodada” de dois lados).
