/* eslint-disable react/jsx-key */
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  RECOMPUTE_RATINGS_EVERY_N_TICKS,
  USERS_NO_ON_STANDINGS_PAGE,
} from "../../../constants";
import { selectContest } from "../../../../app/contest/contest-slice";
import {
  computeAccepted,
  computeContestUsersStatsSortedByRank,
  computeTried,
} from "../../../../app/contest/contest-stats";
import {
  computeNewRatings,
  computeRanksConsideringTies,
  filterUsersWithAtLeastOneSubmission,
} from "../../../../app/contest/recalculate-ratings";
import type {
  ContestSlice,
  ContestUserStats,
  RatingPoints,
} from "../../../../app/contest/types";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { problemPlacements } from "../../../../app/problems/types";
import { computeProblemPositionFromProblemPlacement } from "../../../../app/problems/utils";
import { selectHandle } from "../../../../app/save/save-slice";
import type { User } from "../../../../app/users/types";
import { selectUsers } from "../../../../app/users/users-slice";
import { convertSecondsToHHMM } from "../../../../utils/time-format";
import { sum } from "../../../../utils/utils";
import { DataTable } from "../../utils/datatable";
import { Flag } from "../../utils/flag";
import { RankingPageLinks } from "../../utils/ranking-page-links";
import { RatingStyled } from "../../utils/styled-rating";
import { StandingsStub } from "./standings-stub";
import "./standings.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import { selectFriends } from "../../../../app/friends/friends-slice";
import {
  selectRatingRecomputeData,
  setRatingRecomputeData,
} from "../../../../app/view/view-slice";
import { FormattedDiff } from "../../utils/formatted-diff";

export type RatingRecomputeData =
  | {
      placeholder: false;
      selectedPage: number;
      onlyFriends: boolean;
      finished: boolean;
      numberOfTimesRecomputedByContestProgress: number;
    }
  | {
      placeholder: true;
    };

const computeNumberOfTimesRecomputedByContestProgress = (
  ticksSinceBeginning: number,
  ticksSinceBeginningAtMount: MutableRefObject<number>
) => {
  return Math.floor(
    (ticksSinceBeginning - ticksSinceBeginningAtMount.current) /
      RECOMPUTE_RATINGS_EVERY_N_TICKS
  );
};

export const Standings = () => {
  const contest = useAppSelector(selectContest);
  const users = useAppSelector(selectUsers);
  const handle = useAppSelector(selectHandle);
  const location = useLocation();
  const onlyFriends = location.pathname.includes("friends");

  if (!contest || !users || handle === undefined)
    return <StandingsStub text="No contest found." />;

  const contestWithUsersWithASubmission = {
    ...contest,
    contestUsersData: filterUsersWithAtLeastOneSubmission(
      contest.contestUsersData
    ),
  };

  if (contestWithUsersWithASubmission.contestUsersData.length === 0)
    return (
      <StandingsStub
        text={
          onlyFriends
            ? "None of you or your friends has made a submission yet."
            : "No submission has been made yet."
        }
      />
    );

  return (
    <StandingsPage
      contest={contestWithUsersWithASubmission}
      users={users}
      handle={handle}
      onlyFriends={onlyFriends}
    />
  );
};

const StandingsPage = (props: {
  contest: Exclude<ContestSlice, null>;
  users: Array<User>;
  handle: string;
  onlyFriends: boolean;
}) => {
  const { contest, users, handle, onlyFriends } = props;

  const finished = contest.finished;
  const friends = useAppSelector(selectFriends);
  const ratingRecomputeData = useAppSelector(selectRatingRecomputeData);

  const dispatch = useAppDispatch();

  const contestUsersStats = computeContestUsersStatsSortedByRank(
    contest.contestUsersData,
    users,
    finished,
    finished,
    contest.problemScores,
    contest.problemScoreDecrementsPerMinute
  );

  let friendsContestUsersStats: Array<
    ContestUserStats & { globalRank?: number }
  > = contestUsersStats;

  if (onlyFriends) {
    friendsContestUsersStats = friendsContestUsersStats
      .filter(
        (contestUserStats) =>
          friends.includes(contestUserStats.handle) ||
          contestUserStats.handle === handle
      )
      .map((contestUsersStats) => {
        return {
          ...contestUsersStats,
          globalRank: contestUsersStats.rank,
        };
      });

    const ranks = computeRanksConsideringTies(
      friendsContestUsersStats.map((contestUserStats) =>
        Math.round(sum(contestUserStats.scores))
      )
    );

    friendsContestUsersStats.forEach(
      (contestUserStats, index) => (contestUserStats.rank = ranks[index])
    );
  }

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

  const displayedContestUsersStats = friendsContestUsersStats.slice(
    minIndex,
    maxIndex
  );

  /*
    Here, computing newRatings takes about 1.5 seconds on my machine.
    The following optimizes computation of newRatings as follows.
        - `ratingRecomputeData` is modified after every
          `RECOMPUTE_RATINGS_EVERY_N_TICKS` ticks in the post-render phase.
        - This in turn triggers recomputation of the memo of `newRatings`.
  */
  const oldRatings = displayedContestUsersStats.map(
    (contestUserStats) => contestUserStats.oldRating
  );

  const ticksSinceBeginning = contest.ticksSinceBeginning;
  const ticksSinceBeginningAtMount = useRef(ticksSinceBeginning);

  const newRatings: Partial<RatingPoints> = useMemo(() => {
    if (ratingRecomputeData.placeholder) {
      const newRatingsPartial: Partial<RatingPoints> = {};
      contestUsersStats.forEach(
        (contestUserStats) =>
          (newRatingsPartial[contestUserStats.handle] = {
            rating: contestUserStats.oldRating,
            contestName: null, // will be ignored
          })
      );

      return newRatingsPartial;
    } else if (finished) {
      const newRatingsPartial: Partial<RatingPoints> = {};
      users.forEach((user) => {
        if (user.ratingHistory.slice(-1)[0].contestName === contest.name) {
          newRatingsPartial[user.handle] = {
            rating: user.ratingHistory.slice(-1)[0].rating,
            contestName: contest.name,
          };
        }
      });

      return newRatingsPartial;
    } else
      return computeNewRatings(
        contestUsersStats,
        contest.name,
        displayedContestUsersStats.map(
          (contestUserStats) => contestUserStats.handle
        )
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingRecomputeData, finished]);

  useEffect(() => {
    const newRatingRecomputeData: RatingRecomputeData = {
      numberOfTimesRecomputedByContestProgress:
        computeNumberOfTimesRecomputedByContestProgress(
          ticksSinceBeginning,
          ticksSinceBeginningAtMount
        ),
      selectedPage,
      onlyFriends,
      placeholder: false,
      finished,
    };

    if (
      JSON.stringify(newRatingRecomputeData) !==
      JSON.stringify(ratingRecomputeData)
    )
      dispatch(setRatingRecomputeData(newRatingRecomputeData));
  }, [
    ticksSinceBeginning,
    selectedPage,
    onlyFriends,
    finished,
    dispatch,
    ratingRecomputeData,
  ]);

  const accepted = computeAccepted(contest.contestUsersData);
  const tried = computeTried(contest.contestUsersData);

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
      displayedContestUsersStats.map((contestUserStats, index) => {
        const newRating = newRatings[contestUserStats.handle];
        const ratingDiff = newRating
          ? Math.round(newRating.rating - oldRatings[index])
          : 0;

        return [
          <>
            {onlyFriends && contestUserStats.globalRank !== undefined
              ? `${contestUserStats.rank} (${contestUserStats.globalRank})`
              : contestUserStats.rank}
          </>,
          <div className="align-left">
            <Flag countryName={contestUserStats.country} />
            <Link to={`/game/profile/${contestUserStats.handle}`}>
              <RatingStyled
                stringToStyle={contestUserStats.handle}
                rating={
                  contest.finished && newRating
                    ? newRating.rating
                    : contestUserStats.oldRating
                }
              />
            </Link>
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
          .concat([<FormattedDiff diff={ratingDiff} />]);
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
    Array(displayedContestUsersStats.length + 1)
      .fill(0)
      .map((_) => Array<string>(4 + accepted.length).fill(""))
  );

  return (
    <div id="standings-page">
      <DataTable
        topText={
          location.pathname.startsWith("/game/contest/standings/friends")
            ? "Friends standings"
            : "Standings"
        }
        containerBorderRadiusPx={5}
        contents={dataTableContents}
        classNames={classNames}
      />
      <RankingPageLinks
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        additionalPayloadAction={{
          action: setRatingRecomputeData,
          param: {
            placeholder: true,
          },
        }}
        dataLength={friendsContestUsersStats.length}
        dataOnOnePage={USERS_NO_ON_STANDINGS_PAGE}
      />
    </div>
  );
};
