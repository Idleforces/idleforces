/* eslint-disable react/jsx-key */
import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { Dispatch, SetStateAction } from "react";
import {
  CONTEST_LENGTH,
  DIVISION_MERGE_TICKS_COUNT,
  MIN_USERS_SATISFYING_RATING_BOUND_TO_START_CONTEST,
} from "../../../app/contest/constants";
import { startContest } from "../../../app/contest/contest-slice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { problemDivisions } from "../../../app/problems/types";
import type { ProblemDivision } from "../../../app/problems/types";
import type { RootState } from "../../../app/store";
import type { User } from "../../../app/users/types";
import { selectUsers } from "../../../app/users/users-slice";
import { convertSecondsToHHMM } from "../../../utils/time-format";
import type { ContestTypeRunning } from "../types";
import { DataTable } from "../utils/datatable";
import "./contests.css";
import "../utils/datatable.css";
import { setEventsToEmptyArray } from "../../../app/events/events-slice";
import { filterUsersSatisfyingRatingBound } from "../../../app/contest/rating-bounds";
import { Link, useNavigate } from "react-router-dom";
import { setInContest } from "../../../app/save/save-slice";
import { declareRecordByInitializer } from "../../../utils/utils";
import { selectArchivedContests } from "../../../app/contest-archive/contest-archive-slice";

const handleContestStart = (
  playerParticipating: boolean,
  division: ProblemDivision,
  name: string,
  dispatch: ThunkDispatch<RootState, void, AnyAction>,
  users: Array<User> | null,
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>
) => {
  dispatch(
    startContest({
      division,
      playerParticipating,
      users,
      name,
    })
  );
  dispatch(setEventsToEmptyArray(null));

  dispatch(setInContest(true));
  setContestTypeRunning({
    playerParticipating,
  });
};

export const Contests = (props: {
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>;
  contestTypeRunning: ContestTypeRunning;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
}) => {
  const contestTypeRunning = props.contestTypeRunning;
  const setContestTypeRunning = props.setContestTypeRunning;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const users = useAppSelector(selectUsers) ?? [];
  const contestArchive = useAppSelector(selectArchivedContests);

  const reverseProblemDivisions = [...problemDivisions].reverse();
  const usersSatisfyingRatingBoundsCounts: Record<ProblemDivision, number> =
    declareRecordByInitializer(
      reverseProblemDivisions,
      (division) => filterUsersSatisfyingRatingBound(users, division).length
    );

  const contestNames: Record<ProblemDivision, string> =
    declareRecordByInitializer(
      reverseProblemDivisions,
      (division) =>
        `Idleforces round #${contestArchive.length + 1} (Div. ${division})`
    );

  if (contestTypeRunning)
    return (
      <div id="contests-page" style={{ fontSize: "1.5rem" }}>
        <div>A contest is running.</div>
        <Link to="/game/contest/problems">Return to contest page.</Link>
      </div>
    );

  const computeStartContestFieldContent = (
    division: ProblemDivision,
    playerParticipating: boolean
  ): JSX.Element => {
    return usersSatisfyingRatingBoundsCounts[division] >=
      MIN_USERS_SATISFYING_RATING_BOUND_TO_START_CONTEST ? (
      <a
        className="dark-red-link"
        onClick={() => {
          handleContestStart(
            playerParticipating,
            division,
            contestNames[division],
            dispatch,
            users,
            setContestTypeRunning
          );

          if (!playerParticipating) setNoPlayerContestSimSpeed(0);

          navigate(
            playerParticipating
              ? "/game/contest/problems"
              : "/game/contest/standings"
          );
        }}
      >
        {playerParticipating ? "Register" : "Simulate"}
      </a>
    ) : (
      <span style={{ color: "gray" }}>Not enough users can participate.</span>
    );
  };

  const dataTableContents: Array<Array<JSX.Element>> = [
    [<>Name</>, <>Cooldown</>, <>Length</>, <>Start</>, <>Simulate</>],
  ].concat(
    reverseProblemDivisions.map((division) => [
      <>{contestNames[division]}</>,
      <></>,
      <>
        {convertSecondsToHHMM(
          CONTEST_LENGTH / DIVISION_MERGE_TICKS_COUNT[division]
        )}
      </>,
      computeStartContestFieldContent(division, true),
      computeStartContestFieldContent(division, false),
    ])
  );

  const classNames = Array(5)
    .fill(0)
    .map((_, index) =>
      index === 0
        ? ["bold", "bold", "bold", "bold", "bold"]
        : ["", "", "", "", ""]
    );

  return (
    <div id="contests-page">
      <DataTable
        contents={dataTableContents}
        classNames={classNames}
        containerBorderRadiusPx={6}
        topText={"Current or upcoming contests"}
      />
    </div>
  );
};
