import type { CardId } from "./ids.js";

export type CardCategory =
  | "UNIT"
  | "SPELL"
  | "EQUIPMENT"
  | "MAGIC_EQUIPMENT"
  | "TRAP"
  | "MAGIC_TRAP"
  | "FIELD";

export type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type Archetype = "FIRE_BEASTS" | "UMBRAL_MAGES";

export type Keyword = "CHARGE" | "PIERCING";

export type StatusType = "BURN" | "POISON" | "SHADOW_POISON" | "STUN" | "PROTECTION";

export type EffectTiming =
  | "ON_SUMMON"
  | "ON_ATTACK_DECLARED"
  | "BEFORE_DAMAGE"
  | "AFTER_DAMAGE"
  | "ON_UNIT_DAMAGED"
  | "ON_UNIT_DESTROYED"
  | "ON_DESTROY_UNIT"
  | "ON_SPELL_PLAYED"
  | "ON_TRAP_ACTIVATED"
  | "ON_STATUS_APPLIED"
  | "TURN_START"
  | "TURN_END"
  | "CONTINUOUS"
  | "ON_ATTACK"
  | "REPLACEMENT_DESTRUCTION";

export type TargetScope =
  | "SELF"
  | "ALLY_UNIT"
  | "ENEMY_UNIT"
  | "ANY_UNIT"
  | "ALLY_DUELIST"
  | "ENEMY_DUELIST"
  | "ALL_ALLY_UNITS"
  | "ALL_ENEMY_UNITS"
  | "ALL_UNITS"
  | "ALL_OTHER_UNITS";

export type RequirementKind =
  | "SELF_DAMAGE_TAKEN_AT_LEAST"
  | "SELF_HP_AT_OR_BELOW_PERCENT"
  | "TARGET_HP_BELOW_PERCENT"
  | "TARGET_HAS_STATUS"
  | "TARGET_HAS_ANY_NEGATIVE_STATUS"
  | "CONTROL_ARCHETYPE_UNIT"
  | "CONTROL_OR_DISCARD_UNIT"
  | "DISCARD_HAS_CATEGORY"
  | "FIELD_ACTIVE"
  | "EQUIP_TYPE_INCLUDES";

export interface RequirementDefinition {
  kind: RequirementKind;
  value?: number;
  types?: string[];
  archetype?: Archetype;
  minLevel?: number;
  categories?: CardCategory[];
  cardId?: CardId;
  statusTypes?: StatusType[];
}

export interface ConditionDefinition {
  kind: string;
  value?: number;
  types?: string[];
  archetype?: Archetype;
  statusTypes?: StatusType[];
  cardId?: CardId;
}

export interface TargetDefinition {
  scope: TargetScope;
  types?: string[];
  archetype?: Archetype;
  count?: number;
}

export type EffectOperationKind =
  | "DEAL_DAMAGE"
  | "HEAL"
  | "DRAW"
  | "DISCARD"
  | "APPLY_STATUS"
  | "REMOVE_STATUS"
  | "MODIFY_ATTACK_DAMAGE"
  | "MODIFY_MAX_HP"
  | "REDUCE_DAMAGE"
  | "MOVE_CARD"
  | "SET_KEYWORD"
  | "RECOVER_CARD"
  | "LOOK_TOP"
  | "MARK_UNIT"
  | "COPY_PASSIVES"
  | "HANDLER";

export interface EffectOperation {
  kind: EffectOperationKind;
  value?: number;
  statusType?: StatusType;
  statusDuration?: number;
  handler?: string;
  ignoreProtection?: boolean;
  piercing?: boolean;
  self?: boolean;
  extra?: Record<string, unknown>;
}

export interface EffectDefinition {
  id?: string;
  timing: EffectTiming;
  condition?: ConditionDefinition;
  target?: TargetDefinition;
  operations: EffectOperation[];
  oncePerTurn?: boolean;
  optional?: boolean;
  handler?: string;
}

export interface AttackDefinition {
  id: string;
  name: string;
  damage: number;
  actionCost: number;
  requirements?: RequirementDefinition[];
  effects?: EffectDefinition[];
  keywords?: Keyword[];
}

export interface SummonDefinition {
  actionCost: number;
  requirements?: RequirementDefinition[];
}

export interface TrapTriggerDefinition {
  kind: "ON_ATTACK_DECLARED" | "ON_UNIT_SUMMONED";
  enemyOnly?: boolean;
}

export interface PlayDefinition {
  actionCost: number;
  requirements?: RequirementDefinition[];
  effects?: EffectDefinition[];
  trigger?: TrapTriggerDefinition;
  target?: TargetDefinition;
}

export interface CardDefinition {
  id: CardId;
  name: string;
  category: CardCategory;
  rarity: Rarity;
  types: string[];
  archetype: Archetype;
  collection: string;
  balanceVersion: number;
  rulesText?: string;
  lore?: string;
  visualDescription?: string;
  artwork?: {
    /** ID do asset estático (ex.: "BF-001"); a UI resolve o path de hosting. */
    assetId?: string;
    alt: string;
    /** Assets alternativos (ex.: "BF-001-alt"); sem seletor de skin nesta entrega. */
    alternateAssetIds?: string[];
  };
  tags?: string[];
  level?: number;
  maxHp?: number;
  summon?: SummonDefinition;
  attacks?: AttackDefinition[];
  passiveEffects?: EffectDefinition[];
  keywords?: Keyword[];
  play?: PlayDefinition;
}

export interface DeckCardCount {
  cardId: CardId;
  count: number;
}

export interface DeckList {
  id: string;
  name: string;
  archetype: Archetype;
  cards: DeckCardCount[];
}
