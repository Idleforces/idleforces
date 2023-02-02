import { useNavigate } from "react-router";
import { BOOKS_DATA } from "../../app/books/books";
import { setBooksSlice } from "../../app/books/books-slice";
import type { BooksSlice } from "../../app/books/books-slice";
import { computeInitialBookReadingData } from "../../app/books/read-book";
import { computeBookLengthByHoursToRead } from "../../app/books/utils";
import { setContestArchive } from "../../app/contest-archive/contest-archive-slice";
import type { ContestArchiveSlice } from "../../app/contest-archive/types";
import { setContest } from "../../app/contest/contest-slice";
import type { ContestSlice } from "../../app/contest/types";
import { setEvents } from "../../app/events/events-slice";
import type { EventsSlice } from "../../app/events/types";
import { setFriends } from "../../app/friends/friends-slice";
import type { FriendsSlice } from "../../app/friends/types";
import { useAppDispatch } from "../../app/hooks";
import { setActivity, setSaveData } from "../../app/save/save-slice";
import { loadOrGenerateUsers } from "../../app/users/load-users";
import { setUsers } from "../../app/users/users-slice";
import type {
  LocalStorageSaveData,
  LocalStorageSavesValue,
} from "../game/types";
import { RatingStyled } from "../game/utils/styled-rating";
import { countriesCount, populateCountriesCount } from "./countries-count";
import type { Dispatch, SetStateAction } from "react";
import { getSavesFromLocalStorage } from "../persist-data/persist-data";
import "./index.css";
import { RightToBracket } from "../../icons/right-to-bracket";
import { TrashCan } from "../../icons/trash-can";

export const SaveBox = (props: {
  saves: LocalStorageSavesValue;
  setSaves: Dispatch<SetStateAction<LocalStorageSavesValue>>;
}) => {
  const { saves, setSaves } = props;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loadSave = (saveData: LocalStorageSaveData) => {
    const saveName = saveData.saveName;
    const usersWithTimeOfSnapshot = loadOrGenerateUsers(
      saveName,
      saveData.handle
    );
    if (!countriesCount.size)
      populateCountriesCount(usersWithTimeOfSnapshot.NPCs);

    dispatch(setSaveData(saveData));
    dispatch(setUsers(usersWithTimeOfSnapshot));

    if (
      saveData.activity === "contest-participation" ||
      saveData.activity === "contest-simulation"
    ) {
      const contest = JSON.parse(
        localStorage.getItem(`contest-${saveName}`) as string
      ) as ContestSlice;

      if (contest) {
        dispatch(setActivity(saveData.activity));
        dispatch(setContest(contest));
      }

      const events = JSON.parse(
        localStorage.getItem(`events-${saveName}`) as string
      ) as EventsSlice;
      dispatch(setEvents(events));
    }

    const contestArchive = (JSON.parse(
      localStorage.getItem(`archive-contest-${saveName}`) as string
    ) ?? []) as ContestArchiveSlice;
    dispatch(setContestArchive(contestArchive));

    const friends = (JSON.parse(
      localStorage.getItem(`friends-${saveName}`) as string
    ) ?? []) as FriendsSlice;
    dispatch(setFriends(friends));

    const booksReadingData = (JSON.parse(
      localStorage.getItem(`books-${saveName}`) as string
    ) ??
      BOOKS_DATA.map((bookData) =>
        computeInitialBookReadingData(
          computeBookLengthByHoursToRead(bookData.hoursToRead),
          bookData.id
        )
      )) as BooksSlice;
    dispatch(setBooksSlice(booksReadingData));

    navigate("/game/dashboard");
  };

  const deleteSave = (deletedSave: LocalStorageSaveData) => {
    const isDeleted = confirm(
      `Are you sure you want to delete the save '${deletedSave.saveName}'?`
    );

    if (isDeleted) {
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
      localStorage.removeItem(`archive-contest-${deletedSave.saveName}`);
      localStorage.removeItem(`friends-${deletedSave.saveName}`);
      localStorage.removeItem(`books-${deletedSave.saveName}`);

      setSaves(getSavesFromLocalStorage);
    }
  };

  return saves.length ? (
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
            <RatingStyled rating={save.rating} stringToStyle={save.handle} />
          </span>
          <span>{Math.round(save.rating)}</span>
          <span className="saves-action-container">
            <button
              type="button"
              className="save-box-button remove-default-styles"
              aria-label={`Load save ${save.saveName}`}
              onClick={(_e) => {
                loadSave(save);
              }}
            >
              <RightToBracket />
            </button>
            <button
              type="button"
              className="save-box-button remove-default-styles"
              aria-label={`Delete save ${save.saveName}`}
              onClick={(_e) => {
                deleteSave(save);
              }}
            >
              <TrashCan />
            </button>
          </span>
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
};
