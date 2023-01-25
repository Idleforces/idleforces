import { useEffect, useMemo, useState } from "react";
import type { MutableRefObject, Dispatch, SetStateAction } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectUsersWithTimeOfSnapshot,
  setUsers,
  updateRatings,
} from "../../app/users/users-slice";
import type { UsersSlice } from "../../app/users/users-slice";
import { sleep } from "../../utils/utils";
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./navbar";
import { selectActivity, selectSaveData } from "../../app/save/save-slice";
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
import { SideBar } from "./sidebar/sidebar";
import "./game.css";
import { ContestSideBar } from "./contest/contest-sidebar";
import { convertSecondsToHHMMSS } from "../../utils/time-format";
import type { ContestSubmissionsFilterData } from "./contest/status/status";

export const Game = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
  noPlayerContestSimSpeed: number;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
  secondsSincePageLoad: number;
  timestampAtPageLoad: MutableRefObject<number>;
  contestSubmissionsFilterData: ContestSubmissionsFilterData;
  setContestSubmissionsFilterData: Dispatch<SetStateAction<ContestSubmissionsFilterData>>;
}) => {
  const secondsSincePageLoad = props.secondsSincePageLoad;
  const timestampAtPageLoad = props.timestampAtPageLoad;
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;
  const contestSubmissionsFilterData = props.contestSubmissionsFilterData;
  const setContestSubmissionsFilterData = props.setContestSubmissionsFilterData;

  const leaveGame = props.leaveGameRef.current;
  const location = useLocation();

  const [gameSaving, setGameSaving] = useState(false);

  const usersWithTimeOfSnapshot = useAppSelector(selectUsersWithTimeOfSnapshot);
  const contest = useAppSelector(selectContest);
  const contestArchive = useAppSelector(selectArchivedContests);
  const friends = useAppSelector(selectFriends);
  const contestTicksPassed = contest ? contest.ticksSinceBeginning : 0;
  const events = useAppSelector(selectEvents);
  const saveData = useAppSelector(selectSaveData);
  const activity = useAppSelector(selectActivity);

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
    [activity]
  );

  const timestampOfMaxOfGameLoadStartContest = useMemo(
    () => Date.now(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activity]
  );

  useEffect(() => {
    let ignore = false;
    if (!contest || !activity || !usersWithTimeOfSnapshot) {
      console.warn(
        "Tried to process a tick of contest when there was data missing."
      );
      return () => {
        ignore = true;
      };
    }

    const secondsRemaining = Math.max(CONTEST_LENGTH - contestTicksPassed, 0);
    document.title = `Idleforces (${convertSecondsToHHMMSS(secondsRemaining)})`;

    const playerParticipating = activity === "contest-participation";
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
            [usersWithTimeOfSnapshot.player, ...usersWithTimeOfSnapshot.NPCs],
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
        [usersWithTimeOfSnapshot.player, ...usersWithTimeOfSnapshot.NPCs],
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
      document.title = "Idleforces";

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
    activity,
    contestTicksPassed,
    contestTicksPassedAtMaxOfGameLoadStartContest,
    timestampOfMaxOfGameLoadStartContest,
    contest,
    dispatch,
    noPlayerContestSimSpeed,
    usersWithTimeOfSnapshot,
  ]);

  return (
    <div id="game-container">
      <NavBar gameSaving={gameSaving} />
      <main id="game">
        <div id="game-page-container">
          <Outlet />
        </div>
        {location.pathname.startsWith("/game/contest") &&
        !location.pathname.startsWith("/game/contests") ? (
          <ContestSideBar
            noPlayerContestSimSpeed={noPlayerContestSimSpeed}
            setNoPlayerContestSimSpeed={setNoPlayerContestSimSpeed}
            setContestSubmissionsFilterData={setContestSubmissionsFilterData}
            contestSubmissionsFilterData={contestSubmissionsFilterData}
          />
        ) : (
          <SideBar
            secondsSincePageLoad={secondsSincePageLoad}
            timestampAtPageLoad={timestampAtPageLoad}
          />
        )}
      </main>
    </div>
  );
};
