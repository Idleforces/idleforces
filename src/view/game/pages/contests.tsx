/* eslint-disable react/jsx-key */
import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { Dispatch, SetStateAction } from "react";
import {
  CONTEST_LENGTH,
  DIVISION_MERGE_TICKS_COUNT,
  MIN_USERS_SATISFYING_RATING_BOUND_TO_START_CONTEST,
  SIMULATED_CONTESTS_MERGE_TICKS_COUNT,
} from "../../../app/contest/constants";
import { startContest } from "../../../app/contest/contest-slice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
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
import { Link } from "react-router-dom";

const handleContestStart = (
  playerParticipating: boolean,
  rowIndex: number,
  dispatch: ThunkDispatch<RootState, void, AnyAction>,
  users: Array<User> | null,
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>
) => {
  dispatch(
    startContest({
      division: (4 - rowIndex) as ProblemDivision,
      playerParticipating,
      numberOfMergedTicks: playerParticipating
        ? DIVISION_MERGE_TICKS_COUNT[(4 - rowIndex) as ProblemDivision]
        : SIMULATED_CONTESTS_MERGE_TICKS_COUNT,
      users,
    })
  );
  dispatch(setEventsToEmptyArray(null));
  setContestTypeRunning({
    playerParticipating,
    numberOfMergedTicks: playerParticipating
      ? DIVISION_MERGE_TICKS_COUNT[(4 - rowIndex) as ProblemDivision]
      : SIMULATED_CONTESTS_MERGE_TICKS_COUNT,
  });
};

export const Contests = (props: {
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>;
  contestTypeRunning: ContestTypeRunning;
}) => {
  const contestTypeRunning = props.contestTypeRunning;
  const setContestTypeRunning = props.setContestTypeRunning;
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers) ?? [];
  const usersSatisfyingRatingBoundsCounts = (
    [4, 3, 2, 1] as Array<ProblemDivision>
  ).map((division) => filterUsersSatisfyingRatingBound(users, division).length);

  if (contestTypeRunning)
    return (
      <div id="contests-page" style={{ fontSize: "1.5rem" }}>
        <div>A contest is running.</div>
        <Link to="/game/contest/problems">Return to contest page.</Link>
      </div>
    );

  const computeStartContestFieldContent = (
    rowIndex: number,
    playerParticipating: boolean
  ): JSX.Element => {
    return usersSatisfyingRatingBoundsCounts[rowIndex] >=
      MIN_USERS_SATISFYING_RATING_BOUND_TO_START_CONTEST ? (
      <a
        className="dark-red-link"
        onClick={() => {
          handleContestStart(
            playerParticipating,
            rowIndex,
            dispatch,
            users,
            setContestTypeRunning
          );
        }}
      >
        {playerParticipating ? "Register" : "Simulate"}
      </a>
    ) : (
      <span style={{ color: "#222" }}>Not enough users can participate.</span>
    );
  };

  const dataTableContents: Array<Array<JSX.Element>> = [
    [<>Name</>, <>Cooldown</>, <>Length</>, <>Start</>, <>Simulate</>],
  ].concat(
    Array(4)
      .fill(0)
      .map((_, rowIndex) => [
        <>Idleforces Round (Div. {4 - rowIndex})</>,
        <></>,
        <>
          {convertSecondsToHHMM(
            CONTEST_LENGTH /
              DIVISION_MERGE_TICKS_COUNT[(4 - rowIndex) as ProblemDivision]
          )}
        </>,
        computeStartContestFieldContent(rowIndex, true),
        computeStartContestFieldContent(rowIndex, false),
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
