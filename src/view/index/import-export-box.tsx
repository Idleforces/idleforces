import { useState } from "react";
import type { Dispatch, SetStateAction} from "react";
import type { LocalStorageSavesValue } from "../game/types";
import {
  computeSaveNamesFromGameData,
  exportGameData,
  importGameData,
} from "../persist-data/import-export";
import { getSavesFromLocalStorage } from "../persist-data/persist-data";
import "./index.css";


const catchImportExportError = (
  e: unknown,
  setImportExportInfo: Dispatch<SetStateAction<string | null>>
) => {
  if (
    typeof e === "object" &&
    e &&
    "message" in e &&
    typeof e.message === "string"
  )
    setImportExportInfo(e.message);
  else setImportExportInfo("Unknown error occurred");
};

export const ImportExportBox = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
  setSaves: Dispatch<SetStateAction<LocalStorageSavesValue>>;
}) => {
  const { setSaves } = props;
  const [importExportInfo, setImportExportInfo] = useState<string | null>(null);
  const [clipboardTextFirefox, setClipboardTextFirefox] = useState("");

  const leaveGame = props.leaveGameRef.current;

  const handleImportGameData = async (clipboardText: string) => {
    const saveNames = computeSaveNamesFromGameData(clipboardText);
    if (!saveNames.length) {
      setImportExportInfo("Error: Could not find saves.");
      return;
    }

    await importGameData(clipboardText, leaveGame);
    setImportExportInfo(`Saves [${saveNames.join()}] successfully imported`);
    setSaves(getSavesFromLocalStorage);
  };

  return (
    <div id="import-export-container">
      <div id="import-export-container-header">
        Or, import or export saves between devices.
      </div>
      {!navigator.userAgent.includes("Firefox") ? (
        <button
          type="submit"
          onClick={(_e) => {
            try {
              navigator.clipboard
                .readText()
                .then((clipboardText) => handleImportGameData(clipboardText))
                .catch((e: unknown) => {
                  catchImportExportError(e, setImportExportInfo);
                });
            } catch (e: unknown) {
              catchImportExportError(e, setImportExportInfo);
              setImportExportInfo(
                (prev) =>
                  (prev ?? "") +
                  "\r\n It seems like your browser disallows accessing clipboard content due to security reasons. Please report the browser you are using."
              );
            }
          }}
        >
          Import saves
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleImportGameData(clipboardTextFirefox).catch((e: unknown) => {
              catchImportExportError(e, setImportExportInfo);
            });
          }}
        >
          <label htmlFor="input-game-data">Game data:</label>
          <input
            type="text"
            value={clipboardTextFirefox}
            onChange={(e) => {
              setClipboardTextFirefox(e.target.value);
            }}
            name="input-game-data"
            id="input-game-data"
            required
          />
          <input type="submit" value="Import saves" />
        </form>
      )}
      <button
        type="submit"
        onClick={(_e) => {
          navigator.clipboard
            .writeText(exportGameData())
            .then(() => {
              setImportExportInfo("Game data successfully exported");
            })
            .catch((e: unknown) => {
              catchImportExportError(e, setImportExportInfo);
            });
        }}
      >
        Export saves
      </button>
      {importExportInfo !== null ? (
        <div
          className={
            importExportInfo.includes("successful") ? "dark-green" : "dark-red"
          }
        >
          {importExportInfo}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
