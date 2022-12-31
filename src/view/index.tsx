import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { setUsers } from "../app/users/users-slice";
import type {
  ContestTypeRunning,
  LocalStorageSaveData,
  LocalStorageSavesValue,
} from "./game/types";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { RatingStyled } from "./game/utils/styled-rating";
import { setSaveData } from "../app/save/save-slice";
import { USER_INITIAL_RATING } from "../app/users/constants";
import { setContest } from "../app/contest/contest-slice";
import type { ContestSlice } from "../app/contest/types";
import { setEvents } from "../app/events/events-slice";
import type { EventsSlice } from "../app/events/types";
import { saveGameData } from "./persist-data";
import { loadOrGenerateUsers } from "../app/users/load-users";

const getSavesFromLocalStorage = (): LocalStorageSavesValue => {
  const savesJSON = localStorage.getItem("saves");
  return savesJSON !== null
    ? (JSON.parse(savesJSON) as LocalStorageSavesValue)
    : [];
};

export const Index = (props: {
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>;
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const [handle, setHandle] = useState("");
  const [newSaveName, setNewSaveName] = useState("");
  const [saves, setSaves] = useState(getSavesFromLocalStorage);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const leaveGame = props.leaveGameRef.current;
  const setContestTypeRunning = props.setContestTypeRunning;

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

      const saveData = {
        handle,
        saveName: newSaveName,
        rating: USER_INITIAL_RATING,
        inContest: false,
      };
      dispatch(setSaveData(saveData));
      dispatch(setUsers(newUsersWithTimeOfSnapshot));

      saveGameData(newUsersWithTimeOfSnapshot, null, null, saveData, leaveGame);
      navigate("/game/dashboard");
    } else {
      alert("Please choose a save name different from the previous ones.");
      setNewSaveName("");
    }
  };

  const loadSave = (saveData: LocalStorageSaveData) => {
    const saveName = saveData.saveName;
    const usersWithTimeOfSnapshot = loadOrGenerateUsers(
      saveName,
      saveData.handle
    );
    dispatch(setSaveData(saveData));
    dispatch(setUsers(usersWithTimeOfSnapshot));

    if (saveData.inContest) {
      const contest = JSON.parse(
        localStorage.getItem(`contest-${saveName}`) as string
      ) as ContestSlice;

      if (contest) {
        setContestTypeRunning({
          playerParticipating: contest.contestUsersData[0].isPlayer,
          numberOfMergedTicks: contest.numberOfMergedTicks,
        });
        dispatch(setContest(contest));
      }

      const events = JSON.parse(
        localStorage.getItem(`events-${saveName}`) as string
      ) as EventsSlice;
      dispatch(setEvents(events));
    }

    navigate("/game/dashboard");
  };

  const deleteSave = (deletedSave: LocalStorageSaveData) => {
    const savesJSON = localStorage.getItem("saves");
    if (savesJSON !== null) {
      localStorage.setItem(
        "saves",
        JSON.stringify(
          (JSON.parse(savesJSON) as LocalStorageSavesValue).filter(
            (save) => save.saveName !== deletedSave.saveName
          )
        )
      );
    }

    localStorage.removeItem(`users-${deletedSave.saveName}`);
    localStorage.removeItem(`events-${deletedSave.saveName}`);
    localStorage.removeItem(`contest-${deletedSave.saveName}`);
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
            The game uses autosave, so don&apos;`t worry about losing your
            progress.
          </li>
        </ul>
      </div>
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
                  onClick={(_e) => {
                    loadSave(save);
                  }}
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
