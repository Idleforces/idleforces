import { declareRecordByInitializer } from "../../utils/utils";
import { resetNextEventIn } from "../events/next-event";
import { generateProblem } from "../problems/generate-problem";
import { generateInitialProblemSolveStatus } from "../problems/solve-problem";
import type { ProblemDivision, ProblemPlacement } from "../problems/types";
import { ProblemPlacements } from "../problems/types";
import {
  computeProblemPlacementFromProblemPosition,
  computeProblemPositionFromProblemPlacement,
  computeTimeToSwitchToAnotherProblem,
} from "../problems/utils";
import { computeActiveProblemPosition } from "./active-problem";
import {
  computeContestProblemScores,
  computeProblemScoreDecrementsPerMinute,
} from "./problem-scores";
import type {
  ContestNPCData,
  ContestPlayerData,
  ContestProblemNumberValues,
  ContestProblems,
  ContestSlice,
  ContestUserData,
} from "./types";
import type { NPC, User } from "../users/types";

export const generateContest = (
  division: ProblemDivision,
  playerParticipating: boolean,
  users: Array<User>
): ContestSlice => {
  const problems: ContestProblems = Object.values(ProblemPlacements).map(
    (placement) => generateProblem(division, placement)
  );
  const problemScores: ContestProblemNumberValues =
    computeContestProblemScores(problems);
  const problemScoreDecrementsPerMinute: ContestProblemNumberValues =
    computeProblemScoreDecrementsPerMinute(problemScores);

  const NPCsParticipating = users.filter(
    (user) => !user.isPlayer && Math.random() < user.likelihoodOfCompeting
  ) as Array<NPC>;

  const contestNPCData: Array<ContestNPCData> = NPCsParticipating.map((NPC) => {
    const activeProblemPlacement: ProblemPlacement =
      computeProblemPlacementFromProblemPosition(
        computeActiveProblemPosition(
          problems.map((_) => true),
          NPC.willingnessToTryHarderProblems
        ) as number
      );

    return {
      handle: NPC.handle,
      blockingBreak: null,
      nonBlockingBreaks: declareRecordByInitializer(
        ProblemPlacements,
        (_placement) => null
      ),
      problemSolveStatuses: declareRecordByInitializer(
        ProblemPlacements,
        (_placement) => generateInitialProblemSolveStatus()
      ),
      activeProblemPlacement,
      isPlayer: false,
      numberOfTimesSwitched: problems.map((_problem) => 0),
      remainingTicksToSwitchToAnotherProblem:
        computeTimeToSwitchToAnotherProblem(
          NPC,
          activeProblemPlacement,
          division,
          problems[
            computeProblemPositionFromProblemPlacement(activeProblemPlacement)
          ].tag,
          0
        ),
    };
  });

  const contestPlayerData: Array<ContestPlayerData> = playerParticipating
    ? [
        {
          handle: users[0].handle,
          blockingBreak: null,
          nonBlockingBreaks: declareRecordByInitializer(
            ProblemPlacements,
            (_placement) => null
          ),
          problemSolveStatuses: declareRecordByInitializer(
            ProblemPlacements,
            (_placement) => generateInitialProblemSolveStatus()
          ),
          activeProblemPlacement: "A",
          isPlayer: true,
        },
      ]
    : [];

  return {
    ticksSinceBeginning: 0,
    nextEventIn: resetNextEventIn(0),
    division,
    problems,
    problemScores,
    problemScoreDecrementsPerMinute,
    contestUsersData: (contestPlayerData as Array<ContestUserData>).concat(
      contestNPCData
    ),
  };
};
