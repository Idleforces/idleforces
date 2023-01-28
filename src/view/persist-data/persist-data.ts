import hash_sum from "hash-sum";
import type { BooksSlice } from "../../app/books/books-slice";
import type { ContestArchiveSlice } from "../../app/contest-archive/types";
import type { ContestSlice } from "../../app/contest/types";
import type { EventsSlice } from "../../app/events/types";
import type { FriendsSlice } from "../../app/friends/types";
import type { Activity, SaveSlice } from "../../app/save/save-slice";
import { saveUsers } from "../../app/users/save-users";
import type { UsersSlice } from "../../app/users/users-slice";
import { safeSetLocalStorageValue } from "../../utils/utils";
import type {
  LocalStorageSaveData,
  LocalStorageSavesValue,
} from "../game/types";
import type { LocalStorageKeys } from "./types";

export const getSavesFromLocalStorage = (): LocalStorageSavesValue => {
  const savesJSON = localStorage.getItem("saves");
  return savesJSON !== null
    ? (JSON.parse(savesJSON) as LocalStorageSavesValue)
    : [];
};

const updateLocalStorageSavesValue = async (
  saveData: Exclude<SaveSlice, null>,
  usersHash: string,
  contestHash: string,
  eventsHash: string,
  contestArchiveHash: string,
  friendsHash: string,
  NPCsHash: string,
  booksHash: string,
  activity: Activity,
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
    NPCsHash,
    booksHash,
    activity,
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
    const saves = (JSON.parse(savesJSON) ?? []) as LocalStorageSavesValue;
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

const promisifiedLocalStorageGet = (key: string): Promise<string | null> => {
  return new Promise((resolve, _reject) => {
    resolve(localStorage.getItem(key));
  });
};

async function saveToLocalStorageIfHashesDiffer(
  key: LocalStorageKeys,
  hash: string,
  saveName: string,
  value: unknown,
  leaveGame: () => void
) {
  const localStorageValue = await promisifiedLocalStorageGet(
    `${key}-${saveName}`
  );
  const localStorageValueHash = await promisifiedHashSum(localStorageValue);

  if (localStorageValue === null || hash !== localStorageValueHash) {
    await safeSetLocalStorageValue(
      `${key}-${saveName}`,
      JSON.stringify(value),
      leaveGame
    );
  }
}

export const saveGameData = async (
  usersWithTimeOfSnapshot: UsersSlice,
  contest: ContestSlice,
  events: EventsSlice,
  contestArchive: ContestArchiveSlice,
  friends: FriendsSlice,
  booksReadingData: BooksSlice,
  saveData: Exclude<SaveSlice, null>,
  leaveGame: () => void
): Promise<void> => {
  const NPCsHash = await promisifiedHashSum(usersWithTimeOfSnapshot?.NPCs);
  const usersHash = await promisifiedHashSum({
    ...usersWithTimeOfSnapshot,
    NPCs: NPCsHash,
  });
  const contestHash = await promisifiedHashSum(contest);
  const eventsHash = await promisifiedHashSum(events);
  const contestArchiveHash = await promisifiedHashSum(contestArchive);
  const friendsHash = await promisifiedHashSum(friends);
  const booksHash = await promisifiedHashSum(booksReadingData);

  const saveName = saveData.saveName;
  const activity = saveData.activity;

  const localStorageSavesJSON = localStorage.getItem("saves") ?? "[]";
  const localStorageSavesValue = JSON.parse(
    localStorageSavesJSON
  ) as LocalStorageSavesValue;

  const localStorageSaveData = localStorageSavesValue.find(
    (saveData) => saveData.saveName === saveName
  );

  await updateLocalStorageSavesValue(
    saveData,
    usersHash,
    contestHash,
    eventsHash,
    contestArchiveHash,
    friendsHash,
    NPCsHash,
    booksHash,
    activity,
    leaveGame
  );

  const localStorageUsersValue = localStorage.getItem(`users-${saveName}`);

  if (
    localStorageUsersValue === null ||
    !localStorageSaveData ||
    usersHash !== localStorageSaveData.usersHash
  ) {
    await saveUsers(
      usersWithTimeOfSnapshot,
      saveName,
      localStorageSaveData?.NPCsHash ?? "",
      NPCsHash,
      leaveGame
    );
  }

  await saveToLocalStorageIfHashesDiffer(
    "contest",
    contestHash,
    saveName,
    contest,
    leaveGame
  );
  await saveToLocalStorageIfHashesDiffer(
    "archive-contest",
    contestArchiveHash,
    saveName,
    contestArchive,
    leaveGame
  );
  await saveToLocalStorageIfHashesDiffer(
    "events",
    eventsHash,
    saveName,
    events,
    leaveGame
  );
  await saveToLocalStorageIfHashesDiffer(
    "friends",
    friendsHash,
    saveName,
    friends,
    leaveGame
  );
  await saveToLocalStorageIfHashesDiffer(
    "books",
    booksHash,
    saveName,
    booksReadingData,
    leaveGame
  );
};
