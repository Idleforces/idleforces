import { CONTEST_LENGTH } from "../../../app/contest/constants";
import { selectTicksSinceBeginning } from "../../../app/contest/contest-slice";
import { useAppSelector } from "../../../app/hooks";
import { convertSecondsToHHMMSS } from "../../../utils/time-format";

export const TimeLeft = () => {
  const ticksSinceBeginning = useAppSelector(selectTicksSinceBeginning);

  if (ticksSinceBeginning === null) return <></>;
  return (
    <div id="time-left-container" style={{ fontSize: "3rem" }}>
      {convertSecondsToHHMMSS(
        Math.max(CONTEST_LENGTH - ticksSinceBeginning, 0)
      )}
    </div>
  );
};
