/* eslint-disable react/jsx-key */
import { cloneDeep, reverse } from "lodash";
import { selectArchivedContests } from "../../../app/contest-archive/contest-archive-slice";
import { selectContestDivision } from "../../../app/contest/contest-slice";
import { useAppSelector } from "../../../app/hooks";
import { problemDivisions } from "../../../app/problems/types";
import {
  selectSecondsSincePageLoad,
  selectTimestampAtPageLoad,
} from "../../../app/view/view-slice";
import { convertSecondsToHHMMSS } from "../../../utils/time-format";
import { transposeArray } from "../../../utils/utils";
import { computeContestCooldownSecondsRemaining } from "../pages/contests";
import { DataTable } from "../utils/datatable";
import { InfoBox } from "../utils/info-box";

export const CooldownsInfoBox = () => {
  const timestampAtPageLoad = useAppSelector(selectTimestampAtPageLoad);
  const secondsSincePageLoad = useAppSelector(selectSecondsSincePageLoad);
  const contestArchive = useAppSelector(selectArchivedContests);
  const runningContestDivision = useAppSelector(selectContestDivision);

  const divisionsColumn = [<>4</>, <>3</>, <>2</>, <>1</>];
  const reverseProblemDivisions = reverse(cloneDeep(problemDivisions));

  const cooldownsColumn = reverseProblemDivisions
    .map((division) =>
      computeContestCooldownSecondsRemaining(
        division,
        contestArchive,
        timestampAtPageLoad,
        secondsSincePageLoad
      )
    )
    .map((cooldown, index) =>
      runningContestDivision === reverseProblemDivisions[index] ? (
        <div style={{ color: "gray" }}>running!</div>
      ) : cooldown <= 0 ? (
        <div style={{ color: "gray" }}>can start now!</div>
      ) : (
        <div style={{ color: "gray" }}>{convertSecondsToHHMMSS(cooldown)}</div>
      )
    );

  const topRow = [<>Div</>, <>Time until</>];
  const dataTableContents: Array<Array<JSX.Element>> = [topRow].concat(
    transposeArray([divisionsColumn].concat([cooldownsColumn]))
  );

  const dataTable = (
    <DataTable
      contents={dataTableContents}
      tableClassName={"datatable-no-outer-border"}
    />
  );

  return (
    <InfoBox
      content={dataTable}
      topText="Pay attention"
      borderRadius="0.5rem"
      contentPadding="0"
    />
  );
};
