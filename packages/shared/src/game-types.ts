import type { CardCategory, CardDefinition, EffectDefinition, StatusType } from "./catalog-types.js";
import type { DecisionPolicy, DuelMode, GameRulesConfig } from "./config.js";
import type {
  CardId,
  CardInstanceId,
  CommandId,
  DecisionId,
  EventId,
  GameId,
  ModifierId,
  PlayerId,
  StatusInstanceId,
} from "./ids.js";

export type DuelStatus = "SETUP" | "IN_PROGRESS" | "FINISHED";

export type TurnPhase = "TURN_START" | "DRAW" | "ACTION_REFRESH" | "FREE_PHASE" | "TURN_END";

export type Zone = "DECK" | "HAND" | "UNIT" | "SUPPORT" | "FIELD" | "DISCARD";

export interface CardInstance {
  instanceId: CardInstanceId;
  cardId: CardId;
  ownerId: PlayerId;
  controllerId: PlayerId;
  zone: Zone;
  revealed: boolean;
  slotIndex?: number;
}

export interface StatusInstance {
  id: StatusInstanceId;
  type: StatusType;
  sourceInstanceId?: CardInstanceId;
  sourceCardId?: CardId;
  sourcePlayerId?: PlayerId;
  targetInstanceId: CardInstanceId;
  intensity: number;
  remainingTicks?: number;
  createdAtTurn: number;
  expiresAtTurnEnd?: number;
  tickTiming?: "TURN_START" | "TURN_END";
  metadata?: Record<string, unknown>;
}

export interface Modifier {
  id: ModifierId;
  sourceInstanceId?: CardInstanceId;
  sourceCardId?: CardId;
  targetInstanceId?: CardInstanceId;
  property: "ATTACK_DAMAGE" | "MAX_HP" | "NEXT_ATTACK_DAMAGE" | "DAMAGE_REDUCTION";
  operation: "ADD" | "SET";
  value: number;
  duration: "WHILE_SOURCE_IN_PLAY" | "UNTIL_END_OF_TURN" | "UNTIL_NEXT_ATTACK" | "PERMANENT" | "ONCE";
  usedThisTurn?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UnitInstance {
  instanceId: CardInstanceId;
  cardId: CardId;
  ownerId: PlayerId;
  controllerId: PlayerId;
  slotIndex: number;
  currentHp: number;
  maxHpBase: number;
  summonedOnTurn: number;
  hasAttackedThisTurn: boolean;
  statuses: StatusInstance[];
  temporaryEffects: Modifier[];
  equipmentInstanceIds: CardInstanceId[];
  damageTakenTotal: number;
  flags: Record<string, unknown>;
  stolenPassives?: EffectDefinition[];
}

export interface SupportInstance {
  instanceId: CardInstanceId;
  cardId: CardId;
  ownerId: PlayerId;
  controllerId: PlayerId;
  slotIndex: number;
  setTurn: number;
  revealed: boolean;
  category: CardCategory;
  equippedToInstanceId?: CardInstanceId;
  extraEffects?: EffectDefinition[];
  flags: Record<string, unknown>;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  currentHp: number;
  maxHp: number;
  actionsRemaining: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  unitSlots: Array<UnitInstance | null>;
  supportSlots: Array<SupportInstance | null>;
  fieldSlot: CardInstance | null;
  oncePerTurnFlags: Record<string, boolean>;
}

export type PendingDecisionType =
  | "OPTIONAL_TRAP"
  | "LOOK_TOP_DECK"
  | "CHOOSE_DISCARD_CARD";

export interface PendingDecisionOption {
  id: string;
  label: string;
  instanceId?: CardInstanceId;
}

export interface PendingDecision {
  id: DecisionId;
  type: PendingDecisionType;
  playerId: PlayerId;
  prompt: string;
  options: PendingDecisionOption[];
  context: Record<string, unknown>;
}

export type PendingResolutionKind = "ATTACK" | "SUMMON";

export interface PendingResolution {
  kind: PendingResolutionKind;
  actorId: PlayerId;
  attackerInstanceId?: CardInstanceId;
  attackId?: string;
  targetKind?: "UNIT" | "DUELIST";
  targetInstanceId?: CardInstanceId;
  targetPlayerId?: PlayerId;
  summonedInstanceId?: CardInstanceId;
  remainingTrapInstanceIds: CardInstanceId[];
}

export interface DuelEvent {
  eventId: EventId;
  sequence: number;
  turn: number;
  type: string;
  actorId?: PlayerId;
  sourceInstanceId?: CardInstanceId;
  targetIds?: string[];
  payload: Record<string, unknown>;
}

export type DuelResultReason = "LIFE_ZERO" | "DECK_OUT" | "SURRENDER";

export interface DuelResult {
  winnerId: PlayerId;
  loserId: PlayerId;
  reason: DuelResultReason;
}

export interface RngState {
  seed: string;
  state: number;
}

export interface GameState {
  id: GameId;
  mode: DuelMode;
  status: DuelStatus;
  turnNumber: number;
  activePlayerId: PlayerId;
  firstPlayerId: PlayerId;
  phase: TurnPhase;
  players: [PlayerState, PlayerState];
  events: DuelEvent[];
  result?: DuelResult;
  rng: RngState;
  pendingDecision?: PendingDecision;
  pendingResolution?: PendingResolution;
  stateVersion: number;
  catalogBalanceVersion: number;
  engineVersion: string;
  debug: boolean;
  decisionPolicy: DecisionPolicy;
  rules: GameRulesConfig;
  oncePerTurnGlobal: Record<string, boolean>;
  cardCounter: number;
  eventCounter: number;
}

export type CommandType =
  | "START_GAME"
  | "SUMMON_UNIT"
  | "DECLARE_ATTACK"
  | "PLAY_SPELL"
  | "PLAY_EQUIPMENT"
  | "SET_TRAP"
  | "PLAY_FIELD"
  | "END_TURN"
  | "CONCEDE"
  | "RESOLVE_DECISION"
  | "DEBUG_DRAW"
  | "DEBUG_SET_HP"
  | "DEBUG_ADD_TO_HAND"
  | "DEBUG_SET_ACTIONS";

export interface Command {
  commandId: CommandId;
  type: CommandType;
  playerId: PlayerId;
  payload?: Record<string, unknown>;
}

export interface RuleError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface EngineResult {
  ok: boolean;
  state: GameState;
  events: DuelEvent[];
  error?: RuleError;
}

export interface CreateDuelInput {
  mode: DuelMode;
  seed: string;
  players: [
    { id: PlayerId; name: string; deck: Array<{ cardId: CardId; count: number }> },
    { id: PlayerId; name: string; deck: Array<{ cardId: CardId; count: number }> },
  ];
  rules?: Partial<GameRulesConfig>;
  debug?: boolean;
  decisionPolicy?: DecisionPolicy;
  catalog?: Record<CardId, CardDefinition>;
  shuffle?: boolean;
  firstPlayerId?: PlayerId;
}

export interface LegalAction {
  type: CommandType;
  label: string;
  instanceId?: CardInstanceId;
  attackId?: string;
  requiresTarget?: boolean;
  requiresSlot?: "UNIT" | "SUPPORT";
  payload?: Record<string, unknown>;
}

export interface TargetOption {
  kind: "UNIT" | "DUELIST" | "SLOT" | "CARD";
  id: string;
  playerId?: PlayerId;
  instanceId?: CardInstanceId;
  slotIndex?: number;
  valid: boolean;
  reason?: string;
}
