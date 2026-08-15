# Especificação Funcional/Técnica — Integração Visual das Cartas

**Projeto:** CardGameWebVersion  
**Milestone:** Sandbox 0.2 — Integração Visual  
**Versão:** 0.1  
**Status:** Pronta para implementação  
**Plataforma:** Web / Next.js  
**Escopo:** Integrar as artes oficiais das 20 cartas existentes ao Sandbox jogável, preservando o motor atual.

---

# 1. Objetivo

Transformar o Sandbox Web atual, que já possui regras, motor, turnos, ações, cartas e combate funcionais, em uma experiência visual mais próxima de um card game real.

A tarefa deve integrar as imagens existentes na pasta:

```text
/imgCards
```

sem alterar desnecessariamente:

- regras do jogo;
- motor de duelo;
- efeitos das cartas;
- dados canônicos;
- estrutura de turnos;
- lógica de combate;
- lógica de validação de ações.

O foco desta entrega é exclusivamente:

1. organizar os assets;
2. mapear cada arte à sua carta;
3. criar um componente visual reutilizável de carta;
4. utilizar as artes na mão, campo, suportes, Campo e visualização detalhada;
5. manter a arquitetura atual reutilizável para React Native no futuro.

---

# 2. Contexto Atual

O projeto utiliza monorepo e mantém responsabilidades separadas:

```text
apps/web
packages/shared
packages/game-data
packages/game-engine
Docs
```

A interface Web consome o estado e as ações fornecidas pelo motor.

A UI não deve passar a conter regras de negócio específicas de cartas.

O motor deve continuar independente de:

- React;
- Next.js;
- DOM;
- assets visuais.

---

# 3. Fonte das Artes

As artes originais encontram-se atualmente em:

```text
/imgCards
```

Foram fornecidas artes para as 20 cartas existentes do protótipo.

Existe ainda uma arte alternativa adicional para:

```text
BF-001 — Filhote de Brasas
```

Arquivos atualmente identificados:

```text
Aprendiz do Véu.png
Arconte Sem-Rosto.png
Bastão do Véu Partido.png
Caldeira de Cinerath.png
Cão Magmático de Arkh.png
Carrasco do Eclipse.png
Erupção Repentina.png
Filhote de Brasas Arte Alternativa.png
Filhote de Brasas.png
Nereth, Arquimago do Véu Negro.png
Presas de Obsidiana.png
Prisão Sem Luz.png
Pyraxa, Mãe da Chama Primeva.png
Rasga-Cinzas.png
Sangue em Brasa.png
Serpe da Cratera Rubra.png
Tecelã de Sombras.png
Toque da Ausência.png
Torre do Eclipse.png
Velka, Bruxa das Sete Sombras.png
Vharak, Predador da Caldeira.png
```

---

# 4. Convenção de Assets

Os nomes originais não devem ser utilizados diretamente pela aplicação.

Arquivos com espaços, acentos, vírgulas e nomes longos podem gerar inconsistências de manutenção e integração futura.

## 4.1 Estrutura recomendada

Criar:

```text
apps/web/public/cards/
```

E disponibilizar as artes por ID canônico:

```text
apps/web/public/cards/BF-001.png
apps/web/public/cards/BF-001-alt.png
apps/web/public/cards/BF-002.png
...
apps/web/public/cards/BF-010.png
apps/web/public/cards/MU-001.png
...
apps/web/public/cards/MU-010.png
```

## 4.2 Pasta original

A pasta `/imgCards` pode ser mantida temporariamente como fonte original. A aplicação, porém, deve utilizar os arquivos normalizados dentro de `apps/web/public/cards/`.

---

# 5. Mapeamento Oficial

## 5.1 Bestas de Fogo

| ID | Carta | Arquivo fonte |
|---|---|---|
| BF-001 | Filhote de Brasas | `Filhote de Brasas.png` |
| BF-001-alt | Filhote de Brasas — Arte Alternativa | `Filhote de Brasas Arte Alternativa.png` |
| BF-002 | Rasga-Cinzas | `Rasga-Cinzas.png` |
| BF-003 | Cão Magmático de Arkh | `Cão Magmático de Arkh.png` |
| BF-004 | Serpe da Cratera Rubra | `Serpe da Cratera Rubra.png` |
| BF-005 | Vharak, Predador da Caldeira | `Vharak, Predador da Caldeira.png` |
| BF-006 | Pyraxa, Mãe da Chama Primeva | `Pyraxa, Mãe da Chama Primeva.png` |
| BF-007 | Sangue em Brasa | `Sangue em Brasa.png` |
| BF-008 | Presas de Obsidiana | `Presas de Obsidiana.png` |
| BF-009 | Erupção Repentina | `Erupção Repentina.png` |
| BF-010 | Caldeira de Cinerath | `Caldeira de Cinerath.png` |

## 5.2 Magos Umbrais

| ID | Carta | Arquivo fonte |
|---|---|---|
| MU-001 | Aprendiz do Véu | `Aprendiz do Véu.png` |
| MU-002 | Tecelã de Sombras | `Tecelã de Sombras.png` |
| MU-003 | Carrasco do Eclipse | `Carrasco do Eclipse.png` |
| MU-004 | Arconte Sem-Rosto | `Arconte Sem-Rosto.png` |
| MU-005 | Velka, Bruxa das Sete Sombras | `Velka, Bruxa das Sete Sombras.png` |
| MU-006 | Nereth, Arquimago do Véu Negro | `Nereth, Arquimago do Véu Negro.png` |
| MU-007 | Toque da Ausência | `Toque da Ausência.png` |
| MU-008 | Bastão do Véu Partido | `Bastão do Véu Partido.png` |
| MU-009 | Prisão Sem Luz | `Prisão Sem Luz.png` |
| MU-010 | Torre do Eclipse | `Torre do Eclipse.png` |

---

# 6. Metadados Visuais

A associação entre carta e arte deve ser explícita.

## 6.1 Solução recomendada

Adicionar metadados visuais às definições de carta ou a um módulo de metadados associado ao `game-data`.

Exemplo conceitual:

```ts
interface CardVisualMetadata {
  artwork: string;
  alternateArtwork?: string[];
}
```

Exemplo:

```ts
{
  id: "BF-001",
  name: "Filhote de Brasas",
  visual: {
    artwork: "/cards/BF-001.png",
    alternateArtwork: ["/cards/BF-001-alt.png"]
  }
}
```

## 6.2 Restrição arquitetural

Os assets visuais **não** devem ser utilizados pelo `game-engine`.

O `game-engine` deve continuar ignorando imagens, paths, thumbnails e estilos.

---

# 7. Arte Alternativa — Filhote de Brasas

Utilizar `BF-001.png` como arte principal e preservar `BF-001-alt.png` como arte alternativa.

Não criar ainda:

- seletor de skin;
- sistema de cosméticos;
- raridade alternativa;
- coleção de variantes;
- monetização.

Apenas manter a capacidade de o modelo reconhecer múltiplas artes para uma carta.

---

# 8. Componente Reutilizável de Carta

Criar um componente reutilizável, por exemplo:

```text
CardView
```

ou:

```text
GameCard
```

O componente deve receber dados e estado visual, sem descobrir regras sozinho.

Deve poder apresentar:

- arte;
- nome;
- ID;
- categoria;
- raridade;
- Nível;
- tipos;
- PV, quando aplicável;
- PV atual para Unidade em campo;
- estados;
- seleção;
- disponibilidade;
- indicação de alvo.

---

# 9. Variantes de Exibição

O componente deve suportar ao menos quatro contextos:

## 9.1 Hand

Prioridades:

- arte;
- nome;
- Nível;
- categoria;
- legibilidade;
- indicação de seleção.

## 9.2 Board

Prioridades:

- arte;
- nome;
- PV atual/máximo;
- status;
- indicação de aptidão para atacar;
- indicação de já atacou;
- Estado de Invocação.

## 9.3 Support

Prioridades:

- arte;
- identificação da carta quando revelada;
- verso/ocultação quando Armadilha estiver preparada;
- indicação de Equipamento associado.

## 9.4 Detail

Prioridades:

- arte grande;
- nome;
- ID;
- categoria;
- raridade;
- Nível;
- tipos;
- PV;
- ataques;
- efeitos;
- palavras-chave.

---

# 10. Mão do Jogador

A mão atual não deve continuar sendo apenas uma lista textual.

Cada carta deve:

- mostrar sua arte;
- continuar clicável;
- continuar selecionável;
- preservar `data-testid` necessários aos testes;
- mostrar pelo menos nome e Nível/categoria;
- indicar visualmente quando selecionada.

Em desktop, preferir fileira de cartas. Se houver muitas cartas, permitir overflow horizontal em vez de reduzir até ficarem ilegíveis.

---

# 11. Campo de Unidades

Cada um dos três slots deve utilizar representação visual da carta.

Uma Unidade deve exibir:

- arte;
- nome;
- PV atual / PV máximo;
- status.

A integração deve preservar a leitura dos estados já existentes no Sandbox.

---

# 12. Estados Visuais

Reutilizar os estados atuais, incluindo:

- Estado de Invocação;
- já atacou;
- apta;
- Atordoada;
- Queimada;
- Envenenada;
- Proteção;
- Equipamento.

Não alterar a semântica desses estados nesta tarefa.

---

# 13. Alvos e Seleção

A integração visual não pode prejudicar a UX atual.

Continuar indicando claramente:

- carta selecionada;
- alvo válido;
- alvo inválido.

Não depender exclusivamente de cor quando houver espaço para ícone ou texto complementar.

---

# 14. Suportes

Os três slots de Suporte devem aceitar representação visual.

## Armadilha preparada e oculta

Não mostrar arte ou nome ao adversário. Usar representação neutra ou verso de carta.

## Carta revelada

Mostrar arte.

## Equipamento

Mostrar arte e manter o vínculo com a Unidade equipada através do estado atual do jogo.

---

# 15. Campo

A carta de Campo deve receber representação visual própria.

Pode utilizar composição mais horizontal/reduzida para diferenciá-la das Unidades.

Exibir ao menos:

- arte;
- nome;
- estado ativo.

---

# 16. Painel de Detalhes

Ao selecionar uma carta, enriquecer o painel atual com:

1. arte em tamanho maior;
2. nome;
3. ID;
4. raridade;
5. categoria;
6. Nível;
7. PV;
8. ataques;
9. efeitos;
10. palavras-chave.

A lógica de seleção existente deve ser preservada.

---

# 17. Tratamento de Imagem

Utilizar o mecanismo adequado do Next.js, preferencialmente `next/image` quando fizer sentido.

Para imagens em `public`, paths devem ser relativos ao app, por exemplo:

```text
/cards/BF-001.png
```

Requisitos:

- manter proporção;
- evitar distorção;
- utilizar `object-fit` adequado;
- preservar o foco principal da arte;
- definir fallback visual caso uma imagem não exista.

---

# 18. Fallback

A aplicação não pode quebrar se uma arte estiver ausente.

Criar fallback simples, por exemplo:

```text
ARTE INDISPONÍVEL
BF-004
```

Não buscar assets externos.

---

# 19. Design Visual Inicial

O objetivo não é finalizar a identidade completa do jogo.

É permitido melhorar:

- bordas;
- sombras;
- proporção;
- hierarquia;
- tipografia;
- espaçamento;
- feedback visual.

Bestas de Fogo podem utilizar linguagem visual laranja/vermelho/carvão/obsidiana. Magos Umbrais podem utilizar violeta/preto/azul profundo.

A facção não deve substituir a informação de raridade.

---

# 20. Raridade

A UI pode introduzir indicador sutil de raridade para:

```text
Comum
Incomum
Rara
Épica
Lendária
```

Não criar mecânicas novas baseadas na raridade.

---

# 21. Responsividade

## Desktop

Prioridade principal. A mesa deve continuar completamente jogável.

## Tablet

Evitar quebra estrutural grave.

## Mobile Web

Não precisa ser experiência final, mas deve permitir scroll e não esconder controles essenciais.

---

# 22. Não Escopo

Esta tarefa não inclui:

- bot;
- IA adversária;
- multiplayer;
- WebSocket;
- autenticação;
- banco de dados;
- matchmaking;
- ranking;
- loja;
- booster;
- coleção;
- deck builder;
- animações cinematográficas;
- sons;
- música;
- efeitos 3D;
- criação de novas cartas;
- alteração das regras existentes.

---

# 23. Testes Existentes

Preservar a cobertura atual.

Se a UI mudar, atualizar apenas seletores realmente necessários.

Evitar remover `data-testid` consumidos pelo Playwright.

O fluxo E2E atual deve continuar comprovando:

1. iniciar Duelo;
2. mão visível;
3. 3 Ações;
4. Invocar;
5. gastar Ação;
6. encerrar turno;
7. trocar Duelista;
8. atacar;
9. causar dano.

---

# 24. Novos Testes Recomendados

Adicionar testes de UI para:

- BF-001 renderizar `/cards/BF-001.png`;
- MU-001 renderizar `/cards/MU-001.png`;
- BF-001 possuir metadado de arte alternativa;
- ausência de artwork não quebrar o componente;
- Armadilha preparada do adversário não revelar artwork.

---

# 25. Build e Vercel

A integração deve continuar compatível com Vercel.

Assets estáticos devem estar disponíveis no build final.

Após implementação executar:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Se possível:

```bash
pnpm test:e2e
```

Nenhuma referência deve depender de path absoluto da máquina local.

Errado:

```text
C:\Users\...\imgCards\...
```

Correto:

```text
/cards/BF-001.png
```

---

# 26. Ordem de Implementação

1. Inspecionar `/imgCards`, `packages/game-data` e `apps/web/components`.
2. Normalizar/copiar assets para `apps/web/public/cards`.
3. Criar metadados de artwork.
4. Criar componente reutilizável de carta.
5. Integrar na mão.
6. Integrar nos slots de Unidade.
7. Integrar Suporte e Campo.
8. Integrar visualização detalhada.
9. Ajustar responsividade.
10. Executar suíte de qualidade e corrigir regressões.

---

# 27. Critérios de Aceite

A tarefa será considerada concluída quando:

- [ ] As 20 cartas possuírem artwork associado por ID.
- [ ] BF-001 possuir arte principal.
- [ ] BF-001 possuir arte alternativa preservada.
- [ ] Nenhum path da aplicação depender dos nomes originais dos arquivos.
- [ ] As artes estiverem servidas pelo Next.js.
- [ ] A mão mostrar cartas visuais.
- [ ] Unidades em campo mostrarem arte.
- [ ] PV atual/máximo continuar visível.
- [ ] Status continuarem visíveis.
- [ ] Suportes revelados mostrarem artwork.
- [ ] Armadilhas ocultas não revelarem artwork ao adversário.
- [ ] Campo ativo possuir representação visual.
- [ ] Detalhe da carta possuir artwork maior.
- [ ] Seleção continuar funcionando.
- [ ] Alvos válidos continuarem destacados.
- [ ] Alvos inválidos continuarem identificados.
- [ ] O motor não depender de imagens.
- [ ] Nenhuma regra canônica tiver sido alterada.
- [ ] `pnpm lint` passar.
- [ ] `pnpm typecheck` passar.
- [ ] `pnpm test` passar.
- [ ] `pnpm build` passar.
- [ ] E2E continuar passando ou regressões serem justificadas/corrigidas.

---

# 28. Definição de Pronto

O milestone **Sandbox 0.2 — Visual Card Integration** estará pronto quando um usuário conseguir abrir a aplicação Web e reconhecer visualmente Bestas de Fogo, Magos Umbrais, cartas na mão, Unidades em campo, Suportes e Campos através das artes oficiais fornecidas, sem perda das funcionalidades existentes do Sandbox 0.1.

---

# 29. Entrega Esperada do Agente

Ao finalizar, responder com:

```text
STATUS DA INTEGRAÇÃO VISUAL

Assets normalizados:
- ...

Mapeamento:
- ...

Componentes criados:
- ...

Componentes alterados:
- ...

Cartas cobertas:
20/20

BF-001:
Arte principal: ...
Arte alternativa: ...

Testes:
Lint:
Typecheck:
Unit:
Build:
E2E:

Problemas encontrados:
- ...

Pendências:
- ...

Próximo passo recomendado:
- ...
```

---

# 30. Próximo Milestone Recomendado

Após esta especificação ser concluída:

## Sandbox 0.3 — UX de Duelo e Playtest

Objetivos futuros:

- melhorar composição da mesa;
- animações mínimas de ataque/dano;
- melhorar leitura de ações;
- modal/zoom da carta;
- feedback de Invocação;
- feedback de Armadilha;
- indicadores de turno;
- preparação para primeiro playtest humano estruturado.

Nenhuma dessas funcionalidades deve bloquear a conclusão do Sandbox 0.2.
