import { useMemo } from "react";
import { normal } from "@stdlib/random/base";
import { useAppDispatch } from "../../../app/hooks";
import { setRemainingTimeToSolveByIndex } from "../../../app/view/view-slice";

const formatTicksRemaining = (ticksRemaining: number) => {
  if (ticksRemaining < 60) return " (< 1 minute)";
  else
    return ` (${Math.floor(ticksRemaining / 60)}-${
      Math.floor(ticksRemaining / 60) + 1
    } minutes)`;
};

/**
 * @param noiseStdev σ(remainingTime) / E(remainingTime)
 * */
export const NoisyProgressBar = (props: {
  noiseStdev: number;
  progress: number;
  increment: number;
  valMutatedAtUpdates: unknown;
  index: number;
}) => {
  const { noiseStdev, progress, increment, valMutatedAtUpdates, index } = props;

  const dispatch = useAppDispatch();

  const noiseLevel = Math.sqrt(3) * noiseStdev;

  const ticksRemaining = Math.max(Math.floor((1 - progress) / increment), 0);
  const noisyTicksRemainingArray = useMemo(() => {
    let curImpreciseTicksRemaining = 0;
    const resultNoisyArray = ["done"];

    for (let i = 1; i <= ticksRemaining; i++) {
      curImpreciseTicksRemaining += normal(1, noiseLevel * Math.sqrt(i));
      resultNoisyArray.push(formatTicksRemaining(curImpreciseTicksRemaining));
    }

    return resultNoisyArray;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valMutatedAtUpdates]);

  dispatch(
    setRemainingTimeToSolveByIndex({
      remainingTime: noisyTicksRemainingArray[ticksRemaining],
      index,
    })
  );

  return <></>;
};
