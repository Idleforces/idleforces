import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import {
  selectNoPlayerContestSimSpeed,
  setNoPlayerContestSimSpeed,
} from "../../../../app/view/view-slice";
import "./speed-sim-slider.css";

export const SpeedSimSlider = () => {
  const noPlayerContestSimSpeed = useAppSelector(selectNoPlayerContestSimSpeed);
  const dispatch = useAppDispatch();

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
          dispatch(setNoPlayerContestSimSpeed(Number(e.target.value)));
        }}
        onKeyDown={(e) => {
          if (e.key === "6" || e.key === "8" || e.key === "PageUp")
            dispatch(
              setNoPlayerContestSimSpeed(
                Math.min(1, noPlayerContestSimSpeed + 0.1)
              )
            );
          if (e.key === "2" || e.key === "4" || e.key === "PageDown")
            dispatch(
              setNoPlayerContestSimSpeed(
                Math.max(0, noPlayerContestSimSpeed - 0.1)
              )
            );
        }}
        list="speed-sim-values"
      />
      <datalist id="speed-sim-values">
        <option value="0" label="MIN"></option>
        <option value="1" label="MAX"></option>
      </datalist>
    </div>
  );
};
