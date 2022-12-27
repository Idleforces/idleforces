import type { FormEvent} from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loadUsersFromSaveFile, selectUsers } from "../app/users/users-slice";
import type { LocalStorageSaveData, LocalStorageSavesValue } from "./game/types";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { RatingStyled } from "./game/utils/styled-rating";
import { setSaveData } from "../app/save/save-slice";
import { USER_INITIAL_RATING } from "../app/users/constants";
import { CONTEST_LENGTH, INITIAL_CONTESTS_COUNT, INITIAL_CONTESTS_MERGE_TICKS_COUNT } from "../app/contest/constants";
import { processSystestsAndRecalculateRatings, resetContest, startContest, updateContestSliceAfterTickOfContest } from "../app/contest/contest-slice";

const getSavesFromLocalStorage = (): LocalStorageSavesValue => {
  const savesJSON = localStorage.getItem("saves");
  return savesJSON !== null ? (JSON.parse(savesJSON) as LocalStorageSavesValue) : [];
};

export const Index = () => {
  const [handle, setHandle] = useState("");
  const [newSaveName, setNewSaveName] = useState("");
  const navigate = useNavigate();
  const users = useAppSelector(selectUsers);

  const [saves, setSaves] = useState(getSavesFromLocalStorage);
  const dispatch = useAppDispatch();

  const allowedToMakeASave =
    !saves.some((save) => save.saveName === newSaveName) &&
    !(newSaveName === "") &&
    !(handle == "");

  const handleNewSaveSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!saves.some((save) => save.saveName === newSaveName)) {
      dispatch(
        loadUsersFromSaveFile({
          saveName: newSaveName,
          handle,
        })
      );
      dispatch(
        setSaveData({
          handle,
          saveName: newSaveName,
          rating: USER_INITIAL_RATING,
        })
      );

      navigate("/loading");

      const numberOfMergedTicks = INITIAL_CONTESTS_MERGE_TICKS_COUNT;
      for (let _ = 0; _<INITIAL_CONTESTS_COUNT; _++) {
        dispatch(startContest({division: 1, playerParticipating: false, users}));

        for (let __ = 0; __<CONTEST_LENGTH / numberOfMergedTicks; __++) {
          dispatch(updateContestSliceAfterTickOfContest({numberOfMergedTicks, users, dispatch}));
        }

        dispatch(processSystestsAndRecalculateRatings(null));
        dispatch(resetContest(null));
      }

      navigate("/game/dashboard");
    } else {
      alert("Please choose a save name different from the previous ones.");
      setNewSaveName("");
    }
  };

  const loadSave = (save: LocalStorageSaveData) => {
    loadUsersFromSaveFile(save);
    setSaveData(save);
    navigate("/game/dashboard");
  };

  const deleteSave = (deletedSave: LocalStorageSaveData) => {
    const savesJSON = localStorage.getItem("saves");
    localStorage.setItem(
      "saves",
      JSON.stringify(
        (JSON.parse(savesJSON as string) as LocalStorageSavesValue).filter(
          (save) => save.saveName !== deletedSave.saveName
        )
      )
    );

    localStorage.removeItem(`users-${deletedSave.saveName}`);
  };

  return (
    <div id="index">
      <div id="index-description-container">
        <p className="index-description-header-paragraph">
          Become the greatest competitive programmer of all time
        </p>
        <ul>
          <li>Practice problem-solving to level up your character</li>
          <li>
            Compete in simulated contests against fellow* competitive
            programmers featuring real-time events
          </li>
          <li>
            The game uses autosave, so don&apos;`t worry about losing your progress.
          </li>
        </ul>
      </div>
      <form
        id="new-save-form"
        autoComplete="off"
        onSubmit={(e) => { handleNewSaveSubmit(e); }}
      >
        <div className="new-save-form-text-row">
          <div className="new-save-form-field">
            <label htmlFor="game-save-name-input">Enter save name:</label>
            <input
              className="text-input"
              type="text"
              value={newSaveName}
              onChange={(e) => { setNewSaveName(e.target.value); }}
              autoComplete="off"
              name="game-save-name-input"
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
              onChange={(e) => { setHandle(e.target.value); }}
              autoComplete="off"
              name="handle-input"
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

      {saves.length ? (
        <div id="saves-container">
          <p id="saves-container-header">
            Or, load one of the save files we found.
          </p>
          <div className="save-box-header">
            <span>Save name</span>
            <span>Handle</span>
            <span>Rating</span>
            <span>Actions</span>
          </div>
          {saves.map((save) => (
            <div className="save-box" key={save.saveName}>
              <span>{save.saveName}</span>
              <span>
                <RatingStyled
                  rating={save.rating}
                  stringToStyle={save.handle}
                />
              </span>
              <span>{save.rating}</span>
              <span className="saves-action-container">
                <div
                  className="save-box-button-container"
                  aria-label="Load this save"
                  onClick={(_e) => { loadSave(save); }}
                >
                  <i
                    className="fa-solid fa-right-to-bracket "
                    id="load-save-button"
                  ></i>
                </div>
                <div
                  className="save-box-button-container"
                  aria-label="Delete this save"
                  onClick={(_e) => {
                    const isDeleted = confirm(
                      `Are you sure you want to delete the save '${save.saveName}'?`
                    );
                    if (isDeleted) {
                      deleteSave(save);
                      setSaves(getSavesFromLocalStorage);
                    }
                  }}
                >
                  <i
                    className="fa-solid fa-trash-can"
                    id="delete-save-button"
                  ></i>
                </div>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
