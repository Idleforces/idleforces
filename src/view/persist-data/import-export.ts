import { safeSetLocalStorageValue } from "../../utils/utils";
import { getSavesFromLocalStorage } from "./persist-data";
import { localStorageKeys } from "./types";

export const exportGameData = () => {
  const localStorageSavesValue = getSavesFromLocalStorage();
  const localStorageValue: Record<string, unknown> = {
    saves: localStorageSavesValue,
  };

  localStorageSavesValue.forEach((localStorageSavesData) => {
    localStorageKeys.forEach((key) => {
      const localStorageKeyValueJSON = localStorage.getItem(
        `${key}-${localStorageSavesData.saveName}`
      );

      if (localStorageKeyValueJSON !== null) {
        const localStorageKeyValue: unknown = JSON.parse(
          localStorageKeyValueJSON
        );

        localStorageValue[`${key}-${localStorageSavesData.saveName}`] =
          localStorageKeyValue;
      }
    });
  });

  return JSON.stringify(localStorageValue);
};

export const computeSaveNamesFromGameData = (gameData: string) => {
  let gameDataParsed: unknown;
  try {
    gameDataParsed = JSON.parse(gameData);
  } catch (e: unknown) {
    return [];
  }

  if (gameDataParsed === null || typeof gameDataParsed !== "object") return [];
  if (!("saves" in gameDataParsed)) return [];
  const gameDataSaveValue = gameDataParsed["saves"];
  if (!Array.isArray(gameDataSaveValue)) return [];

  const saveNames: Array<string> = [];
  (gameDataSaveValue as Array<unknown>).forEach((saveData) => {
    if (saveData === null || typeof saveData !== "object") return [];
    if (!("saveName" in saveData) || typeof saveData["saveName"] !== "string")
      return [];
    saveNames.push(saveData.saveName);
  });

  return saveNames;
};

export const importGameData = async (
  gameData: string,
  leaveGame: () => void
) => {
  let gameDataParsed: unknown;
  try {
    gameDataParsed = JSON.parse(gameData);
  } catch (e: unknown) {
    return;
  }

  if (gameDataParsed === null || typeof gameDataParsed !== "object") return;
  localStorage.clear();
  for (const [key, value] of Object.entries(gameDataParsed)) {
    await safeSetLocalStorageValue(key, JSON.stringify(value), leaveGame);
  }
};
