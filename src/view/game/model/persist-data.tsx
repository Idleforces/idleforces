import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectSaveData } from "../../../app/save/save-slice";
import { loadOrGenerateUsers } from "../../../app/users/load-users";
import { selectUsersWithTimeOfSnapshot, setUsers } from "../../../app/users/users-slice";
import type { UsersSlice } from "../../../app/users/users-slice";
import { selectSecondsSincePageLoad, selectTimestampAtPageLoad } from "../../../app/view/view-slice";
import { saveGameData } from "../../persist-data/persist-data";
import { selectContest } from "../../../app/contest/contest-slice";
import { selectArchivedContests } from "../../../app/contest-archive/contest-archive-slice";
import { selectFriends } from "../../../app/friends/friends-slice";
import { selectEvents } from "../../../app/events/events-slice";
import { selectBooksReadingData } from "../../../app/books/books-slice";

export const PersistData = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const leaveGame = props.leaveGameRef.current;

  const usersWithTimeOfSnapshot = useAppSelector(selectUsersWithTimeOfSnapshot);
  const timestampAtPageLoad = useAppSelector(selectTimestampAtPageLoad);
  const secondsSincePageLoad = useAppSelector(selectSecondsSincePageLoad);

  const contest = useAppSelector(selectContest);
  const contestArchive = useAppSelector(selectArchivedContests);
  const friends = useAppSelector(selectFriends);
  const events = useAppSelector(selectEvents);
  const saveData = useAppSelector(selectSaveData);
  const booksReadingData = useAppSelector(selectBooksReadingData);

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
          saveGameData(
            newUsersWithTimeOfSnapshot,
            contest,
            events,
            contestArchive,
            friends,
            booksReadingData,
            saveData,
            leaveGame
          )
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
    booksReadingData,
  ]);

  return <></>;
};
