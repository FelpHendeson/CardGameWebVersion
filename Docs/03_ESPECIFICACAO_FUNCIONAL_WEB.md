# Especificação Funcional — Versão Web

**Projeto:** Jogo de Cartas  
**Versão:** 0.1  
**Status:** Base funcional do MVP Web

---

## 1. Objetivo

A versão Web deve transformar as regras já definidas em uma experiência jogável e observável, servindo simultaneamente como:

- protótipo funcional;
- laboratório de balanceamento;
- base para futura versão mobile;
- referência para implementação multiplayer.

A prioridade do MVP é validar o duelo. Elementos sociais, monetização e coleção avançada ficam fora do escopo inicial.

---

## 2. Escopo do MVP

O MVP deverá conter:

1. tela inicial;
2. perfil local de Duelista;
3. catálogo de cartas;
4. detalhes da carta;
5. seleção de Deck;
6. Deck Builder básico;
7. escolha do modo de Duelo;
8. Mesa de Duelo;
9. log completo da partida;
10. resultado da partida;
11. histórico local de testes;
12. modo Sandbox local;
13. Bot simples para testes;
14. estrutura preparada para multiplayer posterior.

### Fora do escopo inicial

- compra de pacotes;
- marketplace;
- crafting;
- microtransações;
- guildas;
- amigos;
- chat global;
- torneios;
- temporadas completas;
- campanha narrativa completa;
- economia entre jogadores.

---

## 3. Modos de Duelo

### Duelo Oficial

- 8.000 PV por Duelista.
- Formato principal e futuro formato ranqueado.

### Duelo Rápido

- 4.000 PV por Duelista.
- Formato casual e de menor duração.

No MVP, os dois formatos podem compartilhar as demais regras.

---

## 4. Deck

Configuração canônica atual:

- 30 cartas;
- máximo de 3 cópias da mesma carta;
- mão inicial de 5 cartas;
- compra normal de 1 carta por turno;
- sem limite de mão no protótipo.

Um Deck inválido não pode iniciar um Duelo.

Mensagens de validação devem ser específicas, por exemplo:

- `Seu Deck possui 27/30 cartas.`
- `Você possui 4 cópias de BF-001. O máximo permitido é 3.`

---

## 5. Tela inicial

Deve apresentar:

- nome/logo provisório do jogo;
- chamada para Duelar;
- acesso ao Catálogo;
- acesso aos Decks;
- acesso às configurações;
- apresentação breve da Academia e do universo dimensional.

O MVP pode operar inicialmente sem autenticação remota, usando um Duelista local.

---

## 6. Perfil do Duelista

Campos mínimos:

- nome;
- avatar ou placeholder;
- Rank;
- título equipado, quando existir;
- duelos realizados;
- vitórias;
- derrotas;
- taxa de vitória;
- Deck mais utilizado.

Progressão conceitual atual:

`Recruta → Iniciante → Aprendiz → Adepto → Veterano → Especialista → Mestre → Grão-Mestre → Lenda`

A fórmula de progressão será configurável.

---

## 7. Catálogo de Cartas

Cada carta deve ser pesquisável e filtrável por:

- nome;
- código;
- categoria;
- raridade;
- Nível;
- tipo;
- temática/arquétipo.

Cada item do Catálogo deve mostrar:

- arte ou placeholder;
- nome;
- código;
- tipo;
- raridade;
- Nível quando aplicável.

Ao abrir uma carta, exibir:

- estatísticas;
- ataques;
- efeitos;
- palavras-chave;
- regras relevantes;
- lore;
- descrição visual.

---

## 8. Deck Builder

O Duelista deve poder:

- criar Deck;
- renomear;
- editar;
- duplicar;
- excluir;
- selecionar como Deck ativo;
- adicionar/remover cartas;
- visualizar contagem total;
- visualizar avisos de validade.

Para o primeiro ciclo, os Decks **Bestas de Fogo** e **Magos Umbrais** podem ser fornecidos pré-montados.

---

## 9. Mesa de Duelo

Cada lado possui:

- PV do Duelista;
- quantidade de cartas na mão;
- Deck;
- Descarte;
- 3 zonas de Unidade;
- 3 zonas de Suporte;
- 1 zona de Campo;
- efeitos ativos;
- estados de Unidade.

O jogador local também visualiza sua mão e o Banco de Ações.

### Layout conceitual

```text
┌─────────────────────────────────────────┐
│ ADVERSÁRIO                    PV: 8000  │
│ Mão: 4   Deck: 21   Descarte: 2        │
│                                         │
│       [ U ]   [ U ]   [ U ]            │
│       [ S ]   [ S ]   [ S ]            │
│                [ CAMPO ]                │
├─────────────────────────────────────────┤
│                [ CAMPO ]                │
│       [ S ]   [ S ]   [ S ]            │
│       [ U ]   [ U ]   [ U ]            │
│                                         │
│ Ações: ● ● ●                            │
│ Mão: [C] [C] [C] [C] [C]               │
│ VOCÊ                          PV: 8000  │
└─────────────────────────────────────────┘
```

---

## 10. Banco de Ações

O Duelista recebe 3 Ações por turno.

Ações não utilizadas não acumulam.

Exibição sugerida:

- `● ● ●` — 3 disponíveis;
- `● ● ○` — 2 disponíveis;
- `● ○ ○` — 1 disponível;
- `○ ○ ○` — nenhuma disponível.

A compra normal do turno não consome Ação.

---

## 11. Fluxo do turno

1. processar início do turno;
2. comprar 1 carta;
3. restaurar Banco para 3 Ações;
4. entrar na Fase Livre;
5. executar ações em qualquer ordem válida;
6. encerrar turno;
7. processar efeitos de encerramento;
8. passar prioridade de turno ao adversário.

---

## 12. Invocação

Ao selecionar uma Unidade na mão:

1. mostrar detalhes;
2. mostrar custo de Invocação;
3. destacar zonas válidas;
4. validar requisitos;
5. confirmar ação;
6. consumir Ações;
7. mover a Unidade para o campo;
8. aplicar Estado de Invocação;
9. disparar efeitos de entrada.

Custo base provisório:

- Nível 1–2: 1 Ação;
- Nível 3–4: 2 Ações;
- Nível 5+: 3 Ações e/ou requisitos.

---

## 13. Ataque

Fluxo:

1. selecionar Unidade apta;
2. selecionar ataque;
3. selecionar alvo válido;
4. validar custo e estado;
5. consumir 1 Ação;
6. registrar declaração de ataque;
7. verificar Armadilhas aplicáveis;
8. resolver efeitos anteriores ao dano;
9. causar dano;
10. aplicar efeitos do ataque;
11. processar destruições;
12. marcar Unidade como `já atacou`.

Por padrão, uma Unidade ataca apenas uma vez por turno.

Unidades recém-Invocadas não atacam, salvo **Investida** ou efeito equivalente.

---

## 14. Proteção do Duelista

Enquanto o adversário possuir uma Unidade apta a protegê-lo, o ataque direto deve ser bloqueado pela interface e pelo motor.

Exceções podem existir por efeitos ou palavras-chave como Furtivo.

---

## 15. Dano e destruição

Unidades possuem `PV máximo` e `PV atual`.

Dano persiste entre turnos.

Quando `PV atual <= 0`:

1. a Unidade é marcada para destruição;
2. efeitos relacionados são processados;
3. a Unidade sai do campo;
4. vai para o Descarte;
5. a zona é liberada.

Dano excedente normalmente é perdido.

Com **Perfuração**, o excedente pode atingir o Duelista adversário.

---

## 16. Magias

Fluxo padrão:

1. selecionar a carta;
2. validar alvos/requisitos;
3. consumir Ação;
4. registrar ativação;
5. resolver efeito;
6. mover para o Descarte, salvo se a carta permanecer em campo.

---

## 17. Equipamentos

Fluxo:

1. selecionar Equipamento;
2. escolher Unidade compatível;
3. consumir Ação;
4. vincular à Unidade;
5. aplicar modificadores e efeitos.

Equipamento e Equipamento Mágico são classificações distintas para efeitos de regra.

---

## 18. Armadilhas

Preparar uma Armadilha:

1. selecionar carta;
2. escolher zona de Suporte;
3. consumir 1 Ação;
4. mover carta para estado `PREPARADA`;
5. ocultá-la do adversário quando aplicável.

Quando o gatilho ocorrer:

1. o motor detecta a elegibilidade;
2. a Armadilha é declarada/ativada;
3. resolve seu efeito;
4. não consome nova Ação.

O protótipo não usa um recurso separado de Reação.

---

## 19. Campos

Cada Duelista possui uma zona de Campo.

Uma nova carta de Campo substitui a anterior daquele Duelista, salvo efeito em contrário.

No protótipo, os dois Duelistas podem possuir um Campo próprio ativo simultaneamente.

---

## 20. Condições e estados

O motor deve suportar inicialmente:

- Queimadura;
- Veneno;
- Atordoamento;
- Proteção;
- Estado de Invocação;
- já atacou.

Cada condição deve registrar:

- fonte;
- alvo;
- intensidade;
- duração;
- momento de processamento.

---

## 21. Log da partida

Toda mudança relevante deve produzir evento legível.

Exemplos:

- `BF-002 Rasga-Cinzas foi Invocado.`
- `Rasga-Cinzas usou Garras Carbonizadas em MU-001 Aprendiz do Véu.`
- `Aprendiz do Véu sofreu 300 de dano.`
- `Aprendiz do Véu foi destruído.`

O log deve ser suficiente para reproduzir conceitualmente o que ocorreu.

---

## 22. Informação oculta

Devem permanecer ocultas ao adversário:

- identidade das cartas na mão;
- identidade de Armadilhas preparadas, quando aplicável;
- ordem do Deck.

Podem ser públicas:

- quantidade de cartas na mão;
- quantidade restante no Deck;
- conteúdo do Descarte;
- cartas e efeitos revelados.

---

## 23. Fim do Duelo

Condições atuais:

- PV de um Duelista chega a 0;
- Duelista precisa comprar e o Deck está vazio;
- desistência;
- abandono/desconexão em multiplayer futuro.

A tela final deve exibir:

- Vitória/Derrota;
- número de turnos;
- dano causado;
- Unidades destruídas;
- cartas utilizadas;
- Deck utilizado;
- botão para novo Duelo;
- botão para retornar.

---

## 24. Sandbox de desenvolvimento

Antes do multiplayer, o sistema deve permitir:

- controlar os dois Duelistas localmente;
- escolher mãos iniciais manualmente, opcionalmente;
- reiniciar a partida rapidamente;
- acelerar animações;
- visualizar o estado interno em modo debug;
- exportar log de eventos;
- importar seed para reproduzir um cenário.

Esse modo é obrigatório para acelerar o balanceamento.

---

## 25. Bot simples

O primeiro Bot não precisa jogar bem. Ele precisa permitir testes repetíveis.

Prioridade inicial:

1. realizar jogadas válidas;
2. Invocar quando possível;
3. atacar alvos válidos;
4. usar cartas de suporte por heurísticas simples;
5. encerrar turno sem travar.

---

## 26. Critérios de aceite do MVP

- [ ] carregar Catálogo de cartas por dados estruturados;
- [ ] selecionar Deck;
- [ ] validar Deck de 30 cartas;
- [ ] iniciar Duelo Oficial e Rápido;
- [ ] embaralhar Deck;
- [ ] comprar mão inicial;
- [ ] comprar carta por turno;
- [ ] restaurar 3 Ações;
- [ ] Invocar Unidades;
- [ ] validar custos e zonas;
- [ ] respeitar Estado de Invocação;
- [ ] realizar ataques;
- [ ] persistir dano em Unidades;
- [ ] destruir Unidades;
- [ ] processar Perfuração;
- [ ] usar Magias;
- [ ] usar Equipamentos;
- [ ] preparar e ativar Armadilhas;
- [ ] aplicar Campo;
- [ ] aplicar condições;
- [ ] detectar vitória/derrota;
- [ ] registrar log de eventos;
- [ ] concluir uma partida Bestas de Fogo vs Magos Umbrais;
- [ ] reiniciar uma nova partida sem recarregar manualmente todo o sistema.
