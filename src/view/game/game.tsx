import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectUsersWithTimeOfSnapshot,
  setUsers,
  updateRatings,
} from "../../app/users/users-slice";
import type { UsersSlice } from "../../app/users/users-slice";
import { sleep } from "../../utils/utils";
import type { ContestTypeRunning } from "./types";
import { Outlet } from "react-router-dom";
import { NavBar } from "./navbar";
import { selectSaveData } from "../../app/save/save-slice";
import {
  addBreaks,
  incrementTicksSinceBeginning,
  selectContest,
  setContestFinished,
  setNextEventIn,
  updateContestUserData,
} from "../../app/contest/contest-slice";
import { selectEvents } from "../../app/events/events-slice";
import { CONTEST_LENGTH } from "../../app/contest/constants";
import { processTickOfContest } from "../../app/contest/process-tick";
import { saveGameData } from "../persist-data";
import { loadOrGenerateUsers } from "../../app/users/load-users";
import { processSystests } from "../../app/contest/process-systests";
import { recalculateRatings } from "../../app/contest/recalculate-ratings";

export const Game = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
  contestTypeRunning: ContestTypeRunning;
  noPlayerContestSimSpeed: number;
}) => {
  const contestTypeRunning = props.contestTypeRunning;
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const leaveGame = props.leaveGameRef.current;

  const gameLoadTimestamp = useMemo(() => Date.now(), []);
  const [ticksPassedSinceGameLoad, setTicksPassedSinceGameLoad] = useState(0);
  const [gameSaving, setGameSaving] = useState(false);

  const usersWithTimeOfSnapshot = useAppSelector(selectUsersWithTimeOfSnapshot);
  const contest = useAppSelector(selectContest);
  const contestTicksPassed = contest ? contest.ticksSinceBeginning : 0;
  const events = useAppSelector(selectEvents);
  const saveData = useAppSelector(selectSaveData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let ignore = false;
    const persistDataDuringTick = () => {
      if (saveData) {
        const savesJSON = localStorage.getItem("saves");
        if (savesJSON === null) {
          localStorage.clear();
          leaveGame();
          return;
        }

        let newUsersWithTimeOfSnapshot: UsersSlice = usersWithTimeOfSnapshot;
        if (!usersWithTimeOfSnapshot) {
          newUsersWithTimeOfSnapshot = loadOrGenerateUsers(
            saveData.saveName,
            saveData.handle
          );
          dispatch(setUsers(newUsersWithTimeOfSnapshot));
        }

        if (ticksPassedSinceGameLoad % 60 === 30) {
          setGameSaving(true);
          saveGameData(
            newUsersWithTimeOfSnapshot,
            contest,
            events,
            saveData,
            leaveGame
          );
          setGameSaving(false);
        }
      } else {
        leaveGame();
      }
    };

    void new Promise((resolve, _reject) => {
      setTimeout(() => {
        if (!ignore) {
          persistDataDuringTick();
          setTicksPassedSinceGameLoad((prev) => (prev += 1));
          resolve("DONE");
        } else resolve("IGNORED");
      }, Math.max(gameLoadTimestamp - Date.now() + 1000 * (ticksPassedSinceGameLoad + 1), 500));
    });

    return () => {
      ignore = true;
    };
  }, [
    ticksPassedSinceGameLoad,
    gameLoadTimestamp,
    leaveGame,
    contest,
    dispatch,
    events,
    usersWithTimeOfSnapshot,
    saveData,
  ]);

  useEffect(() => {
    if (!contest || !contestTypeRunning || !usersWithTimeOfSnapshot) {
      console.warn(
        "Tried to process a tick of contest when there was data missing."
      );
      return;
    }
    if (!contestTypeRunning.playerParticipating) {
      const numberOfMergedTicks = contestTypeRunning.numberOfMergedTicks;

      if (contestTicksPassed < CONTEST_LENGTH && noPlayerContestSimSpeed) {
        sleep(Math.min(1000, 1 / noPlayerContestSimSpeed))
          .then(() => {
            const { newContestUsersData, breaksToAddToStore, nextEventIn } =
              processTickOfContest(
                contest,
                numberOfMergedTicks,
                usersWithTimeOfSnapshot.users,
                dispatch
              );

            dispatch(incrementTicksSinceBeginning(null));
            dispatch(setNextEventIn(nextEventIn));
            dispatch(updateContestUserData({ newContestUsersData }));
            dispatch(addBreaks(breaksToAddToStore));
          }) // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {});
      } else if (contestTicksPassed >= CONTEST_LENGTH && !contest.finished) {
        const newContestUsersData = processSystests(
          contest.problems,
          contest.contestUsersData
        );
        const newRatingPoints = recalculateRatings(
          newContestUsersData,
          contest.problemScores,
          contest.problemScoreDecrementsPerMinute,
          usersWithTimeOfSnapshot.users
        );
        dispatch(updateRatings(newRatingPoints));
        dispatch(setContestFinished(null));
      }
    }
  }, [
    contestTypeRunning,
    contestTicksPassed,
    contest,
    dispatch,
    noPlayerContestSimSpeed,
    usersWithTimeOfSnapshot,
  ]);

  return (
    <>
      <NavBar gameSaving={gameSaving} />
      <Outlet />
    </>
  );
};

/*

const numberOfMergedTicks = INITIAL_CONTESTS_MERGE_TICKS_COUNT;
      for (let _ = 0; _ < INITIAL_CONTESTS_COUNT; _++) {
        dispatch(
          startContest({ division: 1, playerParticipating: false, users })
        );

        for (let __ = 0; __ < CONTEST_LENGTH / numberOfMergedTicks; __++) {
          dispatch(
            updateContestSliceAfterTickOfContest({
              numberOfMergedTicks,
              users,
              dispatch,
            })
          );
        }

        dispatch(processSystestsAndRecalculateRatings(null));
        dispatch(resetContest(null));

*/
