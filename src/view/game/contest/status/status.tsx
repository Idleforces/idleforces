/* eslint-disable react/jsx-key */
import { useMemo, useState } from "react";
import { useLocation } from "react-router";
import { selectContest } from "../../../../app/contest/contest-slice";
import type { ContestSlice } from "../../../../app/contest/types";
import { useAppSelector } from "../../../../app/hooks";
import { didSubmissionPass } from "../../../../app/problems/submit-problem";
import type {
  ContestSubmission,
  ContestSubmissionVerdict,
  ProblemPlacement,
} from "../../../../app/problems/types";
import { problemPlacements } from "../../../../app/problems/types";
import { selectUsers } from "../../../../app/users/users-slice";
import { convertSecondsToHHMMSS } from "../../../../utils/time-format";
import { transposeArray } from "../../../../utils/utils";
import { SUBMISSIONS_NO_ON_STATUS_PAGE } from "../../../constants";
import { DataTable } from "../../utils/datatable";
import { RankingPageLinks } from "../../utils/ranking-page-links";
import { RatingStyled } from "../../utils/styled-rating";

export type ContestSubmissionsFilterData = {
  problemPlacement: ProblemPlacement | null;
  verdict: ContestSubmissionVerdict | null;
  handle: string;
};

const computeSubmissionsWithHandleAndProblemPlacementFromContest = (
  contest: ContestSlice
): Array<
  ContestSubmission & { handle: string; problemPlacement: ProblemPlacement }
> => {
  if (contest)
    return contest.contestUsersData
      .map((contestUserData) => {
        return problemPlacements
          .map((placement) => {
            const submissions =
              contestUserData.problemSolveStatuses[placement].submissions;
            return submissions.map((submission) => {
              return {
                ...submission,
                handle: contestUserData.handle,
                problemPlacement: placement,
              };
            });
          })
          .flat();
      })
      .flat();
  else return [];
};

const filterSubmissions = (
  submissions: Array<
    ContestSubmission & { handle: string; problemPlacement: ProblemPlacement }
  >,
  submissionsFilterData: ContestSubmissionsFilterData
) => {
  return submissions.filter(
    (submission) =>
      (submission.problemPlacement === submissionsFilterData.problemPlacement ||
        submissionsFilterData.problemPlacement === null) &&
      (submission.verdict === submissionsFilterData.verdict ||
        submissionsFilterData.verdict === null) &&
      (submission.handle === submissionsFilterData.handle ||
        submissionsFilterData.handle === "")
  );
};

export const Status = (props: {
  submissionsFilterData: ContestSubmissionsFilterData;
}) => {
  const { submissionsFilterData } = props;
  const contest = useAppSelector(selectContest);
  const users = useAppSelector(selectUsers);

  const [selectedPage, setSelectedPage] = useState(1);

  const location = useLocation();

  const submissions: Array<
    ContestSubmission & { handle: string; problemPlacement: ProblemPlacement }
  > = useMemo(() => {
    return computeSubmissionsWithHandleAndProblemPlacementFromContest(contest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest?.ticksSinceBeginning]);

  const filteredSubmissions = useMemo(() => {
    return filterSubmissions(submissions, submissionsFilterData);
  }, [submissions, submissionsFilterData]);

  const sortedFilteredSubmissions = useMemo(
    () =>
      filteredSubmissions.sort(
        (submissionA, submissionB) =>
          submissionB.ticksSinceBeginning - submissionA.ticksSinceBeginning
      ),
    [filteredSubmissions]
  );

  if (!contest || !users) return <></>;

  const displayedSubmissions = sortedFilteredSubmissions.slice(
    SUBMISSIONS_NO_ON_STATUS_PAGE * (selectedPage - 1),
    SUBMISSIONS_NO_ON_STATUS_PAGE * selectedPage
  );

  const timestampsColumn = displayedSubmissions.map((submission) => (
    <>{convertSecondsToHHMMSS(submission.ticksSinceBeginning)}</>
  ));

  const userRatings = displayedSubmissions.map(
    (submission) =>
      users
        .find((user) => user.handle === submission.handle)
        ?.ratingHistory.slice(-1)[0].rating ?? 1400
  );

  const handlesColumn = displayedSubmissions.map((submission, index) => (
    <RatingStyled
      stringToStyle={submission.handle}
      rating={userRatings[index]}
    />
  ));

  const problemsColumn = displayedSubmissions.map((submission) => (
    <>{submission.problemPlacement}</>
  ));

  const verdictsColumn = displayedSubmissions.map((submission) => (
    <span
      className={`verdict-${
        didSubmissionPass(submission) ? "accepted" : "rejected"
      }`}
    >
      {submission.verdict}
    </span>
  ));

  const topRow = [<>When</>, <>Who</>, <>Problem</>, <>Verdict</>];

  const dataTableContents: Array<Array<JSX.Element>> = [topRow].concat(
    transposeArray([
      timestampsColumn,
      handlesColumn,
      problemsColumn,
      verdictsColumn,
    ])
  );

  const dataTable = (
    <DataTable
      contents={dataTableContents}
      topText={
        location.pathname.startsWith("/game/contest/my")
          ? "My submissions"
          : "Contest status"
      }
      containerBorderRadiusPx={5}
    />
  );

  return (
    <div id="status-page">
      {dataTable}
      <RankingPageLinks
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        dataLength={sortedFilteredSubmissions.length}
        dataOnOnePage={SUBMISSIONS_NO_ON_STATUS_PAGE}
        usePowerOfTwoGaps={true}
      />
    </div>
  );
};
