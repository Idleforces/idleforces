import hash_sum from "hash-sum";
import type { ContestSlice } from "../app/contest/types";
import type { EventsSlice } from "../app/events/types";
import type { SaveSlice } from "../app/save/save-slice";
import { saveUsers } from "../app/users/save-users";
import type { UsersSlice } from "../app/users/users-slice";
import { safeSetLocalStorageValue } from "../utils/utils";
import type {
  LocalStorageSaveData,
  LocalStorageSavesValue,
} from "./game/types";

const updateLocalStorageSavesValue = (
  saveData: Exclude<SaveSlice, null>,
  usersHash: string,
  contestHash: string,
  eventsHash: string,
  inContest: boolean,
  leaveGame: () => void
): void => {
  const savesJSON = localStorage.getItem("saves");
  const localStorageGameSaveValue: LocalStorageSaveData = {
    rating: saveData.rating,
    usersHash,
    contestHash,
    eventsHash,
    inContest,
    saveName: saveData.saveName,
    handle: saveData.handle,
  };

  if (savesJSON === null) {
    safeSetLocalStorageValue(
      "saves",
      JSON.stringify([localStorageGameSaveValue]),
      leaveGame
    );
  } else {
    const saves = JSON.parse(savesJSON) as LocalStorageSavesValue;
    if (!saves.some((save) => save.saveName === saveData.saveName)) {
      safeSetLocalStorageValue(
        "saves",
        JSON.stringify([...saves, localStorageGameSaveValue]),
        leaveGame
      );
    }
  }
};

export const saveGameData = (
  usersWithTimeOfSnapshot: UsersSlice,
  contest: ContestSlice,
  events: EventsSlice,
  saveData: Exclude<SaveSlice, null>,
  leaveGame: () => void
): void => {
  const usersHash = hash_sum(usersWithTimeOfSnapshot);
  const contestHash = hash_sum(contest);
  const eventsHash = hash_sum(events);
  const saveName = saveData.saveName;

  updateLocalStorageSavesValue(
    saveData,
    usersHash,
    contestHash,
    eventsHash,
    contest !== null,
    leaveGame
  );

  const localStorageUsersValue = localStorage.getItem(`users-${saveName}`);
  if (
    localStorageUsersValue === null ||
    usersHash !== hash_sum(localStorageUsersValue)
  ) {
    saveUsers(usersWithTimeOfSnapshot, saveName, leaveGame);
  }

  const localStorageContestValue = localStorage.getItem(`contest-${saveName}`);
  if (
    localStorageContestValue === null ||
    contestHash !== hash_sum(localStorageContestValue)
  ) {
    safeSetLocalStorageValue(
      `contest-${saveName}`,
      JSON.stringify(contest),
      leaveGame
    );
  }

  const localStorageEventsValue = localStorage.getItem(`events-${saveName}`);
  if (
    localStorageEventsValue === null ||
    eventsHash !== hash_sum(localStorageEventsValue)
  ) {
    safeSetLocalStorageValue(
      `events-${saveName}`,
      JSON.stringify(contest),
      leaveGame
    );
  }
};
