import type { GameRulesConfig } from "@duelo/shared";

export const DEFAULT_GAME_RULES: GameRulesConfig = {
  officialLife: 8000,
  quickLife: 4000,
  deckSize: 30,
  initialHandSize: 5,
  drawPerTurn: 1,
  actionsPerTurn: 3,
  unitSlots: 3,
  supportSlots: 3,
  fieldSlots: 1,
  maxCopiesPerCard: 3,
  drawOnFirstTurn: false,
  summonActionCostByLevel: {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
    7: 3,
  },
  defaultSpellActionCost: 1,
  defaultEquipmentActionCost: 1,
  defaultTrapSetActionCost: 1,
  defaultFieldActionCost: 1,
  defaultAttackActionCost: 1,
  status: {
    burn: {
      damage: 100,
      durationTicks: 2,
      timing: "TURN_START",
    },
    poison: {
      damage: 100,
      timing: "TURN_END",
      persistent: true,
    },
    stun: {
      expires: "END_OF_CONTROLLER_TURN",
    },
  },
};

export const COLLECTION_ID = "WAR_OF_ASH_AND_VEIL";
export const CATALOG_BALANCE_VERSION = 1;
export const ENGINE_VERSION = "0.1.0";
