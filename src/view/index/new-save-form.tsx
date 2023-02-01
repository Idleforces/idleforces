import { useState } from "react";
import type { FormEvent } from "react";
import { USER_INITIAL_RATING } from "../../app/users/constants";
import type { LocalStorageSavesValue } from "../game/types";
import { loadOrGenerateUsers } from "../../app/users/load-users";
import { countriesCount, populateCountriesCount } from "./countries-count";
import { BOOKS_DATA } from "../../app/books/books";
import { computeInitialBookReadingData } from "../../app/books/read-book";
import { computeBookLengthByHoursToRead } from "../../app/books/utils";
import { useAppDispatch } from "../../app/hooks";
import { setSaveData } from "../../app/save/save-slice";
import { setUsers } from "../../app/users/users-slice";
import { setBooksSlice } from "../../app/books/books-slice";
import { saveGameData } from "../persist-data/persist-data";
import { useNavigate } from "react-router";
import "./index.css";

export const NewSaveForm = (props: {
  saves: LocalStorageSavesValue;
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const { saves } = props;
  const leaveGame = props.leaveGameRef.current;

  const [handle, setHandle] = useState("");
  const [newSaveName, setNewSaveName] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const allowedToMakeASave =
    !saves.some((save) => save.saveName === newSaveName) &&
    !(newSaveName === "") &&
    !(handle == "");

  const handleNewSaveSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!saves.some((save) => save.saveName === newSaveName)) {
      const newUsersWithTimeOfSnapshot = loadOrGenerateUsers(
        newSaveName,
        handle
      );
      if (!countriesCount.size)
        populateCountriesCount(newUsersWithTimeOfSnapshot.NPCs);

      const saveData = {
        handle,
        saveName: newSaveName,
        rating: USER_INITIAL_RATING,
        activity: null,
      };
      const booksReadingData = BOOKS_DATA.map((bookData) =>
        computeInitialBookReadingData(
          computeBookLengthByHoursToRead(bookData.hoursToRead),
          bookData.id
        )
      );

      dispatch(setSaveData(saveData));
      dispatch(setUsers(newUsersWithTimeOfSnapshot));
      dispatch(setBooksSlice(booksReadingData));

      saveGameData(
        newUsersWithTimeOfSnapshot,
        null,
        null,
        [],
        [],
        booksReadingData,
        saveData,
        leaveGame
      )
        .then((_res) => {
          navigate("/game/dashboard");
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    } else {
      alert("Please choose a save name different from the previous ones.");
      setNewSaveName("");
    }
  };

  return (
    <form
      id="new-save-form"
      autoComplete="off"
      onSubmit={(e) => {
        handleNewSaveSubmit(e);
      }}
    >
      <div className="new-save-form-text-row">
        <div className="new-save-form-field">
          <label htmlFor="game-save-name-input">Enter save name:</label>
          <input
            className="text-input"
            type="text"
            value={newSaveName}
            onChange={(e) => {
              setNewSaveName(e.target.value);
            }}
            autoComplete="off"
            name="game-save-name-input"
            id="game-save-name-input"
            maxLength={20}
            placeholder="Enter save name"
            required
          />
        </div>
        <div className="new-save-form-field">
          <label htmlFor="handle-input">Enter your handle:</label>
          <input
            className="text-input"
            type="text"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
            }}
            autoComplete="off"
            name="handle-input"
            id="handle-input"
            maxLength={20}
            placeholder="Enter your handle"
            required
          />
        </div>
      </div>
      <input
        className={`submit-input ${
          !allowedToMakeASave ? "submit-input-disabled" : ""
        }`}
        type="submit"
        value="Make a new game save"
        disabled={!allowedToMakeASave}
      />
    </form>
  );
};
