/* eslint-disable react/jsx-key */
import { cloneDeep } from "lodash";
import { useState } from "react";
import { computeRanksConsideringTies } from "../../../app/contest/recalculate-ratings";
import { useAppSelector } from "../../../app/hooks";
import { selectUsers } from "../../../app/users/users-slice";
import { transposeArray } from "../../../utils/utils";
import { NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE } from "../../constants";
import { DataTable } from "../utils/datatable";
import { Flag } from "../utils/flag";
import { RankingPageLinks } from "../utils/ranking-page-links";
import { RatingStyled } from "../utils/styled-rating";
import "./rating.css";

export const Rating = () => {
  const users = useAppSelector(selectUsers);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);

  if (!users) return <></>;
  const minIndex = (selectedPage - 1) * NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE;
  const maxIndex = selectedPage * NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE;

  const unslicedFilteredUsers = cloneDeep(users)
    .sort(
      (a, b) =>
        b.ratingHistory.slice(-1)[0].rating -
        a.ratingHistory.slice(-1)[0].rating
    )
    .filter((user) => country === null || user.country === country);
  const unslicedRatings = unslicedFilteredUsers.map(
    (user) => user.ratingHistory.slice(-1)[0].rating
  );
  const unslicedRanks = computeRanksConsideringTies(unslicedRatings);

  const filteredUsers = unslicedFilteredUsers.slice(minIndex, maxIndex);

  const unfilteredRatings = users.map(
    (user) => user.ratingHistory.slice(-1)[0].rating
  );
  const unfilteredRanks = computeRanksConsideringTies(unfilteredRatings);

  const ranksColumn = unslicedRanks.map((rank, index) => {
    if (country === null && !friendsOnly) return <>{rank}</>;
    else
      return (
        <>
          {rank} {unfilteredRanks[index]}
        </>
      );
  }).slice(minIndex, maxIndex);

  const ratingsColumn = unslicedRatings.slice(minIndex, maxIndex).map((rating) => <>{Math.round(rating)}</>);
  const handlesColumn = filteredUsers.map((user) => (
    <div style={{ textAlign: "left" }}>
      <Flag countryName={user.country} />
      <RatingStyled
        stringToStyle={user.handle}
        rating={Math.round(user.ratingHistory.slice(-1)[0].rating)}
      />
    </div>
  ));

  const numContestsColumn = filteredUsers.map((user) => (
    <>{user.ratingHistory.length - 1}</>
  ));

  const topRow = [<></>, <>Who</>, <>#</>, <>=</>];

  const dataTableContents = [topRow].concat(
    transposeArray(
      [ranksColumn]
        .concat([handlesColumn])
        .concat([numContestsColumn])
        .concat([ratingsColumn])
    )
  );

  return (
    <div id="rating-page">
      <DataTable contents={dataTableContents} />
      <RankingPageLinks
        setSelectedPage={setSelectedPage}
        dataLength={unslicedFilteredUsers.length}
        dataOnOnePage={NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE}
      />
    </div>
  );
};
