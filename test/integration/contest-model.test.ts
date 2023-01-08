import { describe, expect, it, assert } from "vitest";
import { generateContest } from "../../src/app/contest/generate-contest";
import { processTickOfContest } from "../../src/app/contest/process-tick";
import type {
  ContestNPCData,
  ContestUserData,
} from "../../src/app/contest/types";
import type { ProblemDivision } from "../../src/app/problems/types";
import { problemPlacements } from "../../src/app/problems/types";
import { generateUsers } from "../../src/app/users/load-users";
import { mockStore } from "../mocks/mock-store";
import { assertProbabilisticCloseTo } from "../probabilistic-assert";
import sinon from "sinon";
import { CONTEST_LENGTH } from "../../src/app/contest/constants";

describe("during contest simulation", () => {
  const store = mockStore;
  const dispatch = store.mockDispatch;
  const spyDispatch = sinon.spy(dispatch);

  const handle = "someHandle";
  const users = generateUsers(handle).users.map((user) => {
    if (user.isPlayer) return user;
    else {
      user.likelihoodOfCompeting = user.likelihoodOfCompeting / 10;
      return user;
    }
  });

  const division: ProblemDivision = 3;
  const numberOfMergedTicks = 50;
  const contest = generateContest(division, true, users);
  let nextEventIn: number;
  let contestUsersData: Array<ContestUserData>;

  it("generating contest produces initial value of contest", () => {
    nextEventIn = contest.nextEventIn;
    expect(contest.ticksSinceBeginning).toBe(0);
    expect(contest.finished).toBe(false);
    expect(contest.problems.length).toBe(6);
    expect(contest.problemScores.length).toBe(6);
    expect(contest.problemScoreDecrementsPerMinute.length).toBe(6);
    expect(contest.division).toBe(division);

    contestUsersData = contest.contestUsersData;
    assertProbabilisticCloseTo(contestUsersData.length, 230, 60);
    const contestPlayerData = contestUsersData[0];
    const contestNPCData = contestUsersData[1] as ContestNPCData;

    expect(contestPlayerData.blockingBreak).toBeNull();
    expect(contestPlayerData.nonBlockingBreaks).toMatchObject({
      A: null,
      B: null,
      C: null,
      D: null,
      E: null,
      F: null,
    });

    expect(contestPlayerData.handle).toBe(handle);
    expect(contestPlayerData.isPlayer).toBe(true);
    problemPlacements.forEach((placement) => {
      const problemSolveStatus =
        contestPlayerData.problemSolveStatuses[placement];
      expect(problemSolveStatus.phase).toBe("before-reading");
    });

    expect(contestNPCData.numberOfTimesSwitched).toMatchObject([
      0, 0, 0, 0, 0, 0,
    ]);
    expect(
      contestNPCData.remainingTicksToSwitchToAnotherProblem
    ).toBeGreaterThan(0);
  });

  let newContestUsersData: Array<ContestUserData>;

  ({ newContestUsersData, nextEventIn } = processTickOfContest(
    contest,
    numberOfMergedTicks,
    users,
    spyDispatch
  ));

  const contestAfterOneTick = { ...contest };
  contestAfterOneTick.ticksSinceBeginning += numberOfMergedTicks;
  contestAfterOneTick.contestUsersData = newContestUsersData;
  contestAfterOneTick.nextEventIn = nextEventIn;

  it("after one tick, contestants start reading one problem", () => {
    contestAfterOneTick.contestUsersData.forEach((contestUserData) => {
      const problemSolveStatuses = contestUserData.problemSolveStatuses;

      problemPlacements.forEach((placement) => {
        if (contestUserData.activeProblemPlacement === placement)
          expect(problemSolveStatuses[placement].phase === "during-reading");
        else expect(problemSolveStatuses[placement].phase === "before-reading");
      });
    });
  });

  it("after one tick, no events are dispatched", () => {
    expect(contestAfterOneTick.nextEventIn === contest.nextEventIn);
    expect(spyDispatch.notCalled);
  });

  const contestAfterNTicks = { ...contestAfterOneTick };

  for (let _ = 0; _ < CONTEST_LENGTH / numberOfMergedTicks - 1; _++) {
    ({ newContestUsersData, nextEventIn } = processTickOfContest(
      contestAfterNTicks,
      numberOfMergedTicks,
      users,
      spyDispatch
    ));

    contestAfterNTicks.ticksSinceBeginning += numberOfMergedTicks;
    contestAfterNTicks.contestUsersData = newContestUsersData;
    contestAfterNTicks.nextEventIn = nextEventIn;
  }

  let numberOfPassedPretests = 0;
  let numberOfSubmissionsNeededToPassPretests = 0;
  let numberOfTriedProblems = 0;
  let numberOfStartedReading = 0;

  it("at the end of contest, some problems are solved, some are unsolved", () => {
    contestAfterNTicks.contestUsersData.forEach((contestUserData) => {
      const problemSolveStatuses = contestUserData.problemSolveStatuses;

      problemPlacements.forEach((placement) => {
        const phase = problemSolveStatuses[placement].phase;
        const submissions = problemSolveStatuses[placement].submissions;
        assert.notOk(
          ["after-passing-systests", "after-failing-systests"].includes(phase)
        );

        if (phase === "after-passing-pretests") {
          numberOfPassedPretests++;
          numberOfSubmissionsNeededToPassPretests += submissions.length;
          numberOfTriedProblems++;
        } else if (submissions.length) {
          numberOfTriedProblems++;
        }

        if (phase !== "before-reading") numberOfStartedReading++;
      });
    });

    expect(numberOfPassedPretests).toBeLessThan(
      numberOfSubmissionsNeededToPassPretests
    );
    expect(numberOfPassedPretests).toBeLessThan(numberOfTriedProblems);
    expect(numberOfTriedProblems).toBeLessThan(numberOfStartedReading);
    assertProbabilisticCloseTo(
      numberOfPassedPretests,
      contestUsersData.length * 1.8,
      contestUsersData.length * 1
    );
  });

  it("a few events are sent to the screen", () => {
    assertProbabilisticCloseTo(spyDispatch.callCount, 10, 10);
  });
});
