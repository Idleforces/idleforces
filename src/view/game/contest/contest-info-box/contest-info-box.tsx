/* eslint-disable react/jsx-key */
import { CONTEST_LENGTH } from "../../../../app/contest/constants";
import {
  selectContestFinished,
  selectContestName,
  selectTicksSinceBeginning,
} from "../../../../app/contest/contest-slice";
import { useAppSelector } from "../../../../app/hooks";
import { convertSecondsToHHMMSS } from "../../../../utils/time-format";
import { DataTable } from "../../utils/datatable";

export const ContestInfoBox = () => {
  const ticksSinceBeginning = useAppSelector(selectTicksSinceBeginning);
  const contestName = useAppSelector(selectContestName);
  const contestFinished = useAppSelector(selectContestFinished);
  if (
    ticksSinceBeginning === null ||
    contestName === null ||
    contestFinished === null
  )
    return <></>;

  const dataTableContents = [
    [
      <span
        style={{
          borderBottom: "2px solid black",
          fontWeight: 700,
        }}
      >
        {contestName}
      </span>,
    ],
    [
      <span
        style={{
          color: "blue",
          fontWeight: 600,
        }}
      >
        {contestFinished ? "Contest has contestFinished" : "Contest is running"}
      </span>,
    ],

    [
      contestFinished ? (
        <></>
      ) : (
        <div id="time-left-container" style={{ fontWeight: 500 }}>
          {convertSecondsToHHMMSS(
            Math.max(CONTEST_LENGTH - ticksSinceBeginning, 0)
          )}
        </div>
      ),
    ],
  ];

  return (
    <div style={{ marginBottom: "1rem" }}>
      <DataTable contents={dataTableContents} />
    </div>
  );
};
