import type {
  ProblemPlacement,
  ProblemSolveStatus,
  ProblemTag,
  ProblemSolveStatusWhileActive,
  ContestSubmission,
} from "../problems/types";
import type { User } from "../users/types";

export type ProblemSolvingPhase = ProblemSolveStatus["phase"];
type ProblemSolvingPhaseWhileActive = ProblemSolveStatusWhileActive["phase"];
type ProblemSolvingPhaseConfigOptions =
  | Array<ProblemSolvingPhaseWhileActive>
  | "all";

export type ContestEventBlueprint = {
  name: string;
  message: string;
  sentiment: "positive" | "negative" | "neutral";
  /**
   * Array of phase names or "all" for all phases
   */
  phases: Readonly<ProblemSolvingPhaseConfigOptions>;

  /**
   * Multiplier, general suggestion is to give more that 1 to common events, and less than 1 to rare events.
   */
  probability: number | ((probabilityParams: EventProbabilityParams) => number);

  /**
   * 0-1 value being a continuous extension of the following function P(_, e: ContestEventBlueprint) computing the probability an event will fire in a given tick:
   *
   * @example P(0, e: ContestEventBlueprint) ~ e.probability
   * @example P(1, e: ContestEventBlueprint) ~ e.probability / (currentIncrement * EXPECTED_NUMBER_TICKS_PER_PHASE)
   * @example P(t, e: ContestEventBlueprint) ~ e.probability / (currentIncrement * EXPECTED_NUMBER_TICKS_PER_PHASE)^t
   * @remark Technically, all real values of this parameter are allowed, however the values within [0, 1] make the most sense.
   */
  probabilityScalingRateWithRateOfIncrement: number;
  isGlobal: boolean;

  setProgress?:
    | number
    | ((setProgressParams: EventSetProgressParams) => number);
  setIncrement?:
    | number
    | ((setIncrementParams: EventSetIncrementParams) => number);

  /**
   * Break automatically scales according to probabilityScalesWithExpectedLengthOfPhase.
   */
  setBreakInTicks?:
    | BreakData
    | ((setBreakInTicksParams: EventSetBreakInTicksParams) => BreakData);
};

export type ContestEvent = {
  message: string;
  ticksSinceBeginning: number;
  problemPlacement: ProblemPlacement | "global";
  sentiment: "positive" | "negative" | "neutral";
};

export type EventsSlice = Array<ContestEvent> | null;

export interface EventProbabilityParams {
  progress: number;
  submissions: Array<ContestSubmission>;
}

interface EventSetProgressParams {
  progress: number;
}

interface EventSetIncrementParams {
  increment: number;
}

interface EventSetBreakInTicksParams {
  tag: ProblemTag;
  user: User;
  penPaperDifficulty: number;
  implementationDifficulty: number;
}

interface BreakData {
  breakRemainingLength: number;
  messageOnEndOfBreak: string;
  /**
   * Determines if the break blocks player from attempting another problems. Non-blocking breaks created by events with `isGlobal = true` have no effect.
   */
  isBlocking: boolean;
}

export interface BreakDataWithProblemPlacement extends BreakData {
  problemPlacement: ProblemPlacement | "global";
}

export interface BreakDataWithProblemPlacementAndUserContestIndex
  extends BreakDataWithProblemPlacement {
  userContestIndex: number;
}
