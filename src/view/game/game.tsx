import {  useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
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
  updateContestSlice,
  selectContest,
} from "../../app/contest/contest-slice";
import { selectEvents } from "../../app/events/events-slice";
import {
  CONTEST_LENGTH,
  DIVISION_MERGE_TICKS_COUNT,
} from "../../app/contest/constants";
import { processTickOfContest } from "../../app/contest/process-tick";
import { saveGameData } from "../persist-data/persist-data";
import { loadOrGenerateUsers } from "../../app/users/load-users";
import { processSystests } from "../../app/contest/process-systests";
import { recalculateRatings } from "../../app/contest/recalculate-ratings";
import {
  addContestToArchive,
  selectArchivedContests,
} from "../../app/contest-archive/contest-archive-slice";
import { selectFriends } from "../../app/friends/friends-slice";

export const Game = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
  contestTypeRunning: ContestTypeRunning;
  noPlayerContestSimSpeed: number;
  secondsSincePageLoad: number
  timestampAtPageLoad: MutableRefObject<number>
}) => {
  const secondsSincePageLoad = props.secondsSincePageLoad;
  const timestampAtPageLoad = props.timestampAtPageLoad;
  const contestTypeRunning = props.contestTypeRunning;
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const leaveGame = props.leaveGameRef.current;

  const [gameSaving, setGameSaving] = useState(false);

  const usersWithTimeOfSnapshot = useAppSelector(selectUsersWithTimeOfSnapshot);
  const contest = useAppSelector(selectContest);
  const contestArchive = useAppSelector(selectArchivedContests);
  const friends = useAppSelector(selectFriends);
  const contestTicksPassed = contest ? contest.ticksSinceBeginning : 0;
  const events = useAppSelector(selectEvents);
  const saveData = useAppSelector(selectSaveData);
  const dispatch = useAppDispatch();

  useEffect(() => {
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

        if (secondsSincePageLoad % 60 === 30) {
          setGameSaving(true);
          saveGameData(
            newUsersWithTimeOfSnapshot,
            contest,
            events,
            contestArchive,
            friends,
            saveData,
            leaveGame
          )
            .then((_res) => {
              setGameSaving(false);
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {});
        }
      } else {
        leaveGame();
      }
    };

    persistDataDuringTick();
  }, [
    secondsSincePageLoad,
    timestampAtPageLoad,
    leaveGame,
    contest,
    dispatch,
    events,
    friends,
    usersWithTimeOfSnapshot,
    saveData,
    contestArchive,
  ]);

  const contestTicksPassedAtMaxOfGameLoadStartContest = useMemo(
    () => contestTicksPassed,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contestTypeRunning]
  );

  const timestampOfMaxOfGameLoadStartContest = useMemo(
    () => Date.now(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contestTypeRunning]
  );

  useEffect(() => {
    let ignore = false;
    if (!contest || !contestTypeRunning || !usersWithTimeOfSnapshot) {
      console.warn(
        "Tried to process a tick of contest when there was data missing."
      );
      return () => {
        ignore = true;
      };
    }

    const playerParticipating = contestTypeRunning.playerParticipating;
    const divisionMergeTicksCount =
      DIVISION_MERGE_TICKS_COUNT[contest.division];
    const numberOfMergedTicks = playerParticipating
      ? divisionMergeTicksCount
      : Math.ceil(100 * Math.pow(noPlayerContestSimSpeed, 2));

    const sleepDuration = playerParticipating
      ? Math.max(
          divisionMergeTicksCount *
            (timestampOfMaxOfGameLoadStartContest - Date.now()) +
            1000 *
              (contestTicksPassed -
                contestTicksPassedAtMaxOfGameLoadStartContest +
                divisionMergeTicksCount),
          500
        )
      : 40;

    if (
      contestTicksPassed < CONTEST_LENGTH &&
      (playerParticipating || noPlayerContestSimSpeed)
    ) {
      sleep(sleepDuration) // To prevent React complaining about infinite loop of rerenders or 1 second if playerParticipating.
        .then(() => {
          const { newContestUsersData, nextEventIn } = processTickOfContest(
            contest,
            numberOfMergedTicks,
            usersWithTimeOfSnapshot.users,
            dispatch
          );
          if (!ignore)
            dispatch(
              updateContestSlice({
                nextEventIn,
                newContestUsersData,
                numberOfTicksSimulated: numberOfMergedTicks,
              })
            );
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
        usersWithTimeOfSnapshot.users,
        contest.name
      );

      dispatch(
        updateContestSlice({
          nextEventIn: NaN,
          newContestUsersData,
          numberOfTicksSimulated: 0,
          contestFinished: true,
        })
      );

      dispatch(addContestToArchive(contest));
      dispatch(updateRatings(newRatingPoints));
      if (saveData)
        void saveGameData(
          usersWithTimeOfSnapshot,
          contest,
          events,
          contestArchive,
          friends,
          saveData,
          leaveGame
        );
    }

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    contestTypeRunning,
    contestTicksPassed,
    contestTicksPassedAtMaxOfGameLoadStartContest,
    timestampOfMaxOfGameLoadStartContest,
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
