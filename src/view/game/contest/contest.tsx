import type { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { Outlet, useNavigate } from "react-router";
import { ContestNavBar } from "./contest-navbar/contest-navbar";
import { SpeedSimSlider } from "./speed-sim-slider/speed-sim-slider";
import { ContestInfoBox } from "./contest-info-box/contest-info-box";
import "./contest.css";
import type { ContestTypeRunning } from "../types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  resetContest,
  selectContestFinished,
} from "../../../app/contest/contest-slice";
import { resetEvents } from "../../../app/events/events-slice";
import { setInContest } from "../../../app/save/save-slice";
import type { RatingRecomputeData } from "./standings/standings";

export const Contest = (props: {
  noPlayerContestSimSpeed: number;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
  contestTypeRunning: ContestTypeRunning;
  setContestTypeRunning: Dispatch<SetStateAction<ContestTypeRunning>>;
  setRatingRecomputeData: Dispatch<SetStateAction<RatingRecomputeData>>;
}) => {
  const setRatingRecomputeData = props.setRatingRecomputeData;
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;
  const playerParticipating =
    props.contestTypeRunning?.playerParticipating ?? false;
  const setContestTypeRunning = props.setContestTypeRunning;

  const contestFinished = useAppSelector(selectContestFinished);

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
    <>
      <ContestNavBar setRatingRecomputeData={setRatingRecomputeData} />
      <div id="contest-ui">
        <div id="contest-main">
          <Outlet />
        </div>
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
      </div>
    </>
  );
};
