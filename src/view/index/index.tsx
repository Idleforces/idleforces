import { useState, useEffect } from "react";
import "./index.css";
import "../../fontawesome-styles.css";
import { getSavesFromLocalStorage } from "../persist-data/persist-data";

import { NewSaveForm } from "./new-save-form";
import { SaveBox } from "./save-box";
import { ImportExportBox } from "./import-export-box";

export const Index = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const [saves, setSaves] = useState(getSavesFromLocalStorage);

  useEffect(() => {
    document.title = "Idleforces";
  }, []);

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
            The game uses autosave, so don&apos;t worry about losing your
            progress.
          </li>
        </ul>
      </div>
      <NewSaveForm saves={saves} leaveGameRef={props.leaveGameRef} />
      <SaveBox saves={saves} setSaves={setSaves} />
      <ImportExportBox setSaves={setSaves} leaveGameRef={props.leaveGameRef} />
    </div>
  );
};
