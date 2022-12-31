import type { Dispatch, SetStateAction } from "react";

export const SpeedSimSlider = (props: {
  noPlayerContestSimSpeed: number;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
}) => {
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;

  return (
    <div className="slider-container">
      <label htmlFor="speed-sim-slider">Modify contest simulation speed</label>
      <input
        type="range"
        min="0"
        max="1"
        step="any"
        value={noPlayerContestSimSpeed}
        onChange={(e) => {
          setNoPlayerContestSimSpeed(Number(e.target.value));
        }}
      ></input>
    </div>
  );
};
