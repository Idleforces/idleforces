/* eslint-disable react/jsx-key */
import { cloneDeep } from "lodash";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { countriesCount } from "../..";
import { computeRanksConsideringTies } from "../../../app/contest/recalculate-ratings";
import { selectFriends } from "../../../app/friends/friends-slice";
import { useAppSelector } from "../../../app/hooks";
import { selectRatingsUpdatedCount, selectUsers } from "../../../app/users/users-slice";
import { transposeArray } from "../../../utils/utils";
import { NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE } from "../../constants";
import { DataTable } from "../utils/datatable";
import { Flag } from "../utils/flag";
import { RankingPageLinks } from "../utils/ranking-page-links";
import { RatingStyled } from "../utils/styled-rating";
import "./rating.css";

export const Rating = () => {
  const users = useAppSelector(selectUsers);
  const friends = useAppSelector(selectFriends);
  const ratingsUpdatedCount = useAppSelector(selectRatingsUpdatedCount);

  const [friendsOnly, setFriendsOnly] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);

  const sortedUsers = useMemo(
    () =>
      users
        ? cloneDeep(users).sort(
            (a, b) =>
              b.ratingHistory.slice(-1)[0].rating -
              a.ratingHistory.slice(-1)[0].rating
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ratingsUpdatedCount]
  );

  if (!users || !sortedUsers) return <></>;
  const minIndex = (selectedPage - 1) * NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE;
  const maxIndex = selectedPage * NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE;

  const unfilteredRatings = sortedUsers.map(
    (user) => user.ratingHistory.slice(-1)[0].rating
  );

  const unfilteredRanks = computeRanksConsideringTies(unfilteredRatings);

  const ranksRecord: Record<string, number> = {};
  sortedUsers.forEach((user, index) => {
    ranksRecord[user.handle] = unfilteredRanks[index];
  });

  const unslicedFilteredUsers = sortedUsers.filter(
    (user) =>
      (country === null || user.country === country) &&
      (!friendsOnly || friends.includes(user.handle))
  );
  const unslicedFilteredRatings = unslicedFilteredUsers.map(
    (user) => user.ratingHistory.slice(-1)[0].rating
  );
  const unslicedFilteredRanks = computeRanksConsideringTies(
    unslicedFilteredRatings
  );

  const displayedUsers = unslicedFilteredUsers.slice(minIndex, maxIndex);
  const displayedRanks = unslicedFilteredRanks.slice(minIndex, maxIndex);
  const displayedRatings = unslicedFilteredRatings.slice(minIndex, maxIndex);

  const ranksColumn = displayedUsers.map((user, index) => {
    if (country === null && !friendsOnly)
      return <>{ranksRecord[user.handle]}</>;
    else
      return (
        <>
          {displayedRanks[index]} ({ranksRecord[user.handle]})
        </>
      );
  });

  const ratingsColumn = displayedRatings.map((rating) => (
    <>{Math.round(rating)}</>
  ));

  const handlesColumn = displayedUsers.map((user) => (
    <div style={{ textAlign: "left" }}>
      <Flag countryName={user.country} />
      <Link to={`/game/profile/${user.handle}`}>
        <RatingStyled
          stringToStyle={user.handle}
          rating={Math.round(user.ratingHistory.slice(-1)[0].rating)}
        />
      </Link>
    </div>
  ));

  const numContestsColumn = displayedUsers.map((user) => (
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

  const countryNameOptions: Array<JSX.Element> = [
    <option value={"null"} key={"!!!-first-alphabetically"}>
      any country
    </option>,
  ];
  countriesCount.forEach((countryCount, countryName) => {
    countryNameOptions.push(
      <option value={countryName} key={countryName}>
        {countryName}, {countryCount}
      </option>
    );
  });
  countryNameOptions.sort((a, b) => String(a.key).localeCompare(String(b.key)));

  return (
    <div id="rating-page">
      <div id="rating-page-header">
        <div id="friends-only-container">
          <label htmlFor="friends-only-picker">Display friends only: </label>
          <input
            type="checkbox"
            checked={friendsOnly}
            onChange={(_e) => {
              setFriendsOnly((prev) => !prev);
              setSelectedPage(1);
            }}
            name="friends-only-picker"
            id="friends-only-picker"
          />
        </div>
        <div id="country-name-picker-container">
          <label htmlFor="country-name-picker">Country: </label>
          <select
            onChange={(e) => {
              setCountry(e.target.value === "null" ? null : e.target.value);
              setSelectedPage(1);
            }}
            name="country-name-picker"
            id="country-name-picker"
          >
            {countryNameOptions}
          </select>
        </div>
      </div>
      <DataTable contents={dataTableContents} />
      <RankingPageLinks
        setSelectedPage={setSelectedPage}
        dataLength={unslicedFilteredUsers.length}
        dataOnOnePage={NUMBER_OF_USERS_SHOWN_ON_RATING_PAGE}
      />
    </div>
  );
};
