/* eslint-disable react/jsx-key */
import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
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
import {
  convertSecondsToHHMM,
  convertSecondsToHHMMSS,
} from "../../../utils/time-format";
import { DataTable } from "../utils/datatable";
import "./contests.css";
import "../utils/datatable.css";
import { setEventsToEmptyArray } from "../../../app/events/events-slice";
import {
  filterUsersSatisfyingRatingBound,
  isWithinRatingBound,
} from "../../../app/contest/rating-bounds";
import { Link, useNavigate } from "react-router-dom";
import { selectActivity, setActivity } from "../../../app/save/save-slice";
import { declareRecordByInitializer } from "../../../utils/utils";
import { selectArchivedContests } from "../../../app/contest-archive/contest-archive-slice";
import { DIVISION_COOLDOWNS } from "../../../app/contest-archive/constants";
import { cloneDeep } from "lodash";
import type { ContestArchiveSlice } from "../../../app/contest-archive/types";
import {
  selectSecondsSincePageLoad,
  selectTimestampAtPageLoad,
  setNoPlayerContestSimSpeed,
} from "../../../app/view/view-slice";

export const computeContestCooldownSecondsRemaining = (
  division: ProblemDivision,
  contestArchive: ContestArchiveSlice,
  timestampAtPageLoad: number,
  secondsSincePageLoad: number
) => {
  const lastDivisionTimestamp =
    cloneDeep(contestArchive)
      .reverse()
      .find((contest) => contest.division === division)?.timestamp ?? null;

  const currentTimestamp =
    timestampAtPageLoad + 1000 * secondsSincePageLoad;

  const secondsRemaining =
    lastDivisionTimestamp !== null
      ? (lastDivisionTimestamp +
          DIVISION_COOLDOWNS[division] -
          currentTimestamp) /
        1000
      : 0;

  return secondsRemaining;
};

const handleContestStart = (
  playerParticipating: boolean,
  division: ProblemDivision,
  name: string,
  dispatch: ThunkDispatch<RootState, void, AnyAction>,
  users: Array<User> | null
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

  dispatch(
    setActivity(
      playerParticipating ? "contest-participation" : "contest-simulation"
    )
  );
};

export const Contests = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const secondsSincePageLoad = useAppSelector(selectSecondsSincePageLoad);
  const timestampAtPageLoad = useAppSelector(selectTimestampAtPageLoad);
  const users = useAppSelector(selectUsers) ?? [];
  const contestArchive = useAppSelector(selectArchivedContests);
  const activity = useAppSelector(selectActivity);

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

  if (activity === "contest-participation" || activity === "contest-simulation")
    return (
      <div id="contests-page" style={{ fontSize: "1.5rem" }}>
        <div>A contest is running.</div>
        <Link to="/game/contest/problems">Return to contest page.</Link>
      </div>
    );

  const computeStartContestFieldContent = (
    division: ProblemDivision,
    playerParticipating: boolean,
    secondsRemaining: number
  ): JSX.Element => {
    if (activity) {
      return (
        <span style={{ color: "gray" }}>
          Please finish your activity first.
        </span>
      );
    }

    if (
      playerParticipating &&
      !isWithinRatingBound(users[0].ratingHistory.slice(-1)[0].rating, division)
    )
      return (
        <span style={{ color: "gray" }}>
          You cannot register due to your rating.
        </span>
      );

    if (
      usersSatisfyingRatingBoundsCounts[division] <=
      MIN_USERS_SATISFYING_RATING_BOUND_TO_START_CONTEST
    )
      return (
        <span style={{ color: "gray" }}>Not enough users can participate.</span>
      );

    if (secondsRemaining > 0) {
      return (
        <span style={{ color: "gray" }}>
          {convertSecondsToHHMMSS(secondsRemaining)}
        </span>
      );
    }

    return (
      <a
        className="dark-red-link"
        tabIndex={0}
        onClick={() => {
          handleContestStart(
            playerParticipating,
            division,
            contestNames[division],
            dispatch,
            users
          );

          if (!playerParticipating) dispatch(setNoPlayerContestSimSpeed(0));

          navigate(
            playerParticipating
              ? "/game/contest/problems"
              : "/game/contest/standings"
          );
        }}
      >
        {playerParticipating ? "Register" : "Simulate"}
      </a>
    );
  };

  const dataTableContents: Array<Array<JSX.Element>> = [
    [<>Name</>, <>Length</>, <>Start</>, <>Simulate</>],
  ].concat(
    reverseProblemDivisions.map((division) => {
      const secondsRemaining = computeContestCooldownSecondsRemaining(
        division,
        contestArchive,
        timestampAtPageLoad,
        secondsSincePageLoad
      );

      return [
        <>{contestNames[division]}</>,
        <>
          {convertSecondsToHHMM(
            CONTEST_LENGTH / DIVISION_MERGE_TICKS_COUNT[division]
          )}
        </>,
        computeStartContestFieldContent(division, true, secondsRemaining),
        computeStartContestFieldContent(division, false, secondsRemaining),
      ];
    })
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
