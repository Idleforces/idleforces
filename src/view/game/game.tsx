import hash_sum from "hash-sum";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { saveUsers } from "../../app/users/saveUsers";
import { selectUsersWithTimeOfSnapshot } from "../../app/users/usersSlice";
import { safeSetLocalStorageValue } from "../../utils/utils";
import { LocalStorageSavesValue } from "./types";
import { Outlet } from "react-router-dom";
import { NavBar } from "./navbar";
import { selectSaveData } from "../../app/save/saveSlice";

export const Game = (props: { leaveGame: () => void }) => {
  const startingTimestamp = useMemo(() => Date.now(), []);
  const [ticksPassed, setTicksPassed] = useState(0);
  const usersWithTimestamp = useAppSelector(selectUsersWithTimeOfSnapshot);
  const saveData = useAppSelector(selectSaveData);
  const leaveGame = props.leaveGame;

  const handleTick = () => {
    const hash = hash_sum(usersWithTimestamp);
    const localStorageGameSaveValue = localStorage.getItem(
      `__${saveData?.saveName}`
    );
    if (
      !localStorageGameSaveValue ||
      hash !== JSON.parse(localStorageGameSaveValue)
    ) {
      saveUsers(usersWithTimestamp, saveData?.saveName as string, leaveGame);
    }

    const savesJSON = localStorage.getItem("saves");
    if (!savesJSON) {
      safeSetLocalStorageValue(
        "saves",
        JSON.stringify([
          {
            rating: saveData?.rating,
            hash,
            saveName: saveData?.saveName,
            handle: saveData?.handle,
          },
        ]),
        leaveGame
      );
    } else {
      const saves = JSON.parse(savesJSON) as LocalStorageSavesValue;
      if (
        saves.filter((save) => save.saveName === saveData?.saveName).length ===
        0
      ) {
        safeSetLocalStorageValue(
          "saves",
          JSON.stringify([
            ...saves,
            {
              rating: saveData?.rating,
              hash,
              saveName: saveData?.saveName,
              handle: saveData?.handle,
            },
          ]),
          leaveGame
        );
      }
    }
  };

  useEffect(() => {
    new Promise((resolve, _reject) => {
      setTimeout(() => {
        handleTick();
        setTicksPassed((prev) => (prev += 1));
        resolve("DONE");
      }, Math.max(startingTimestamp - Date.now() + 1000 * (ticksPassed + 1), 500));
    });
  }, [ticksPassed]);

  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};
