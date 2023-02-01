/* eslint-disable react/jsx-key */
import { reverse } from "lodash";
import { useState } from "react";
import { useParams } from "react-router";
import { selectArchivedContests } from "../../../../app/contest-archive/contest-archive-slice";
import { useAppSelector } from "../../../../app/hooks";
import { selectUsers } from "../../../../app/users/users-slice";
import { SubNavBar } from "../../navbars/sub-navbar";
import { DataTable } from "../../utils/datatable";
import { DataTableSortIcon } from "../../utils/datatable-sort-icon";
import {
  computeColorOfRatingStyled,
  RatingStyled,
} from "../../utils/styled-rating";
import { computeUserTitle } from "../../utils/user-titles";

type ContestsDisplayedObject = {
  index: number;
  contestName: string;
  timestamp: number;
  newRating: number;
  ratingDiff: number;
  title: string;
  prevTitle: string;
  prevRating: number;
};

type ContestsSortBy = "index" | "rating-change" | "new-rating";

export const ProfileContests = () => {
  const { handle } = useParams();
  const users = useAppSelector(selectUsers);
  const user = users ? users.find((user) => user.handle === handle) : undefined;
  const contestArchive = useAppSelector(selectArchivedContests);

  const [contestsSortBy, setContestsSortBy] = useState<ContestsSortBy>("index");
  const [reverseContests, setReverseContests] = useState(true);

  if (handle === undefined || !users || !user)
    return <h1 style={{ color: "gray" }}> User not found.</h1>;

  const ratingHistory = user.ratingHistory;
  const ratingHistoryWithoutInitial = ratingHistory.slice(1);

  const displayedObjects: Array<ContestsDisplayedObject> =
    ratingHistoryWithoutInitial.map((ratingPoint, index) => {
      const prevRatingPoint = ratingHistory[index];
      const contestName = ratingPoint.contestName ?? "Contest not found";
      const timestamp =
        contestArchive.find((contest) => contest.name === contestName)
          ?.timestamp ?? NaN;
      const newRating = Math.round(ratingPoint.rating);
      const prevRating = Math.round(prevRatingPoint.rating);
      const ratingDiff = newRating - prevRating;

      const title = computeUserTitle(newRating);
      const prevTitle = computeUserTitle(prevRating);

      return {
        index: index + 1,
        contestName,
        timestamp,
        newRating,
        ratingDiff,
        title,
        prevTitle,
        prevRating,
      };
    });

  const displayedObjectsSorted = [...displayedObjects];
  if (contestsSortBy === "index")
    displayedObjectsSorted.sort((objA, objB) => objA.index - objB.index);
  if (contestsSortBy === "new-rating")
    displayedObjectsSorted.sort(
      (objA, objB) => objA.newRating - objB.newRating
    );
  if (contestsSortBy === "rating-change")
    displayedObjectsSorted.sort(
      (objA, objB) => objA.ratingDiff - objB.ratingDiff
    );
  if (reverseContests) reverse(displayedObjectsSorted);

  const topRow = [
    <>
      <span style={{ padding: "0 0.2rem" }}>#</span>
      <DataTableSortIcon
        field="index"
        dataTableSortBy={contestsSortBy}
        setDataTableSortBy={setContestsSortBy}
        reverseDataTable={reverseContests}
        setReverseDataTable={setReverseContests}
      />
    </>,
    <>Contest</>,
    <>End time</>,
    <>
      <span style={{ padding: "0 0.2rem" }}>Rating change</span>
      <DataTableSortIcon
        field="rating-change"
        dataTableSortBy={contestsSortBy}
        setDataTableSortBy={setContestsSortBy}
        reverseDataTable={reverseContests}
        setReverseDataTable={setReverseContests}
      />
    </>,
    <>
      <span style={{ padding: "0 0.2rem" }}>New rating</span>
      <DataTableSortIcon
        field="new-rating"
        dataTableSortBy={contestsSortBy}
        setDataTableSortBy={setContestsSortBy}
        reverseDataTable={reverseContests}
        setReverseDataTable={setReverseContests}
      />
    </>,
    <></>,
  ];

  const dataTableContents: Array<Array<JSX.Element>> = [topRow].concat(
    displayedObjectsSorted.map((displayedObject) => [
      <>{displayedObject.index}</>,
      <span style={{ color: "darkblue", fontWeight: 500 }}>
        {displayedObject.contestName}
      </span>,
      <>{new Date(displayedObject.timestamp).toLocaleString()}</>,
      <span
        style={{
          color: displayedObject.ratingDiff > 0 ? "green" : "gray",
          fontWeight: 700,
        }}
      >
        {displayedObject.ratingDiff > 0 ? "+" : ""}
        {displayedObject.ratingDiff}
      </span>,
      <>{displayedObject.newRating}</>,
      displayedObject.prevTitle !== displayedObject.title ? (
        <>
          <div>
            Became{" "}
            <RatingStyled
              stringToStyle={displayedObject.title}
              rating={displayedObject.newRating}
            />
          </div>
          {computeColorOfRatingStyled(displayedObject.newRating) !==
          computeColorOfRatingStyled(displayedObject.prevRating) ? (
            <div>
              <RatingStyled
                stringToStyle={handle}
                rating={displayedObject.prevRating}
              />
              &nbsp;→&nbsp;
              <RatingStyled
                stringToStyle={handle}
                rating={displayedObject.newRating}
              />
            </div>
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      ),
    ])
  );

  const dataTable = (
    <DataTable
      contents={dataTableContents}
      containerBorderRadiusPx={5}
      topText={"Contests"}
    />
  );

  return (
    <>
      <SubNavBar
        pages={[`${handle}`, "contests"]}
        baseURL="/game/profile/"
        handle={handle}
      />
      <div id="profile-contests-page">
        <h3 style={{ fontWeight: 500 }}>Contests</h3>
        {dataTable}
      </div>
    </>
  );
};
