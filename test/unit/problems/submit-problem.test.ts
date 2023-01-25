import { afterEach, describe, assert, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import { submitProblem } from "../../../src/app/problems/submit-problem";
import type {
  ProblemSolveStatus,
  ProblemSolveStatusDuringSearchingForMistake,
} from "../../../src/app/problems/types";
import { USER_INITIAL_RATING } from "../../../src/app/users/constants";
import { generateNPC, generatePlayer } from "../../../src/app/users/load-users";
import { mockStore } from "../../mocks/mock-store";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("submitProblem function", () => {
  afterEach(() => {
    mockStore.events = [];
  });

  const ticksSinceBeginning = 10000;
  const dispatch = mockStore.mockDispatch;

  it("mostly accepts correct submissions", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let _ = 0; _ < 1000; _++) {
      const user = generatePlayer("player", USER_INITIAL_RATING, null);
      const problem = generateProblem(2, "C");
      problemSolveStatusArray.push(
        submitProblem(
          user,
          problem,
          [],
          true,
          true,
          ticksSinceBeginning,
          dispatch
        )
      );
    }

    const correctProblemSolveStatusArray = problemSolveStatusArray.filter(
      (problemSolveStatus) =>
        problemSolveStatus.phase === "after-passing-pretests"
    );

    const correctCount = correctProblemSolveStatusArray.length;
    assertProbabilisticCloseTo(correctCount, 995, 5);
  });

  it("mostly rejects wrong submissions", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let i = 0; i < 1000; i++) {
      const user = generateNPC("someHandle", USER_INITIAL_RATING, null);
      const problem = generateProblem(3, "D");
      problemSolveStatusArray.push(
        submitProblem(
          user,
          problem,
          [],
          i % 2 > 0,
          i % 2 === 0,
          ticksSinceBeginning,
          dispatch
        )
      );
    }

    const wrongProblemSolveStatusArray = problemSolveStatusArray.filter(
      (problemSolveStatus) =>
        problemSolveStatus.phase === "during-searching-for-mistake"
    );

    const wrongCount = wrongProblemSolveStatusArray.length;
    assertProbabilisticCloseTo(wrongCount, 950, 25);
  });

  it("returns reasonable increments if the submission is wrong, ", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let i = 0; i < 5000; i++) {
      const user = generateNPC("virgin", 500, "United States Virgin Islands");
      const problem = generateProblem(4, "C");
      problemSolveStatusArray.push(
        submitProblem(
          user,
          problem,
          [],
          i % 2 > 0,
          i % 2 === 0,
          ticksSinceBeginning,
          dispatch
        )
      );
    }

    const wrongProblemSolveStatuses = problemSolveStatusArray.filter(
      (problemSolveStatus) =>
        problemSolveStatus.phase === "during-searching-for-mistake"
    ) as Array<ProblemSolveStatusDuringSearchingForMistake>;

    wrongProblemSolveStatuses.sort(
      (a, b) =>
        a.penPaperProgressIncrement.increment -
        b.penPaperProgressIncrement.increment
    );

    assertProbabilisticCloseTo(
      wrongProblemSolveStatuses[3750].penPaperProgressIncrement.increment,
      1 / 290,
      1 / 2000
    );

    wrongProblemSolveStatuses.sort(
      (a, b) =>
        a.implementationProgressIncrement.increment -
        b.implementationProgressIncrement.increment
    );

    assertProbabilisticCloseTo(
      wrongProblemSolveStatuses[3750].implementationProgressIncrement.increment,
      1 / 660,
      1 / 5000
    );
  });

  it("returns varied verdicts if the submission is wrong and Pretests passed if corrects", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let i = 0; i < 1000; i++) {
      const user = generateNPC("someHandle", USER_INITIAL_RATING, null);
      const problem = generateProblem(3, "D");
      problemSolveStatusArray.push(
        submitProblem(
          user,
          problem,
          [],
          i % 2 > 0,
          i % 2 === 0,
          ticksSinceBeginning,
          dispatch
        )
      );
    }

    const correctProblemSolveStatusArray = problemSolveStatusArray.filter(
      (problemSolveStatus) =>
        problemSolveStatus.phase === "after-passing-pretests"
    );

    const wrongProblemSolveStatusArray = problemSolveStatusArray.filter(
      (problemSolveStatus) =>
        problemSolveStatus.phase === "during-searching-for-mistake"
    ) as Array<ProblemSolveStatusDuringSearchingForMistake>;

    const wrongVerdicts = wrongProblemSolveStatusArray.map(
      (wrongProblemSolveStatus) =>
        wrongProblemSolveStatus.submissions.slice(-1)[0].verdict
    );

    assert.equal(
      wrongVerdicts.filter((verdict) => verdict === "Pretests passed").length,
      0
    );
    assertProbabilisticCloseTo(
      wrongVerdicts.filter((verdict) => verdict === "Wrong answer on pretests")
        .length,
      590,
      50
    );
    assertProbabilisticCloseTo(
      wrongVerdicts.filter((verdict) => verdict === "Runtime error on pretests")
        .length,
      150,
      30
    );
    assertProbabilisticCloseTo(
      wrongVerdicts.filter(
        (verdict) => verdict === "Time limit exceeded on pretests"
      ).length,
      180,
      30
    );

    assert.deepEqual(
      correctProblemSolveStatusArray.filter(
        (correctProblemSolveStatus) =>
          correctProblemSolveStatus.submissions.slice(-1)[0].verdict ===
          "Pretests passed"
      ),
      correctProblemSolveStatusArray
    );
  });
});
