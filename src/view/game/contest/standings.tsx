/* eslint-disable react/jsx-key */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  RECOMPUTE_RATINGS_EVERY_N_TICKS,
  USERS_NO_ON_STANDINGS_PAGE,
} from "../../../app/contest/constants";
import { selectContest } from "../../../app/contest/contest-slice";
import {
  computeContestUsersStatsSortedByRank,
  computeNewRatingsSlice,
} from "../../../app/contest/recalculate-ratings";
import type {
  ContestSlice,
  ContestUserData,
  ContestUserStats,
  RatingPoints,
} from "../../../app/contest/types";
import { useAppSelector } from "../../../app/hooks";
import { problemPlacements } from "../../../app/problems/types";
import { computeProblemPositionFromProblemPlacement } from "../../../app/problems/utils";
import { selectHandle } from "../../../app/save/save-slice";
import type { User } from "../../../app/users/types";
import { selectUsers } from "../../../app/users/users-slice";
import { convertSecondsToHHMM } from "../../../utils/time-format";
import { sum } from "../../../utils/utils";
import { DataTable } from "../utils/datatable";
import { Flag } from "../utils/flag";
import { RatingStyled } from "../utils/styled-rating";
import { StandingsStub } from "./standings-stub";
import "./standings.css";

const computeAccepted = (contestUsersStats: Array<ContestUserStats>) => {
  return contestUsersStats
    .map(
      (contestUserStats) =>
        contestUserStats.scores.map((score) =>
          score > 0 ? 1 : 0
        ) as Array<number>
    )
    .reduce((acceptedAccumulator, accepted) =>
      acceptedAccumulator.map(
        (numAcceptedAtIndex, index) => numAcceptedAtIndex + accepted[index]
      )
    );
};

const computeTried = (contestUsersStats: Array<ContestUserStats>) => {
  return contestUsersStats
    .map(
      (contestUserStats) =>
        contestUserStats.scores.map((score, index) =>
          score > 0 || contestUserStats.wrongSubmissionCounts[index] ? 1 : 0
        ) as Array<number>
    )
    .reduce((triedAccumulator, tried) =>
      triedAccumulator.map(
        (numTriedAtIndex, index) => numTriedAtIndex + tried[index]
      )
    );
};

const filterUsersWithAtLeastOneSubmission = (
  contestUsersStats: Array<ContestUserData>
) => {
  return contestUsersStats.filter((contestUserStats) =>
    problemPlacements.some(
      (placement) =>
        contestUserStats.problemSolveStatuses[placement].submissions.length
    )
  );
};

export const Standings = () => {
  const contest = useAppSelector(selectContest);
  const users = useAppSelector(selectUsers);
  const handle = useAppSelector(selectHandle);

  if (!contest || !users || handle === undefined)
    return <StandingsStub text="No contest found." />;

  const contestWithUsersWithASubmission = {
    ...contest,
    contestUsersData: filterUsersWithAtLeastOneSubmission(
      contest.contestUsersData
    ),
  };
  if (contestWithUsersWithASubmission.contestUsersData.length === 0)
    return <StandingsStub text="No submission has been made yet." />;

  return (
    <StandingsPage
      contest={contestWithUsersWithASubmission}
      users={users}
      handle={handle}
    />
  );
};

const StandingsPage = (props: {
  contest: Exclude<ContestSlice, null>;
  users: Array<User>;
  handle: string;
}) => {
  const { contest, users, handle } = props;

  const contestUsersStats = computeContestUsersStatsSortedByRank(
    contest.contestUsersData,
    users,
    contest.finished,
    contest.problemScores,
    contest.problemScoreDecrementsPerMinute
  );

  const handleIndex = contestUsersStats.findIndex(
    (userStats) => userStats.handle === handle
  );
  const preloadedPage =
    handleIndex === -1
      ? 1
      : Math.ceil(handleIndex / USERS_NO_ON_STANDINGS_PAGE);
  const [selectedPage, setSelectedPage] = useState(preloadedPage);
  const minIndex = (selectedPage - 1) * USERS_NO_ON_STANDINGS_PAGE;
  const maxIndex = selectedPage * USERS_NO_ON_STANDINGS_PAGE;

  /*
    Here, computing newRatings takes about 1.5 seconds on my machine.
    The following optimizes computation of newRatings as follows.
        - `ratingsRecomputedCount` is modified after every
          `RECOMPUTE_RATINGS_EVERY_N_TICKS` ticks in the post-render phase.
        - This in turn triggers recomputation of the memo of `newRatings`.
  */

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ticksSinceBeginning = contest.ticksSinceBeginning;
  const ticksSinceBeginningAtMount = useRef(ticksSinceBeginning);
  const [ticksSinceBeginningUpdatedDuringContest, setTicksSinceBeginningUpdatedDuringContest] = useState(0);
  if (!contest.finished && ticksSinceBeginningUpdatedDuringContest !== ticksSinceBeginning) setTicksSinceBeginningUpdatedDuringContest(ticksSinceBeginning);

  const ratingsBeforeContest = useMemo(
    () =>
      contestUsersStats.map((contestUserStats) => contestUserStats.oldRating),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ticksSinceBeginningUpdatedDuringContest]
  );

  const [ratingsRecomputedCount, setRatingsRecomputedCount] = useState(-1);
  const newRatings: Partial<RatingPoints> = useMemo(() => {
    if (ratingsRecomputedCount === -1) {
      const newRatingsPartial: Partial<RatingPoints> = {};
      contestUsersStats.forEach(
        (contestUserStats) =>
          (newRatingsPartial[contestUserStats.handle] = {
            rating: contestUserStats.oldRating,
            timestamp: 0, // will be ignored
          })
      );

      return newRatingsPartial;
    } else return computeNewRatingsSlice(contestUsersStats, minIndex, maxIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingsRecomputedCount]);

  useEffect(() => {
    setRatingsRecomputedCount(
      Math.floor(
        (ticksSinceBeginning - ticksSinceBeginningAtMount.current) /
          RECOMPUTE_RATINGS_EVERY_N_TICKS
      ) +
        2 * selectedPage
    );
  }, [ticksSinceBeginning, selectedPage]);

  const accepted = computeAccepted(contestUsersStats);
  const tried = computeTried(contestUsersStats);
  const displayedContestUserStats = contestUsersStats.slice(minIndex, maxIndex);

  const dataTableContents: Array<Array<JSX.Element>> = [
    [<>#</>, <>Who</>, <>=</>]
      .concat(
        problemPlacements.map((placement) => (
          <div key={placement} style={{}}>
            <div className="dark-blue">{placement}</div>
            <div>
              {
                contest.problemScores[
                  computeProblemPositionFromProblemPlacement(placement)
                ]
              }
            </div>
          </div>
        ))
      )
      .concat([<>Δ</>]),
  ]
    .concat(
      displayedContestUserStats.map((contestUserStats, index) => {
        const newRating = newRatings[contestUserStats.handle];
        const ratingDiff = newRating
          ? Math.round(newRating.rating - ratingsBeforeContest[minIndex + index])
          : 0;

        return [
          <>{contestUserStats.rank}</>,
          <div className="align-left">
            <Flag countryName={contestUserStats.country} />
            <RatingStyled
              stringToStyle={contestUserStats.handle}
              rating={contestUserStats.oldRating}
            />
          </div>,
          <>{Math.round(sum(contestUserStats.scores))}</>,
        ]
          .concat(
            problemPlacements.map((placement) => {
              const problemPosition =
                computeProblemPositionFromProblemPlacement(placement);

              return (
                <>
                  {contestUserStats.scores[problemPosition] ? (
                    <>
                      <div className="green bold">
                        {Math.round(contestUserStats.scores[problemPosition])}
                      </div>
                      <div className="gray">
                        {convertSecondsToHHMM(
                          contestUserStats.correctSubmissionTimestamps[
                            problemPosition
                          ] as number
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      className={
                        contestUserStats.failedAtSystests[problemPosition]
                          ? "red bold"
                          : "gray"
                      }
                    >
                      {contestUserStats.wrongSubmissionCounts[problemPosition]
                        ? `-${contestUserStats.wrongSubmissionCounts[problemPosition]}`
                        : ""}
                    </div>
                  )}
                </>
              );
            })
          )
          .concat([
            <div
              className={
                ratingDiff > 0 ? "green bold" : ratingDiff < 0 ? "red bold" : ""
              }
            >
              {ratingDiff > 0 ? `+${ratingDiff}` : ratingDiff}
            </div>,
          ]);
      })
    )
    .concat([
      [
        <></>,
        <>
          <div className="green align-left">Accepted</div>
          <div className="align-left">Tried</div>
        </>,
        <></>,
      ]
        .concat(
          problemPlacements.map((placement) => {
            const problemPosition =
              computeProblemPositionFromProblemPlacement(placement);

            return (
              <>
                <div className="green">{accepted[problemPosition]}</div>
                <div>{tried[problemPosition]}</div>
              </>
            );
          })
        )
        .concat([<></>]),
    ]);

  const classNames: Array<Array<string>> = [
    Array(4 + accepted.length)
      .fill(0)
      .map((_, index) => {
        const className = index === 1 ? "bold align-left" : ("bold" as string);
        return className;
      }),
  ].concat(
    Array(displayedContestUserStats.length + 1)
      .fill(0)
      .map((_) => Array<string>(4 + accepted.length).fill(""))
  );

  return (
    <div id="standings-page">
      <DataTable
        topText="Standings"
        containerBorderRadiusPx={5}
        contents={dataTableContents}
        classNames={classNames}
      />
      <div id="standings-page-links-container">
        {Array(Math.ceil(contestUsersStats.length / USERS_NO_ON_STANDINGS_PAGE))
          .fill(0)
          .map((_, index) => (
            <a
              onClick={(_e) => {
                setSelectedPage(index + 1);
                setRatingsRecomputedCount(-1);
              }}
              key={index}
            >
              {USERS_NO_ON_STANDINGS_PAGE * index + 1}-
              {Math.min(
                USERS_NO_ON_STANDINGS_PAGE * (index + 1),
                contestUsersStats.length
              )}
            </a>
          ))}
      </div>
    </div>
  );
};
