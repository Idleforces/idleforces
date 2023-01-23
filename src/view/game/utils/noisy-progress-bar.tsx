import { useMemo } from "react";
import { normal } from "@stdlib/random/base";

const formatTicksRemaining = (ticksRemaining: number) => {
  if (ticksRemaining < 60) return "< 1 minute";
  else
    return `${Math.floor(ticksRemaining / 60)}-${
      Math.floor(ticksRemaining / 60) + 1
    } minutes`;
};

export const NoisyProgressBar = (props: {
  noiseLevel: number;
  progress: number;
  increment: number;
  valMutatedAtUpdates: unknown;
}) => {
  const { noiseLevel, progress, increment, valMutatedAtUpdates } = props;

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

  return <>{noisyTicksRemainingArray[ticksRemaining]}</>;
};
