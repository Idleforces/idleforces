import { ContestInfoBox } from "./contest-info-box/contest-info-box";
import type { MouseEventHandler } from "react";
import { SpeedSimSlider } from "./speed-sim-slider/speed-sim-slider";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  resetContest,
  selectContestFinished,
} from "../../../app/contest/contest-slice";
import { useNavigate } from "react-router";
import { resetEvents } from "../../../app/events/events-slice";
import { selectActivity, setActivity } from "../../../app/save/save-slice";
import "./contest.css";
import { useLocation } from "react-router";
import { SubmissionsFilterBox } from "./submissions-filter-box/submissions-filter-box";

export const ContestSideBar = () => {
  const contestFinished = useAppSelector(selectContestFinished);
  const activity = useAppSelector(selectActivity);
  const playerParticipating = activity === "contest-participation";

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const endContest: MouseEventHandler<HTMLButtonElement> = (_e) => {
    dispatch(resetContest(null));
    dispatch(resetEvents(null));
    dispatch(setActivity(null));
    setActivity(null);

    navigate("/game/dashboard");
  };

  return (
    <div id="contest-sidebar">
      <ContestInfoBox />
      {!playerParticipating ? <SpeedSimSlider /> : <></>}

      {
        <button
          type="button"
          disabled={contestFinished === null || !contestFinished}
          onClick={endContest}
          tabIndex={0}
          style={{ marginBottom: "1rem" }}
        >
          End contest
        </button>
      }

      {location.pathname.includes("status") ? <SubmissionsFilterBox /> : <></>}
    </div>
  );
};
