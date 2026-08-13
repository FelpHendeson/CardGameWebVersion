# Efeitos, Status e Palavras-chave

**Versão:** 0.1  
**Status:** Catálogo inicial; valores numéricos ainda podem mudar durante testes.

---

## 1. Investida

**Tipo:** Palavra-chave de Unidade.

Permite que a Unidade ataque no mesmo turno em que foi Invocada.

Não concede ataque adicional.

---

## 2. Perfuração

**Tipo:** Palavra-chave de ataque/Unidade.

Quando um ataque com Perfuração destrói uma Unidade, o dano excedente é causado ao Duelista defensor.

O excedente usa os PV imediatamente anteriores à aplicação daquele dano.

---

## 3. Furtivo

**Status:** Conceitual, ainda sem carta registrada.

Permite ignorar total ou parcialmente a proteção normal oferecida pelas Unidades adversárias.

A condição exata deve ser escrita em cada carta ou definida quando a palavra-chave entrar oficialmente no conjunto.

---

## 4. Guardião

**Status:** Conceitual.

Uma Unidade Guardiã pode obrigar o adversário a priorizá-la como alvo de ataques.

Regra final ainda pendente de prototipagem.

---

## 5. Voador

**Status:** Conceitual.

Reservado para futuras regras de alcance/alvo.

Não implementar comportamento automático antes de existir uma regra canônica aprovada.

---

## 6. Queimadura

**Tipo:** Condição negativa.

O Documento do Jogo define Queimadura como dano periódico, porém o valor e o momento exatos ainda não foram fechados.

Implementação deve permitir que cada efeito informe:

- dano por tick;
- duração;
- momento do tick;
- regra de acumulação.

### Decisão técnica provisória

Não criar `QUEIMADURA = 100 por turno` de forma global. A intensidade deve vir do efeito que a aplicou até que uma regra global seja aprovada.

---

## 7. Veneno

**Tipo:** Condição negativa.

Dano recorrente ou progressivo.

Assim como Queimadura, deve ser parametrizável.

---

## 8. Veneno Sombrio

Presente em **MU-005 — Velka, Bruxa das Sete Sombras**.

Ainda não possui definição numérica canônica distinta de Veneno.

Até definição posterior, deve ser modelado como uma variante/tag de Veneno, permitindo que cartas futuras interajam especificamente com `SHADOW_POISON`.

---

## 9. Atordoamento

**Tipo:** Condição negativa.

Impede temporariamente determinadas ações da Unidade.

Uso atualmente registrado:

- Serpe da Cratera Rubra aplica Atordoamento;
- Prisão Sem Luz aplica Atordoamento.

### Decisão funcional provisória

Enquanto Atordoada, a Unidade não pode atacar nem usar habilidades ativas que exijam Ação. Efeitos passivos continuam funcionando, salvo texto em contrário.

A duração é determinada pelo efeito que aplicou.

---

## 10. Proteção

**Tipo:** Efeito/condição defensiva.

Reduz ou evita dano.

Deve ser representada como efeito de prevenção/redução, não como aumento de PV.

Exemplo técnico:

```text
Proteção 200 → reduz o próximo dano recebido em até 200
```

Porém a forma exata será declarada pela carta.

---

## 11. Ferocidade

Usada conceitualmente em Bestas de Fogo.

Não precisa ser uma palavra-chave global obrigatória. Pode permanecer como nome de habilidade quando o comportamento variar entre cartas.

Padrão temático:

> a Besta se torna mais perigosa quando está ferida.

---

## 12. Estado de Invocação

**Tipo:** Regra de estado.

Uma Unidade Invocada naquele turno não pode atacar, salvo Investida ou efeito equivalente.

É removido logicamente quando o controlador inicia um novo turno.

---

## 13. Já Atacou

**Tipo:** Marcador temporário.

Após uma Unidade concluir uma declaração de ataque válida, ela recebe `hasAttackedThisTurn = true`.

O marcador é limpo no início do próximo turno do controlador.

---

## 14. Princípio de design

Uma palavra-chave deve existir apenas quando:

1. o comportamento aparece em várias cartas; e
2. nomeá-lo reduz texto sem esconder informação importante.

Caso contrário, preferir efeito escrito diretamente na carta.
