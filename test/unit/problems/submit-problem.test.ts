import { afterEach, describe, assert, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import { submitProblem } from "../../../src/app/problems/submit-problem";
import type {
  ProblemSolveStatus,
  ProblemSolveStatusDuringSearchingForMistake,
} from "../../../src/app/problems/types";
import { USER_INITIAL_RATING } from "../../../src/app/users/constants";
import { generateUser } from "../../../src/app/users/load-users";
import { mockStore } from "../../mocks/mock-store";

describe("submitProblem function", () => {
  afterEach(() => {
    mockStore.events = [];
  });

  const ticksSinceBeginning = 10000;
  const dispatch = mockStore.mockDispatch;

  it("mostly accepts correct submissions", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let _ = 0; _ < 1000; _++) {
      const user = generateUser("player", USER_INITIAL_RATING, null, true);
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
    assert.closeTo(correctCount, 995, 5);
  });

  it("mostly rejects wrong submissions", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let i = 0; i < 1000; i++) {
      const user = generateUser("someHandle", USER_INITIAL_RATING, null, false);
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
    assert.closeTo(wrongCount, 990, 8);
  });

  it("returns reasonable increments if the submission is wrong, ", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let i = 0; i < 5000; i++) {
      const user = generateUser(
        "virgin",
        500,
        "United States Virgin Islands",
        false
      );
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

    assert.closeTo(
      wrongProblemSolveStatuses[3750].penPaperProgressIncrement.increment,
      1 / 700,
      1 / 7000
    );

    wrongProblemSolveStatuses.sort(
      (a, b) =>
        a.implementationProgressIncrement.increment -
        b.implementationProgressIncrement.increment
    );

    assert.closeTo(
      wrongProblemSolveStatuses[3750].implementationProgressIncrement.increment,
      1 / 1700,
      1 / 16000
    );
  });

  it("returns varied verdicts if the submission is wrong and Pretests passed if corrects", () => {
    const problemSolveStatusArray: Array<ProblemSolveStatus> = [];

    for (let i = 0; i < 1000; i++) {
      const user = generateUser("someHandle", USER_INITIAL_RATING, null, false);
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
    assert.closeTo(
      wrongVerdicts.filter((verdict) => verdict === "Wrong answer").length,
      580,
      50
    );
    assert.closeTo(
      wrongVerdicts.filter((verdict) => verdict === "Runtime error").length,
      160,
      25
    );
    assert.closeTo(
      wrongVerdicts.filter((verdict) => verdict === "Time limit exceeded")
        .length,
      190,
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
