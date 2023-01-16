import { ContestInfoBox } from "./contest-info-box/contest-info-box";
import type { Dispatch, MouseEventHandler, SetStateAction } from "react";
import type { ContestTypeRunning } from "../types";
import { SpeedSimSlider } from "./speed-sim-slider/speed-sim-slider";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { resetContest, selectContestFinished } from "../../../app/contest/contest-slice";
import { useNavigate } from "react-router";
import { resetEvents } from "../../../app/events/events-slice";
import { setInContest } from "../../../app/save/save-slice";
import "./contest.css";

export const ContestSideBar = (props: {
  noPlayerContestSimSpeed: number;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
  contestTypeRunning: ContestTypeRunning;
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>;

}) => {
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;
  const playerParticipating =
    props.contestTypeRunning?.playerParticipating ?? false;

  const contestFinished = useAppSelector(selectContestFinished);

  const setContestTypeRunning = props.setContestTypeRunning;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const endContest: MouseEventHandler<HTMLButtonElement> = (_e) => {
    dispatch(resetContest(null));
    dispatch(resetEvents(null));
    dispatch(setInContest(false));
    setContestTypeRunning(null);

    navigate("/game/dashboard");
  };

  return (
    <div id="contest-sidebar">
      <ContestInfoBox />
      {!playerParticipating ? (
        <SpeedSimSlider
          noPlayerContestSimSpeed={noPlayerContestSimSpeed}
          setNoPlayerContestSimSpeed={setNoPlayerContestSimSpeed}
        />
      ) : (
        <></>
      )}
      {
        <button
          disabled={contestFinished === null || !contestFinished}
          onClick={endContest}
          tabIndex={0}
        >
          End contest
        </button>
      }
    </div>
  );
};
