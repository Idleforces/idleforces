import "./bar.css";

export type BarProps = {
  kind: "gradient";
  gradientLeftColor: string;
  gradientMidColor: string;
  gradientRightColor: string;
} & {
  labelPosition: "inline" | "below";
  leftLabel: string;
  rightLabel: string;
};

export const Bar = (props: BarProps) => {
  const { labelPosition, leftLabel, rightLabel } = props;

  const bar: JSX.Element = (
    <div
      className="gradient-bar"
      style={{
        background: `linear-gradient(90deg, ${props.gradientLeftColor} 0%, ${props.gradientMidColor} 50%,${props.gradientRightColor} 100%)`,
      }}
    ></div>
  );

  if (labelPosition === "below")
    return (
      <div className={`bar-data-container bar-data-container-${labelPosition}`}>
        <div className={`bar-container bar-container-${labelPosition}`}>
          {bar}
        </div>
        {leftLabel}
        {rightLabel}
      </div>
    );
  else
    return (
      <div className={`bar-data-container bar-data-container-${labelPosition}`}>
        {leftLabel}
        <div className={`bar-container bar-container-${labelPosition}`}>
          {bar}
        </div>
        {rightLabel}
      </div>
    );
};
