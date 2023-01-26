import "./bar.css";
import { FormattedDiff } from "./formatted-diff";

export type BarProps = {
  kind: "gradient";
  gradientLeftColor: string;
  gradientMidColor: string;
  gradientRightColor: string;
} & {
  labelPosition: "inline" | "below";
  leftLabel: string;
  rightLabel: string;
  ratioFilled: number;
  centerDiff?: number;
};

export const Bar = (props: BarProps) => {
  const { labelPosition, leftLabel, rightLabel, ratioFilled, centerDiff } =
    props;

  const percentageFilled = ratioFilled * 100;

  const bar: JSX.Element = (
    <div
      className="gradient-bar"
      style={{
        background: `linear-gradient(90deg, ${props.gradientLeftColor} 0%, ${
          props.gradientMidColor
        } ${percentageFilled / 2}%,${
          props.gradientRightColor
        } ${percentageFilled}% ,white ${percentageFilled}%)`,
      }}
    >
      {centerDiff !== undefined ? <FormattedDiff diff={centerDiff} /> : <></>}
    </div>
  );

  if (labelPosition === "below")
    return (
      <div className={`bar-data-container bar-data-container-${labelPosition}`}>
        <div className={`bar-container bar-container-${labelPosition}`}>
          {bar}
        </div>
        <span className="attribute-label">{leftLabel}</span>
        <span className="attribute-label">{rightLabel}</span>
      </div>
    );
  else
    return (
      <div className={`bar-data-container bar-data-container-${labelPosition}`}>
        <span className="attribute-label">{leftLabel}</span>
        <div className={`bar-container bar-container-${labelPosition}`}>
          {bar}
        </div>
        <span className="attribute-label">{rightLabel}</span>
      </div>
    );
};
