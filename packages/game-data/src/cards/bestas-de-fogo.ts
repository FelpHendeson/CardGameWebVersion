import type { CardDefinition } from "@duelo/shared";
import { CATALOG_BALANCE_VERSION, COLLECTION_ID } from "../rules.js";

const collection = COLLECTION_ID;
const balanceVersion = CATALOG_BALANCE_VERSION;
const archetype = "FIRE_BEASTS" as const;

export const FIRE_BEAST_CARDS: CardDefinition[] = [
  {
    id: "BF-001",
    name: "Filhote de Brasas",
    category: "UNIT",
    rarity: "COMMON",
    types: ["BEAST", "FIRE"],
    archetype,
    collection,
    balanceVersion,
    level: 1,
    maxHp: 600,
    summon: { actionCost: 1 },
    attacks: [
      {
        id: "incandescent-bite",
        name: "Mordida Incandescente",
        damage: 200,
        actionCost: 1,
        effects: [
          {
            timing: "ON_ATTACK",
            condition: { kind: "TARGET_HAS_STATUS", statusTypes: ["BURN"] },
            operations: [{ kind: "MODIFY_ATTACK_DAMAGE", value: 100 }],
          },
        ],
      },
    ],
    passiveEffects: [
      {
        id: "pack-instinct",
        timing: "CONTINUOUS",
        condition: { kind: "CONTROL_OTHER_ARCHETYPE_UNIT", archetype: "FIRE_BEASTS" },
        operations: [{ kind: "MODIFY_MAX_HP", value: 100 }],
      },
    ],
    rulesText:
      "Mordida Incandescente: 200. Se o alvo possuir Queimadura, causa +100. Instinto de Matilha: se você controlar outra Besta de Fogo, recebe +100 PV máximo.",
    visualDescription:
      "Pequeno quadrúpede semelhante a uma mistura entre raposa, lobo e lagarto. Pelo negro com fissuras brilhantes semelhantes a brasas.",
    lore: "Os filhotes aprendem primeiro a seguir o cheiro do sangue. O fogo vem depois.",
    artwork: { alt: "Filhote de Brasas" },
  },
  {
    id: "BF-002",
    name: "Rasga-Cinzas",
    category: "UNIT",
    rarity: "COMMON",
    types: ["BEAST", "FIRE"],
    archetype,
    collection,
    balanceVersion,
    level: 2,
    maxHp: 900,
    summon: { actionCost: 1 },
    attacks: [
      {
        id: "carbonized-claws",
        name: "Garras Carbonizadas",
        damage: 300,
        actionCost: 1,
      },
      {
        id: "thermal-frenzy",
        name: "Frenesi Térmico",
        damage: 500,
        actionCost: 1,
        requirements: [{ kind: "SELF_DAMAGE_TAKEN_AT_LEAST", value: 300 }],
      },
    ],
    passiveEffects: [
      {
        id: "ferocity",
        timing: "CONTINUOUS",
        condition: { kind: "SELF_HP_AT_OR_BELOW_PERCENT", value: 50 },
        operations: [{ kind: "MODIFY_ATTACK_DAMAGE", value: 100 }],
      },
    ],
    rulesText:
      "Garras Carbonizadas: 300. Frenesi Térmico: 500, só se tiver perdido pelo menos 300 PV. Ferocidade: com metade ou menos dos PV, ataques causam +100.",
    visualDescription:
      "Predador felino de seis patas. Membros anteriores excessivamente longos e garras semelhantes a carvão incandescente.",
    lore: "Não confunda sangue com fraqueza. Para eles, sangue significa que a caça finalmente começou. — Explorador Halven",
    artwork: { alt: "Rasga-Cinzas" },
  },
  {
    id: "BF-003",
    name: "Cão Magmático de Arkh",
    category: "UNIT",
    rarity: "UNCOMMON",
    types: ["BEAST", "FIRE"],
    archetype,
    collection,
    balanceVersion,
    level: 3,
    maxHp: 1500,
    summon: { actionCost: 2 },
    keywords: ["CHARGE"],
    attacks: [
      {
        id: "volcanic-bite",
        name: "Mordida Vulcânica",
        damage: 400,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "APPLY_STATUS", statusType: "BURN" }],
          },
        ],
      },
      {
        id: "magma-charge",
        name: "Investida Magmática",
        damage: 700,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "DEAL_DAMAGE", value: 200, self: true }],
          },
        ],
      },
    ],
    rulesText:
      "Possui Investida. Mordida Vulcânica: 400, aplica Queimadura. Investida Magmática: 700; após utilizar, sofre 200 de dano.",
    visualDescription:
      "Canídeo colossal cujo corpo parece composto de placas vulcânicas sobre musculatura em brasa.",
    lore: "Os primeiros Magos Umbrais que atravessaram o portal de Cinerath confundiram essas criaturas com animais domesticáveis.",
    artwork: { alt: "Cão Magmático de Arkh" },
  },
  {
    id: "BF-004",
    name: "Serpe da Cratera Rubra",
    category: "UNIT",
    rarity: "RARE",
    types: ["BEAST", "SERPENT", "FIRE"],
    archetype,
    collection,
    balanceVersion,
    level: 4,
    maxHp: 2100,
    summon: { actionCost: 2 },
    attacks: [
      {
        id: "burning-constriction",
        name: "Constrição Ardente",
        damage: 500,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "APPLY_STATUS", statusType: "STUN" }],
          },
        ],
      },
      {
        id: "slag-breath",
        name: "Sopro de Escória",
        damage: 700,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "APPLY_STATUS", statusType: "BURN" }],
          },
        ],
      },
    ],
    passiveEffects: [
      {
        id: "volcanic-blood",
        timing: "ON_UNIT_DAMAGED",
        handler: "SERPENT_VOLCANIC_BLOOD",
        operations: [{ kind: "HANDLER", handler: "SERPENT_VOLCANIC_BLOOD" }],
      },
    ],
    rulesText:
      "Constrição Ardente: 500, aplica Atordoamento. Sopro de Escória: 700, aplica Queimadura. Sangue Vulcânico: se sofrer 500+ de dano de um único efeito, causa 200 à Unidade responsável.",
    visualDescription:
      "Serpente gigantesca revestida por placas minerais semelhantes à obsidiana, com magma visível entre suas escamas.",
    artwork: { alt: "Serpe da Cratera Rubra" },
  },
  {
    id: "BF-005",
    name: "Vharak, Predador da Caldeira",
    category: "UNIT",
    rarity: "EPIC",
    types: ["BEAST", "FIRE"],
    archetype,
    collection,
    balanceVersion,
    level: 5,
    maxHp: 2800,
    summon: { actionCost: 3 },
    attacks: [
      {
        id: "rend",
        name: "Dilacerar",
        damage: 600,
        actionCost: 1,
      },
      {
        id: "caldera-jaw",
        name: "Mandíbula da Caldeira",
        damage: 900,
        actionCost: 1,
        effects: [
          {
            timing: "ON_ATTACK",
            condition: { kind: "TARGET_HP_BELOW_PERCENT", value: 50 },
            operations: [{ kind: "HANDLER", handler: "VHARAK_CONDITIONAL_PIERCING" }],
          },
        ],
      },
    ],
    passiveEffects: [
      {
        id: "alpha-predator",
        timing: "ON_DESTROY_UNIT",
        operations: [{ kind: "HEAL", value: 300, self: true }],
      },
    ],
    rulesText:
      "Dilacerar: 600. Mandíbula da Caldeira: 900; se o alvo possuir menos da metade dos PV, recebe Perfuração. Predador Alfa: ao destruir uma Unidade, recupera 300 PV.",
    visualDescription:
      "Predador terrestre que mistura características de tigre, dragão e grande réptil.",
    lore: "Em Cinerath, “predador alfa” não significa estar no topo da cadeia alimentar. Significa apenas que ainda não apareceu algo maior.",
    artwork: { alt: "Vharak, Predador da Caldeira" },
  },
  {
    id: "BF-006",
    name: "Pyraxa, Mãe da Chama Primeva",
    category: "UNIT",
    rarity: "LEGENDARY",
    types: ["BEAST", "ANCESTRAL", "FIRE"],
    archetype,
    collection,
    balanceVersion,
    level: 7,
    maxHp: 4200,
    summon: {
      actionCost: 3,
      requirements: [
        {
          kind: "CONTROL_OR_DISCARD_UNIT",
          archetype: "FIRE_BEASTS",
          minLevel: 3,
        },
      ],
    },
    attacks: [
      {
        id: "primordial-roar",
        name: "Rugido Primordial",
        damage: 600,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "HANDLER", handler: "PYRAXA_ROAR_AOE" }],
          },
        ],
      },
      {
        id: "solar-jaw",
        name: "Mandíbula Solar",
        damage: 1100,
        actionCost: 1,
        keywords: ["PIERCING"],
      },
    ],
    passiveEffects: [
      {
        id: "mother-of-beasts-heal",
        timing: "ON_SUMMON",
        operations: [{ kind: "HANDLER", handler: "PYRAXA_ON_SUMMON_HEAL" }],
      },
      {
        id: "mother-of-beasts-survival",
        timing: "REPLACEMENT_DESTRUCTION",
        oncePerTurn: true,
        handler: "PYRAXA_MOTHER_OF_BEASTS_SURVIVAL",
        operations: [{ kind: "HANDLER", handler: "PYRAXA_MOTHER_OF_BEASTS_SURVIVAL" }],
      },
    ],
    rulesText:
      "Invocação: 3 Ações e controlar ou descartar uma Besta de Fogo de Nível 3+. Rugido Primordial: 600; todas as Unidades inimigas recebem 100. Mandíbula Solar: 1100 com Perfuração. Ao ser Invocada, outras Bestas de Fogo recuperam 300 PV. Uma vez por turno, quando uma Besta aliada seria destruída por dano, permanece com 100 PV.",
    visualDescription:
      "Besta quadrúpede colossal com características de leoa e dragão. Grandes chifres curvos e juba composta literalmente de fogo.",
    lore: "Quando Pyraxa rugiu pela primeira vez após séculos de sono, sete vulcões responderam.",
    artwork: { alt: "Pyraxa, Mãe da Chama Primeva" },
  },
  {
    id: "BF-007",
    name: "Sangue em Brasa",
    category: "SPELL",
    rarity: "COMMON",
    types: ["SPELL", "FIRE"],
    archetype,
    collection,
    balanceVersion,
    play: {
      actionCost: 1,
      target: { scope: "ALLY_UNIT", archetype: "FIRE_BEASTS" },
      effects: [
        {
          timing: "ON_SPELL_PLAYED",
          operations: [{ kind: "HANDLER", handler: "BLOOD_IN_EMBER" }],
        },
      ],
    },
    rulesText:
      "Escolha uma Besta de Fogo. Ela sofre 200 de dano. Seu próximo ataque neste turno causa +300. Caso esteja com metade ou menos dos PV, o bônus passa a ser +500.",
    lore: "Dor é apenas outra forma de combustível.",
    artwork: { alt: "Sangue em Brasa" },
  },
  {
    id: "BF-008",
    name: "Presas de Obsidiana",
    category: "EQUIPMENT",
    rarity: "UNCOMMON",
    types: ["EQUIPMENT"],
    archetype,
    collection,
    balanceVersion,
    play: {
      actionCost: 1,
      target: { scope: "ALLY_UNIT" },
      effects: [
        {
          timing: "CONTINUOUS",
          operations: [{ kind: "MODIFY_ATTACK_DAMAGE", value: 200 }],
        },
      ],
    },
    passiveEffects: [
      {
        id: "obsidian-fangs-lifesteal",
        timing: "ON_DESTROY_UNIT",
        operations: [{ kind: "HANDLER", handler: "OBSIDIAN_FANGS_LIFESTEAL" }],
      },
    ],
    rulesText:
      "A Unidade equipada recebe +200 de dano em ataques corpo a corpo. Ao destruir uma Unidade adversária, recupera 100 PV. Caso seja uma Besta de Fogo, recupera 200 PV.",
    visualDescription: "Presas artificiais negras instaladas sobre os dentes naturais de uma criatura.",
    artwork: { alt: "Presas de Obsidiana" },
  },
  {
    id: "BF-009",
    name: "Erupção Repentina",
    category: "TRAP",
    rarity: "RARE",
    types: ["TRAP"],
    archetype,
    collection,
    balanceVersion,
    play: {
      actionCost: 1,
      trigger: { kind: "ON_ATTACK_DECLARED", enemyOnly: true },
      effects: [
        {
          timing: "ON_TRAP_ACTIVATED",
          operations: [{ kind: "HANDLER", handler: "SUDDEN_ERUPTION" }],
        },
      ],
    },
    rulesText:
      "Ative quando uma Unidade inimiga declarar um ataque. Cause 400 de dano à Unidade atacante. Caso Caldeira de Cinerath esteja ativa, aplique também Queimadura.",
    visualDescription: "Solo vulcânico explodindo abaixo dos pés de um Mago Umbral.",
    artwork: { alt: "Erupção Repentina" },
  },
  {
    id: "BF-010",
    name: "Caldeira de Cinerath",
    category: "FIELD",
    rarity: "RARE",
    types: ["FIELD"],
    archetype,
    collection,
    balanceVersion,
    play: { actionCost: 1 },
    passiveEffects: [
      {
        id: "cinerath-cauldron",
        timing: "CONTINUOUS",
        handler: "CINERATH_CAULDRON",
        operations: [{ kind: "HANDLER", handler: "CINERATH_CAULDRON" }],
      },
    ],
    rulesText:
      "Bestas de Fogo causam +100 de dano. A primeira vez em cada turno que uma Besta de Fogo sofrer dano, esse dano é reduzido em 100. Queimadura causa +100 de dano adicional.",
    visualDescription:
      "Gigantesco vale vulcânico de Cinerath. Ao fundo existe uma torre negra claramente artificial — a Torre do Eclipse.",
    artwork: { alt: "Caldeira de Cinerath" },
  },
];
