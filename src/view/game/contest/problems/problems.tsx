/* eslint-disable react/jsx-key */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  selectContest,
  updatePlayerActiveProblemPlacement,
} from "../../../../app/contest/contest-slice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import type {
  ProblemPlacement,
  ProblemSolveStatus,
  ProblemTag,
} from "../../../../app/problems/types";
import { problemPlacements } from "../../../../app/problems/types";
import {
  computeProblemPlacementFromProblemPosition,
  computeProblemPositionFromProblemPlacement,
} from "../../../../app/problems/utils";
import { didSubmissionPass } from "../../../../app/problems/submit-problem";
import { computeAccepted } from "../../../../app/contest/contest-stats";
import { transposeArray } from "../../../../utils/utils";
import { DataTable } from "../../utils/datatable";
import { Link } from "react-router-dom";
import "./problems.css";
import { Events } from "../events/events";
import { selectEvents } from "../../../../app/events/events-slice";
import {
  selectRemainingTimesToSolve,
  setContestSubmissionsFilterData,
} from "../../../../app/view/view-slice";
import { formatProblemSolvingPhase } from "../../utils/format-problem-solving-phase";

export const Problems = () => {
  const dispatch = useAppDispatch();
  const contest = useAppSelector(selectContest);
  const events = useAppSelector(selectEvents);
  const remainingTimesToSolve = useAppSelector(selectRemainingTimesToSolve);

  if (!contest || !events) return <></>;

  const contestUsersData = contest.contestUsersData;
  const playerParticipating = contestUsersData[0].isPlayer;
  const problems = contest.problems;
  const activeProblemPlacement = playerParticipating
    ? contestUsersData[0].activeProblemPlacement
    : null;

  const handleSwitchActiveProblem = (placement: ProblemPlacement) => {
    dispatch(
      updatePlayerActiveProblemPlacement(
        placement === activeProblemPlacement ? null : placement
      )
    );
  };

  let visibleProblemTags: Array<ProblemTag | null>;
  if (!playerParticipating)
    visibleProblemTags = problems.map((problem) => problem.tag);
  else {
    visibleProblemTags = problemPlacements.map((placement) => {
      const problemPosition =
        computeProblemPositionFromProblemPlacement(placement);
      const problemSolveStatus =
        contestUsersData[0].problemSolveStatuses[placement];

      const problemRead =
        problemSolveStatus.phase !== "before-reading" &&
        problemSolveStatus.phase !== "during-reading";

      return problemRead ? problems[problemPosition].tag : null;
    });
  }

  const accepted = computeAccepted(contestUsersData);
  let switchActiveProblemsButtons: Array<JSX.Element> = [];

  if (playerParticipating) {
    switchActiveProblemsButtons = problemPlacements.map((placement) => (
      <button
        type="button"
        onClick={(_e) => {
          handleSwitchActiveProblem(placement);
        }}
        tabIndex={0}
      >
        {placement === activeProblemPlacement
          ? "Stop solving problem"
          : "Solve problem"}
      </button>
    ));
  }

  const topRow: Array<JSX.Element> = [<>#</>, <>Tag</>];
  if (playerParticipating) topRow.push(<>Phase</>);
  topRow.push(<># Solves</>);
  if (playerParticipating) topRow.push(<>Action</>);

  let playerProblemSolveStatuses: Array<ProblemSolveStatus | null> =
    problemPlacements.map((_placement) => null);
  if (playerParticipating)
    playerProblemSolveStatuses = problemPlacements.map(
      (placement) => contestUsersData[0].problemSolveStatuses[placement]
    );

  const dataTableContents: Array<Array<JSX.Element>> = [topRow].concat(
    transposeArray(
      [problemPlacements.map((placement) => <>{placement}</>)]
        .concat([
          visibleProblemTags.map((visibleProblemTag) => (
            <span>{visibleProblemTag}</span>
          )),
        ])
        .concat(
          playerParticipating
            ? [
                playerProblemSolveStatuses.map(
                  (playerProblemSolveStatus, index) => {
                    if (!playerProblemSolveStatus) return <></>;

                    const submissionCorrectBackgroundColor =
                      playerProblemSolveStatus.submissions.some((submission) =>
                        didSubmissionPass(submission)
                      )
                        ? "#d4edc9"
                        : playerProblemSolveStatus.submissions.length
                        ? "#ffe3e3"
                        : "inherit";

                    return (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: submissionCorrectBackgroundColor,
                          color: "#111",
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatProblemSolvingPhase(
                          playerProblemSolveStatus.phase
                        )}
                        {remainingTimesToSolve[index]}
                      </div>
                    );
                  }
                ),
              ]
            : []
        )
        .concat([
          accepted.map((problemAccepted, problemPosition) => (
            <Link
              to="/game/contest/status"
              onClick={(_e) =>
                dispatch(
                  setContestSubmissionsFilterData({
                    problemPlacement:
                      computeProblemPlacementFromProblemPosition(
                        problemPosition
                      ),
                    verdict: null,
                    handle: "",
                  })
                )
              }
            >
              <FontAwesomeIcon icon={["fas", "user"]} />x{problemAccepted}
            </Link>
          )),
        ])
        .concat(playerParticipating ? [switchActiveProblemsButtons] : [])
    )
  );

  return (
    <div id="problems-page-container">
      <DataTable
        contents={dataTableContents}
        topText="Problems"
        containerBorderRadiusPx={5}
      />
      {playerParticipating ? <Events heightInRem={30} /> : <></>}
    </div>
  );
};
