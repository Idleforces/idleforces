import type { Dispatch, SetStateAction } from "react";
import "./speed-sim-slider.css";

export const SpeedSimSlider = (props: {
  noPlayerContestSimSpeed: number;
  setNoPlayerContestSimSpeed: Dispatch<SetStateAction<number>>;
}) => {
  const noPlayerContestSimSpeed = props.noPlayerContestSimSpeed;
  const setNoPlayerContestSimSpeed = props.setNoPlayerContestSimSpeed;

  return (
    <div className="slider-container">
      <label htmlFor="speed-sim-slider">Modify contest simulation speed</label>
      <br />
      <input
        type="range"
        min="0"
        max="1"
        step="any"
        name="speed-sim-slider"
        value={noPlayerContestSimSpeed}
        onChange={(e) => {
          setNoPlayerContestSimSpeed(Number(e.target.value));
        }}
        onKeyDown={(e) => {
          if (e.key === "6" || e.key === "8" || e.key === "PageUp")
            setNoPlayerContestSimSpeed((prev) => Math.min(1, prev + 0.1));
          if (e.key === "2" || e.key === "4" || e.key === "PageDown")
            setNoPlayerContestSimSpeed((prev) => Math.max(0, prev - 0.1));
        }}
        list="speed-sim-values"
      ></input>
      <datalist id="speed-sim-values">
        <option value="0" label="MIN"></option>
        <option value="1" label="MAX"></option>
      </datalist>
    </div>
  );
};
