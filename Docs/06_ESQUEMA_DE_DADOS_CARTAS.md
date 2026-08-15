# Esquema de Dados das Cartas

**Versão:** 0.1  
**Objetivo:** permitir que cartas sejam adicionadas e balanceadas sem reescrever o motor para cada caso simples.

---

## 1. Princípio

A carta deve ser majoritariamente definida por dados.

Efeitos simples devem ser declarativos. Efeitos extremamente únicos podem usar handlers especializados, mas isso deve ser exceção.

---

## 2. Categorias

```ts
type CardCategory =
  | 'UNIT'
  | 'SPELL'
  | 'EQUIPMENT'
  | 'MAGIC_EQUIPMENT'
  | 'TRAP'
  | 'MAGIC_TRAP'
  | 'FIELD';
```

---

## 3. Raridades

```ts
type Rarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY';
```

---

## 4. Estrutura base

```ts
interface BaseCardDefinition {
  id: string;
  name: string;
  category: CardCategory;
  rarity: Rarity;
  types: string[];
  collection: string;
  rulesText?: string;
  lore?: string;
  visualDescription?: string;
  artwork?: {
    assetId?: string;
    alt: string;
    /** Assets alternativos por ID (ex.: BF-001-alt). Paths de hosting ficam na UI. */
    alternateAssetIds?: string[];
  };
  tags?: string[];
}
```

---

## 5. Unidade

```ts
interface UnitCardDefinition extends BaseCardDefinition {
  category: 'UNIT';
  level: number;
  maxHp: number;
  summon: SummonDefinition;
  attacks: AttackDefinition[];
  passiveEffects?: EffectDefinition[];
  keywords?: KeywordDefinition[];
}
```

### Invocação

```ts
interface SummonDefinition {
  actionCost: number;
  requirements?: RequirementDefinition[];
}
```

### Ataque

```ts
interface AttackDefinition {
  id: string;
  name: string;
  damage: number;
  actionCost: number;
  requirements?: RequirementDefinition[];
  effects?: EffectDefinition[];
  keywords?: string[];
}
```

---

## 6. Efeitos declarativos

Modelo inicial:

```ts
interface EffectDefinition {
  timing: EffectTiming;
  condition?: ConditionDefinition;
  target?: TargetDefinition;
  operations: EffectOperation[];
  oncePerTurn?: boolean;
  optional?: boolean;
}
```

Operações iniciais:

- `DEAL_DAMAGE`
- `HEAL`
- `DRAW`
- `DISCARD`
- `APPLY_STATUS`
- `REMOVE_STATUS`
- `MODIFY_ATTACK_DAMAGE`
- `MODIFY_MAX_HP`
- `REDUCE_DAMAGE`
- `MOVE_CARD`
- `SET_KEYWORD`
- `REMOVE_KEYWORD`
- `RECOVER_CARD`

---

## 7. Gatilhos

`EffectTiming` inicial:

- `ON_SUMMON`
- `ON_ATTACK_DECLARED`
- `BEFORE_DAMAGE`
- `AFTER_DAMAGE`
- `ON_UNIT_DAMAGED`
- `ON_UNIT_DESTROYED`
- `ON_DESTROY_UNIT`
- `ON_SPELL_PLAYED`
- `ON_TRAP_ACTIVATED`
- `ON_STATUS_APPLIED`
- `TURN_START`
- `TURN_END`
- `CONTINUOUS`

---

## 8. Alvos

Exemplos:

```ts
type TargetScope =
  | 'SELF'
  | 'ALLY_UNIT'
  | 'ENEMY_UNIT'
  | 'ANY_UNIT'
  | 'ALLY_DUELIST'
  | 'ENEMY_DUELIST'
  | 'ALL_ALLY_UNITS'
  | 'ALL_ENEMY_UNITS'
  | 'ALL_UNITS';
```

Filtros podem incluir:

- tipo;
- Nível;
- status;
- quantidade de PV;
- categoria;
- palavra-chave;
- controlador.

---

## 9. Requisitos

Exemplos:

- controlar Besta de Fogo;
- alvo estar com metade ou menos dos PV;
- possuir Magia no Descarte;
- ter sofrido determinada quantidade de dano;
- Campo específico estar ativo.

A expressão deve ser serializável e testável.

---

## 10. Exemplo — Rasga-Cinzas

```json
{
  "id": "BF-002",
  "name": "Rasga-Cinzas",
  "category": "UNIT",
  "rarity": "COMMON",
  "types": ["BEAST", "FIRE"],
  "collection": "WAR_OF_ASH_AND_VEIL",
  "level": 2,
  "maxHp": 900,
  "summon": { "actionCost": 1 },
  "attacks": [
    {
      "id": "carbonized-claws",
      "name": "Garras Carbonizadas",
      "damage": 300,
      "actionCost": 1
    },
    {
      "id": "thermal-frenzy",
      "name": "Frenesi Térmico",
      "damage": 500,
      "actionCost": 1,
      "requirements": [
        { "kind": "SELF_DAMAGE_TAKEN_AT_LEAST", "value": 300 }
      ]
    }
  ],
  "passiveEffects": [
    {
      "timing": "CONTINUOUS",
      "condition": { "kind": "SELF_HP_AT_OR_BELOW_PERCENT", "value": 50 },
      "operations": [
        { "kind": "MODIFY_ATTACK_DAMAGE", "value": 100 }
      ]
    }
  ]
}
```

---

## 11. Exemplo — Pyraxa

A definição de Pyraxa deve combinar dados declarativos com um efeito de substituição de destruição.

Caso o sistema declarativo ainda não suporte esse padrão de forma clara, utilizar um handler explícito identificado por chave estável, por exemplo:

```json
{
  "handler": "PYRAXA_MOTHER_OF_BEASTS_SURVIVAL"
}
```

Handlers especializados precisam de testes unitários próprios.

---

## 12. Versionamento

Cada carta deve possuir versão de balanceamento.

```ts
balanceVersion: number
```

Partidas registradas devem guardar a versão das definições usadas, permitindo reproduzir testes antigos mesmo após balanceamentos futuros.
