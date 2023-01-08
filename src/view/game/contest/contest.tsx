import type { Dispatch, SetStateAction } from "react";
import { Outlet } from "react-router";
import { ContestNavBar } from "./contest-navbar";
import { SpeedSimSlider } from "./speed-sim-slider";
import { TimeLeft } from "./time-left";
import "./contest.css";

export const Contest = (props: {
  noPlayerContestSimSpeed: number;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
}) => {
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;

  return (
    <>
      <ContestNavBar />
      <div id="contest-ui">
        <div id="contest-main">
          <Outlet />
        </div>
        <div id="contest-sidebar">
          <SpeedSimSlider
            noPlayerContestSimSpeed={noPlayerContestSimSpeed}
            setNoPlayerContestSimSpeed={setNoPlayerContestSimSpeed}
          />
          <TimeLeft />
        </div>
      </div>
    </>
  );
};
