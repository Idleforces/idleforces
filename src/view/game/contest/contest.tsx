import { reverse } from "lodash";
import { Outlet } from "react-router";
import { selectContest } from "../../../app/contest/contest-slice";
import { selectEvents } from "../../../app/events/events-slice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { problemPlacements } from "../../../app/problems/types";
import type { ProblemSolveStatus } from "../../../app/problems/types";
import {
  setContestSubmissionsFilterData,
  setRatingRecomputeData,
  setRemainingTimeToSolveByIndex,
} from "../../../app/view/view-slice";
import { PROGRESS_BAR_DEFAULT_NOISE_STDEV } from "../../constants";
import { SubNavBar } from "../navbars/sub-navbar";
import { NoisyProgressBar } from "../utils/noisy-progress-bar";
import "./contest.css";
import React, { useEffect } from "react";

export const Contest = () => {
  const events = useAppSelector(selectEvents);
  const contest = useAppSelector(selectContest);

  const dispatch = useAppDispatch();

  const contestUsersData = contest?.contestUsersData;
  const playerParticipating = contestUsersData
    ? contestUsersData[0].isPlayer
    : false;

  let playerProblemSolveStatuses: Array<ProblemSolveStatus | null> =
    problemPlacements.map((_placement) => null);

  playerProblemSolveStatuses = problemPlacements.map((placement) =>
    contestUsersData
      ? contestUsersData[0].problemSolveStatuses[placement]
      : null
  );

  useEffect(() => {
    if (playerParticipating && contest && events) {
      playerProblemSolveStatuses.map((playerProblemSolveStatus, index) => {
        if (
          !playerProblemSolveStatus ||
          (playerProblemSolveStatus.phase !== "during-implementing" &&
            playerProblemSolveStatus.phase !== "during-reading")
        ) {
          dispatch(
            setRemainingTimeToSolveByIndex({
              remainingTime: "",
              index,
            })
          );
        }
      });
    }
  }, [
    contest,
    events,
    playerParticipating,
    playerProblemSolveStatuses,
    dispatch,
  ]);

  if (!contest || !events) return <></>;

  return (
    <>
      {playerParticipating ? (
        playerProblemSolveStatuses.map((playerProblemSolveStatus, index) => {
          if (!playerProblemSolveStatus) return <></>;
          if (
            playerProblemSolveStatus.phase === "during-implementing" ||
            playerProblemSolveStatus.phase === "during-reading"
          ) {
            return (
              <React.Fragment key={index}>
                <NoisyProgressBar
                  noiseStdev={PROGRESS_BAR_DEFAULT_NOISE_STDEV}
                  progress={playerProblemSolveStatus.progress}
                  increment={playerProblemSolveStatus.increment}
                  valMutatedAtUpdates={
                    reverse([...events]).find(
                      (event) =>
                        event.problemPlacement === problemPlacements[index]
                    )?.ticksSinceBeginning
                  }
                  index={index}
                />
              </React.Fragment>
            );
          } else {
            return <React.Fragment key={index}></React.Fragment>;
          }
        })
      ) : (
        <></>
      )}
      <SubNavBar
        baseURL="/game/contest/"
        pages={[
          "problems",
          "standings",
          "friends standings",
          "my submissions",
          "status",
        ]}
        setRatingRecomputeData={setRatingRecomputeData}
        setContestSubmissionsFilterData={setContestSubmissionsFilterData}
      />
      <main id="contest-main">
        <Outlet />
      </main>
    </>
  );
};
