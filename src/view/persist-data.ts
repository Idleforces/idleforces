import hash_sum from "hash-sum";
import type { ContestArchiveSlice } from "../app/contest-archive/types";
import type { ContestSlice } from "../app/contest/types";
import type { EventsSlice } from "../app/events/types";
import type { FriendsSlice } from "../app/friends/types";
import type { SaveSlice } from "../app/save/save-slice";
import { saveUsers } from "../app/users/save-users";
import type { UsersSlice } from "../app/users/users-slice";
import { safeSetLocalStorageValue } from "../utils/utils";
import type {
  LocalStorageSaveData,
  LocalStorageSavesValue,
} from "./game/types";

const updateLocalStorageSavesValue = async (
  saveData: Exclude<SaveSlice, null>,
  usersHash: string,
  contestHash: string,
  eventsHash: string,
  contestArchiveHash: string,
  friendsHash: string,
  inContest: boolean,
  leaveGame: () => void
): Promise<void> => {
  const savesJSON = localStorage.getItem("saves");
  const localStorageGameSaveValue: LocalStorageSaveData = {
    rating: saveData.rating,
    usersHash,
    contestHash,
    eventsHash,
    contestArchiveHash,
    friendsHash,
    inContest,
    saveName: saveData.saveName,
    handle: saveData.handle,
  };

  if (savesJSON === null) {
    await safeSetLocalStorageValue(
      "saves",
      JSON.stringify([localStorageGameSaveValue]),
      leaveGame
    );
  } else {
    const saves = JSON.parse(savesJSON) as LocalStorageSavesValue;
    await safeSetLocalStorageValue(
      "saves",
      JSON.stringify([
        ...saves.filter(
          (localStorageSaveData) =>
            localStorageSaveData.saveName !== saveData.saveName
        ),
        localStorageGameSaveValue,
      ]),
      leaveGame
    );
  }
};

const promisifiedHashSum = (value: unknown): Promise<string> => {
  return new Promise((resolve, _reject) => {
    resolve(hash_sum(value));
  });
};

export const saveGameData = async (
  usersWithTimeOfSnapshot: UsersSlice,
  contest: ContestSlice,
  events: EventsSlice,
  contestArchive: ContestArchiveSlice,
  friends: FriendsSlice,
  saveData: Exclude<SaveSlice, null>,
  leaveGame: () => void
): Promise<void> => {
  const usersHash = await promisifiedHashSum(usersWithTimeOfSnapshot);
  const contestHash = await promisifiedHashSum(contest);
  const eventsHash = await promisifiedHashSum(events);
  const contestArchiveHash = await promisifiedHashSum(contestArchive);
  const friendsHash = await promisifiedHashSum(friends);
  const saveName = saveData.saveName;

  await updateLocalStorageSavesValue(
    saveData,
    usersHash,
    contestHash,
    eventsHash,
    contestArchiveHash,
    friendsHash,
    contest !== null,
    leaveGame
  );

  const localStorageUsersValue = localStorage.getItem(`users-${saveName}`);
  if (
    localStorageUsersValue === null ||
    usersHash !== hash_sum(localStorageUsersValue)
  ) {
    await saveUsers(usersWithTimeOfSnapshot, saveName, leaveGame);
  }

  const localStorageContestValue = localStorage.getItem(`contest-${saveName}`);
  if (
    localStorageContestValue === null ||
    contestHash !== hash_sum(localStorageContestValue)
  ) {
    await safeSetLocalStorageValue(
      `contest-${saveName}`,
      JSON.stringify(contest),
      leaveGame
    );
  }

  const localStorageContestArchiveValue = localStorage.getItem(
    `archive-contest-${saveName}`
  );
  if (
    localStorageContestValue === null ||
    contestHash !== hash_sum(localStorageContestArchiveValue)
  ) {
    await safeSetLocalStorageValue(
      `archive-contest-${saveName}`,
      JSON.stringify(contestArchive),
      leaveGame
    );
  }

  const localStorageEventsValue = localStorage.getItem(`events-${saveName}`);
  if (
    localStorageEventsValue === null ||
    eventsHash !== hash_sum(localStorageEventsValue)
  ) {
    await safeSetLocalStorageValue(
      `events-${saveName}`,
      JSON.stringify(events),
      leaveGame
    );
  }

  const localStorageFriendsValue = localStorage.getItem(`friends-${saveName}`);
  if (
    localStorageFriendsValue === null ||
    friendsHash !== hash_sum(localStorageFriendsValue)
  ) {
    await safeSetLocalStorageValue(
      `friends-${saveName}`,
      JSON.stringify(friends),
      leaveGame
    );
  }
};
