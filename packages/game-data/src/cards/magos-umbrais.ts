import type { CardDefinition } from "@duelo/shared";
import { CATALOG_BALANCE_VERSION, COLLECTION_ID } from "../rules.js";

const collection = COLLECTION_ID;
const balanceVersion = CATALOG_BALANCE_VERSION;
const archetype = "UMBRAL_MAGES" as const;

export const UMBRAL_MAGE_CARDS: CardDefinition[] = [
  {
    id: "MU-001",
    name: "Aprendiz do Véu",
    category: "UNIT",
    rarity: "COMMON",
    types: ["HUMAN", "MAGE", "UMBRAL"],
    archetype,
    collection,
    balanceVersion,
    level: 1,
    maxHp: 500,
    summon: { actionCost: 1 },
    attacks: [
      {
        id: "shadow-burst",
        name: "Rajada Sombria",
        damage: 200,
        actionCost: 1,
      },
    ],
    passiveEffects: [
      {
        id: "veil-study",
        timing: "ON_SUMMON",
        operations: [{ kind: "LOOK_TOP" }],
      },
    ],
    rulesText:
      "Rajada Sombria: 200. Estudo do Véu: ao ser Invocado, olhe a carta do topo do Deck e mantenha-a ou envie-a ao Descarte.",
    visualDescription: "Jovem estudante com uniforme escuro. Runas violetas iluminam parcialmente seu rosto.",
    artwork: { alt: "Aprendiz do Véu" },
  },
  {
    id: "MU-002",
    name: "Tecelã de Sombras",
    category: "UNIT",
    rarity: "COMMON",
    types: ["HUMAN", "MAGE", "UMBRAL"],
    archetype,
    collection,
    balanceVersion,
    level: 2,
    maxHp: 800,
    summon: { actionCost: 1 },
    attacks: [
      {
        id: "shadow-lance",
        name: "Lança Sombria",
        damage: 300,
        actionCost: 1,
      },
    ],
    passiveEffects: [
      {
        id: "weaving",
        timing: "CONTINUOUS",
        handler: "SHADOW_WEAVER_TRAP_BONUS",
        operations: [{ kind: "HANDLER", handler: "SHADOW_WEAVER_TRAP_BONUS" }],
      },
    ],
    rulesText:
      "Lança Sombria: 300. Tecelagem: a primeira Armadilha Mágica preparada enquanto esta Unidade estiver em campo, ao ser ativada, cura esta Unidade em 100 PV.",
    lore: "Os iniciados aprendem a criar sombras. Os verdadeiros Umbrais aprendem que elas nunca precisaram ser criadas.",
    artwork: { alt: "Tecelã de Sombras" },
  },
  {
    id: "MU-003",
    name: "Carrasco do Eclipse",
    category: "UNIT",
    rarity: "UNCOMMON",
    types: ["HUMAN", "MAGE", "UMBRAL"],
    archetype,
    collection,
    balanceVersion,
    level: 3,
    maxHp: 1300,
    summon: { actionCost: 2 },
    attacks: [
      {
        id: "veil-cut",
        name: "Corte do Véu",
        damage: 400,
        actionCost: 1,
      },
      {
        id: "shadow-execution",
        name: "Execução Sombria",
        damage: 700,
        actionCost: 1,
        effects: [
          {
            timing: "ON_ATTACK",
            condition: { kind: "TARGET_HP_AT_OR_BELOW_PERCENT", value: 50 },
            operations: [{ kind: "MODIFY_ATTACK_DAMAGE", value: 200 }],
          },
        ],
      },
    ],
    passiveEffects: [
      {
        id: "wounded-hunter",
        timing: "ON_UNIT_DAMAGED",
        handler: "EXECUTIONER_MARK",
        operations: [{ kind: "HANDLER", handler: "EXECUTIONER_MARK" }],
      },
    ],
    rulesText:
      "Corte do Véu: 400. Execução Sombria: 700; se o alvo estiver com metade ou menos dos PV, +200. Caçador de Feridos: quando uma Unidade inimiga perder PV por Magia ou Armadilha Mágica, pode marcá-la; ao atacá-la neste ciclo, +100.",
    artwork: { alt: "Carrasco do Eclipse" },
  },
  {
    id: "MU-004",
    name: "Arconte Sem-Rosto",
    category: "UNIT",
    rarity: "RARE",
    types: ["HUMAN", "MAGE", "UMBRAL"],
    archetype,
    collection,
    balanceVersion,
    level: 4,
    maxHp: 1900,
    summon: { actionCost: 2 },
    attacks: [
      {
        id: "abyss-hands",
        name: "Mãos do Abismo",
        damage: 500,
        actionCost: 1,
      },
      {
        id: "form-theft",
        name: "Roubo de Forma",
        damage: 600,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "COPY_PASSIVES" }],
          },
        ],
      },
    ],
    passiveEffects: [
      {
        id: "no-identity",
        timing: "CONTINUOUS",
        handler: "ARCHON_NO_IDENTITY",
        operations: [{ kind: "HANDLER", handler: "ARCHON_NO_IDENTITY" }],
      },
    ],
    tags: ["NO_IDENTITY"],
    rulesText:
      "Mãos do Abismo: 500. Roubo de Forma: 600; até o final do turno, recebe um efeito passivo da Unidade atacada. Sem Identidade: não pode ser escolhido por efeitos que exijam um Tipo específico de Unidade.",
    visualDescription:
      "Figura alta em vestes cerimoniais. O local onde deveria existir um rosto é uma superfície negra e perfeitamente lisa.",
    lore: "Alguns dizem que os Arcontes removem o próprio nome durante a iniciação.",
    artwork: { alt: "Arconte Sem-Rosto" },
  },
  {
    id: "MU-005",
    name: "Velka, Bruxa das Sete Sombras",
    category: "UNIT",
    rarity: "EPIC",
    types: ["HUMAN", "MAGE", "UMBRAL"],
    archetype,
    collection,
    balanceVersion,
    level: 5,
    maxHp: 2400,
    summon: { actionCost: 3 },
    attacks: [
      {
        id: "umbral-needles",
        name: "Agulhas Umbrais",
        damage: 500,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "APPLY_STATUS", statusType: "SHADOW_POISON" }],
          },
        ],
      },
      {
        id: "shadow-devours-shadow",
        name: "Sombra Devora Sombra",
        damage: 800,
        actionCost: 1,
        effects: [
          {
            timing: "ON_ATTACK",
            condition: { kind: "TARGET_HAS_ANY_NEGATIVE_STATUS" },
            operations: [{ kind: "MODIFY_ATTACK_DAMAGE", value: 200 }],
          },
        ],
      },
    ],
    passiveEffects: [
      {
        id: "seven-shadows",
        timing: "BEFORE_DAMAGE",
        oncePerTurn: true,
        handler: "VELKA_SEVEN_SHADOWS",
        operations: [{ kind: "HANDLER", handler: "VELKA_SEVEN_SHADOWS" }],
      },
    ],
    rulesText:
      "Agulhas Umbrais: 500, aplica Veneno Sombrio. Sombra Devora Sombra: 800; se o alvo possuir qualquer condição negativa, +200. Sete Sombras: na primeira vez em cada turno que sofreria dano de um ataque, reduza esse dano em 200.",
    visualDescription: "Mulher de vestes negras cercada por sete sombras diferentes, apesar de existir apenas uma fonte de luz.",
    artwork: { alt: "Velka, Bruxa das Sete Sombras" },
  },
  {
    id: "MU-006",
    name: "Nereth, Arquimago do Véu Negro",
    category: "UNIT",
    rarity: "LEGENDARY",
    types: ["HUMAN", "MAGE", "ARCHMAGE", "UMBRAL"],
    archetype,
    collection,
    balanceVersion,
    level: 7,
    maxHp: 3400,
    summon: {
      actionCost: 3,
      requirements: [
        {
          kind: "DISCARD_HAS_CATEGORY",
          categories: ["SPELL", "MAGIC_TRAP"],
        },
      ],
    },
    attacks: [
      {
        id: "artificial-eclipse",
        name: "Eclipse Artificial",
        damage: 700,
        actionCost: 1,
        effects: [
          {
            timing: "AFTER_DAMAGE",
            operations: [{ kind: "HANDLER", handler: "NERETH_ECLIPSE_AOE" }],
          },
        ],
      },
      {
        id: "veil-rupture",
        name: "Ruptura do Véu",
        damage: 1000,
        actionCost: 1,
        effects: [
          {
            timing: "ON_ATTACK",
            condition: { kind: "TARGET_HAS_ANY_NEGATIVE_STATUS" },
            operations: [{ kind: "HANDLER", handler: "NERETH_IGNORE_PROTECTION" }],
          },
        ],
      },
    ],
    passiveEffects: [
      {
        id: "lord-of-veil-recover",
        timing: "ON_SUMMON",
        operations: [{ kind: "RECOVER_CARD" }],
      },
      {
        id: "lord-of-veil-heal",
        timing: "ON_TRAP_ACTIVATED",
        oncePerTurn: true,
        handler: "NERETH_TRAP_HEAL",
        operations: [{ kind: "HANDLER", handler: "NERETH_TRAP_HEAL" }],
      },
    ],
    rulesText:
      "Invocação: 3 Ações e ao menos uma Magia ou Armadilha Mágica no Descarte. Eclipse Artificial: 700; todas as outras Unidades recebem 100. Ruptura do Véu: 1000; se o alvo possuir condição negativa, ignora Proteção. Ao entrar, uma Armadilha Mágica do Descarte pode ser preparada sem Ação. Uma vez por turno, ao ativar Armadilha Mágica, recupera 200 PV.",
    lore: "Nereth foi o primeiro homem a atravessar completamente o Véu. Também foi o primeiro a voltar.",
    artwork: { alt: "Nereth, Arquimago do Véu Negro" },
  },
  {
    id: "MU-007",
    name: "Toque da Ausência",
    category: "SPELL",
    rarity: "COMMON",
    types: ["SPELL", "UMBRAL"],
    archetype,
    collection,
    balanceVersion,
    play: {
      actionCost: 1,
      target: { scope: "ANY_UNIT" },
      effects: [
        {
          timing: "ON_SPELL_PLAYED",
          operations: [{ kind: "HANDLER", handler: "TOUCH_OF_ABSENCE" }],
        },
      ],
    },
    rulesText:
      "Escolha uma Unidade. Ela sofre 300 de dano. Caso já possua uma condição negativa, sofre 500 em vez disso.",
    visualDescription:
      "Uma mão espectral atravessa o corpo de uma Besta de Fogo sem produzir qualquer ferimento físico aparente.",
    artwork: { alt: "Toque da Ausência" },
  },
  {
    id: "MU-008",
    name: "Bastão do Véu Partido",
    category: "MAGIC_EQUIPMENT",
    rarity: "UNCOMMON",
    types: ["MAGIC_EQUIPMENT"],
    archetype,
    collection,
    balanceVersion,
    play: {
      actionCost: 1,
      target: { scope: "ALLY_UNIT", types: ["MAGE"] },
      effects: [
        {
          timing: "CONTINUOUS",
          operations: [{ kind: "MODIFY_ATTACK_DAMAGE", value: 100 }],
        },
      ],
    },
    passiveEffects: [
      {
        id: "broken-veil-staff",
        timing: "ON_SPELL_PLAYED",
        oncePerTurn: true,
        handler: "BROKEN_VEIL_STAFF_HEAL",
        operations: [{ kind: "HANDLER", handler: "BROKEN_VEIL_STAFF_HEAL" }],
      },
    ],
    rulesText:
      "Só pode ser equipado em Magos. Ataques da Unidade equipada causam +100. Uma vez por turno, quando você ativar uma Magia, a Unidade equipada recupera 100 PV.",
    lore: "O bastão foi encontrado partido ao lado do primeiro portal.",
    artwork: { alt: "Bastão do Véu Partido" },
  },
  {
    id: "MU-009",
    name: "Prisão Sem Luz",
    category: "MAGIC_TRAP",
    rarity: "RARE",
    types: ["MAGIC_TRAP"],
    archetype,
    collection,
    balanceVersion,
    play: {
      actionCost: 1,
      trigger: { kind: "ON_UNIT_SUMMONED", enemyOnly: true },
      effects: [
        {
          timing: "ON_TRAP_ACTIVATED",
          operations: [{ kind: "HANDLER", handler: "LIGHTLESS_PRISON" }],
        },
      ],
    },
    rulesText:
      "Ative quando uma Unidade adversária for Invocada. Ela recebe Atordoamento. Caso seja uma Besta, também sofre 200 de dano.",
    visualDescription:
      "Uma grande Besta de Fogo emergindo de um portal e sendo imediatamente aprisionada por correntes feitas de sombra.",
    artwork: { alt: "Prisão Sem Luz" },
  },
  {
    id: "MU-010",
    name: "Torre do Eclipse",
    category: "FIELD",
    rarity: "RARE",
    types: ["FIELD"],
    archetype,
    collection,
    balanceVersion,
    play: { actionCost: 1 },
    passiveEffects: [
      {
        id: "eclipse-tower",
        timing: "CONTINUOUS",
        handler: "ECLIPSE_TOWER",
        operations: [{ kind: "HANDLER", handler: "ECLIPSE_TOWER" }],
      },
    ],
    rulesText:
      "Magos Umbrais recebem +100 PV máximo. A primeira Armadilha Mágica ativada em cada turno causa +100 de dano caso possua dano. Uma vez por turno, quando uma Unidade inimiga receber uma condição negativa, cure 100 PV de um Mago Umbral.",
    visualDescription:
      "A torre observada na arte de Caldeira de Cinerath, vista de perto. Ao longe, a silhueta colossal de Pyraxa.",
    artwork: { alt: "Torre do Eclipse" },
  },
];
