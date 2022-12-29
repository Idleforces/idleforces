/* eslint-disable react/jsx-key */
import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { Dispatch, SetStateAction } from "react";
import {
  CONTEST_LENGTH,
  DIVISION_MERGE_TICKS_COUNT,
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

const handleContestStart = (
  playerParticipating: boolean,
  index: number,
  dispatch: ThunkDispatch<RootState, void, AnyAction>,
  users: Array<User> | null,
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>
) => {
  dispatch(
    startContest({
      division: (4 - index) as ProblemDivision,
      playerParticipating,
      numberOfMergedTicks:
        DIVISION_MERGE_TICKS_COUNT[(4 - index) as ProblemDivision],
      users,
    })
  );

  setContestTypeRunning({
    playerParticipating,
    numberOfMergedTicks:
      DIVISION_MERGE_TICKS_COUNT[(4 - index) as ProblemDivision],
  });
};

export const Contests = (props: {
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>;
  contestTypeRunning: ContestTypeRunning;
}) => {
  const contestTypeRunning = props.contestTypeRunning;
  const setContestTypeRunning = props.setContestTypeRunning;
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  if (contestTypeRunning)
    return (
      <div id="contests-page" style={{ fontSize: "1.5rem" }}>
        <div>A contest is running.</div>
        <a href="/game/contest/dashboard">Return to contest page.</a>
      </div>
    );

  const dataTableContents: Array<Array<JSX.Element>> = [
    [<>Name</>, <>Cooldown</>, <>Length</>, <>Start</>, <>Simulate</>],
  ].concat(
    Array(4)
      .fill(0)
      .map((_, index) => [
        <>Idleforces Round (Div. {4 - index})</>,
        <></>,
        <>
          {convertSecondsToHHMM(
            CONTEST_LENGTH /
              DIVISION_MERGE_TICKS_COUNT[(4 - index) as ProblemDivision]
          )}
        </>,
        <a
        className="dark-red-link"
          onClick={() => {
            handleContestStart(
              true,
              index,
              dispatch,
              users,
              setContestTypeRunning
            );
          }}
        >
          Enter
        </a>,
        <a
          className="dark-red-link"
          onClick={() => {
            handleContestStart(
              false,
              index,
              dispatch,
              users,
              setContestTypeRunning
            );
          }}
        >
          Simulate
        </a>,
      ])
  );

  const extraClassNames = Array(5)
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
        extraClassNames={extraClassNames}
        containerBorderRadiusPx={6}
        topText={"Current or upcoming contests"}
      />
    </div>
  );
};
