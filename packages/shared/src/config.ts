export interface StatusRulesConfig {
  burn: {
    damage: number;
    durationTicks: number;
    timing: "TURN_START";
  };
  poison: {
    damage: number;
    timing: "TURN_END";
    persistent: boolean;
  };
  stun: {
    expires: "END_OF_CONTROLLER_TURN";
  };
}

export interface GameRulesConfig {
  officialLife: number;
  quickLife: number;
  deckSize: number;
  initialHandSize: number;
  drawPerTurn: number;
  actionsPerTurn: number;
  unitSlots: number;
  supportSlots: number;
  fieldSlots: number;
  maxCopiesPerCard: number;
  drawOnFirstTurn: boolean;
  summonActionCostByLevel: Record<number, number>;
  defaultSpellActionCost: number;
  defaultEquipmentActionCost: number;
  defaultTrapSetActionCost: number;
  defaultFieldActionCost: number;
  defaultAttackActionCost: number;
  status: StatusRulesConfig;
}

export type DecisionPolicy = "MANUAL" | "AUTO_ACCEPT";

export type DuelMode = "OFFICIAL" | "QUICK";
