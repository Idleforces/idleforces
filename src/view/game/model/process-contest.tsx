import { useMemo, useEffect } from "react";
import { selectBooksReadingData } from "../../../app/books/books-slice";
import { addContestToArchive, selectArchivedContests } from "../../../app/contest-archive/contest-archive-slice";
import { CONTEST_LENGTH, DIVISION_MERGE_TICKS_COUNT } from "../../../app/contest/constants";
import { selectContest, updateContestSlice } from "../../../app/contest/contest-slice";
import { processSystests } from "../../../app/contest/process-systests";
import { processTickOfContest } from "../../../app/contest/process-tick";
import { recalculateRatings } from "../../../app/contest/recalculate-ratings";
import { selectEvents } from "../../../app/events/events-slice";
import { selectFriends } from "../../../app/friends/friends-slice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectActivity,
  selectHandle,
  selectSaveData,
  setPlayerRating,
} from "../../../app/save/save-slice";
import { selectUsersWithTimeOfSnapshot, updateRatings } from "../../../app/users/users-slice";
import { selectNoPlayerContestSimSpeed } from "../../../app/view/view-slice";
import { convertSecondsToHHMMSS } from "../../../utils/time-format";
import { sleep } from "../../../utils/utils";
import { saveGameData } from "../../persist-data/persist-data";

export const ProcessContest = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const leaveGame = props.leaveGameRef.current;
  const dispatch = useAppDispatch();

  const noPlayerContestSimSpeed = useAppSelector(selectNoPlayerContestSimSpeed);
  const usersWithTimeOfSnapshot = useAppSelector(selectUsersWithTimeOfSnapshot);
  const contest = useAppSelector(selectContest);
  const contestArchive = useAppSelector(selectArchivedContests);
  const friends = useAppSelector(selectFriends);
  const events = useAppSelector(selectEvents);
  const saveData = useAppSelector(selectSaveData);
  const activity = useAppSelector(selectActivity);
  const booksReadingData = useAppSelector(selectBooksReadingData);
  const handle = useAppSelector(selectHandle);

  const contestTicksPassed = contest ? contest.ticksSinceBeginning : 0;

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
      if (playerParticipating && handle !== undefined) {
        dispatch(setPlayerRating(newRatingPoints[handle]?.rating));
      }
      document.title = "Idleforces";

      if (saveData)
        void saveGameData(
          usersWithTimeOfSnapshot,
          contest,
          events,
          contestArchive,
          friends,
          booksReadingData,
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

  return <></>;
};
