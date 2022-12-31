import type { Dispatch, SetStateAction } from "react";
import { Outlet } from "react-router";
import { ContestNavBar } from "./contest-navbar";
import { SpeedSimSlider } from "./speed-sim-slider";

export const Contest = (props: {
  noPlayerContestSimSpeed: number;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
}) => {
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;

  return (
    <>
      <ContestNavBar />
      <SpeedSimSlider
        noPlayerContestSimSpeed={noPlayerContestSimSpeed}
        setNoPlayerContestSimSpeed={setNoPlayerContestSimSpeed}
      />
      <Outlet />
    </>
  );
};
