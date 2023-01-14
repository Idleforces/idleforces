/* eslint-disable react/jsx-key */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  selectContest,
  updatePlayerActiveProblemPlacement,
} from "../../../../app/contest/contest-slice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import type {
  ProblemPlacement,
  ProblemTag,
} from "../../../../app/problems/types";
import { problemPlacements } from "../../../../app/problems/types";
import {
  computeProblemPlacementFromProblemPosition,
  computeProblemPositionFromProblemPlacement,
} from "../../../../app/problems/utils";
import { isSubmissionCorrect } from "../../../../app/problems/submit-problem";
import { computeAccepted } from "../../../../app/contest/contest-stats";
import { transposeArray } from "../../../../utils/utils";
import { DataTable } from "../../utils/datatable";
import { Link } from "react-router-dom";
import "./problems.css";
import { Events } from "../events/events";

export const Problems = () => {
  const dispatch = useAppDispatch();
  const contest = useAppSelector(selectContest);
  if (!contest) return <></>;

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

  const submissionsCorrectBackgroundColor = problemPlacements.map(
    (placement) => {
      if (!playerParticipating) return null;
      return contestUsersData[0].problemSolveStatuses[
        placement
      ].submissions.some((submission) => isSubmissionCorrect(submission))
        ? "d4edc9"
        : "ffe3e3";
    }
  );

  const accepted = computeAccepted(contestUsersData);

  let switchActiveProblemsButtons: Array<JSX.Element> = [];

  if (playerParticipating) {
    switchActiveProblemsButtons = problemPlacements.map((placement) => (
      <button
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

  const topRow: Array<JSX.Element> = [<>#</>, <>Tag</>, <></>, <></>];
  if (playerParticipating) topRow.push(<>Action</>);

  const dataTableContents: Array<Array<JSX.Element>> = [topRow].concat(
    transposeArray(
      [problemPlacements.map((placement) => <>{placement}</>)]
        .concat([
          visibleProblemTags.map((visibleProblemTag) => (
            <span>{visibleProblemTag}</span>
          )),
        ])
        .concat([
          submissionsCorrectBackgroundColor.map(
            (submissionCorrectBackgroundColor) => (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor:
                    submissionCorrectBackgroundColor ?? "inherit",
                }}
              ></div>
            )
          ),
        ])
        .concat([
          accepted.map((problemAccepted, problemPosition) => (
            <Link
              to={`/game/contest/status/${computeProblemPlacementFromProblemPosition(
                problemPosition
              )}`}
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
