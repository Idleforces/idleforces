/* eslint-disable react/jsx-key */
import { cloneDeep } from "lodash";
import { Link } from "react-router-dom";
import { computeRanksConsideringTies } from "../../../app/contest/recalculate-ratings";
import { useAppSelector } from "../../../app/hooks";
import { selectUsers } from "../../../app/users/users-slice";
import { transposeArray } from "../../../utils/utils";
import { DataTable } from "../utils/datatable";
import { InfoBox } from "../utils/info-box";
import { RatingStyled } from "../utils/styled-rating";

export const TopRated = () => {
  const users = useAppSelector(selectUsers);
  if (!users) return <></>;

  const sortedUsers = cloneDeep(users)
    .sort(
      (a, b) =>
        b.ratingHistory.slice(-1)[0].rating -
        a.ratingHistory.slice(-1)[0].rating
    )
    .slice(0, 10);

  const ratings = sortedUsers.map(
    (user) => user.ratingHistory.slice(-1)[0].rating
  );

  const handlesColumn = sortedUsers.map((user, index) => (
    <Link to={`/game/profile/${user.handle}`}>
      <RatingStyled stringToStyle={user.handle} rating={ratings[index]} />
    </Link>
  ));
  const ranksColumn = computeRanksConsideringTies(ratings).map((rank) => (
    <>{rank}</>
  ));
  const ratingsColumn = ratings.map((rating) => <>{Math.round(rating)}</>);

  const topRow = [<>#</>, <>User</>, <>Rating</>];
  const bottomRow = [
    <span style={{ width: "100%", display: "flex", justifyContent: "flex-end"}}>
      <Link to="/game/rating" className="keep-default-style">View all →</Link>
    </span>,
  ];

  const dataTableContents: Array<Array<JSX.Element>> = [topRow]
    .concat(
      transposeArray(
        [ranksColumn].concat([handlesColumn]).concat([ratingsColumn])
      )
    )
    .concat([bottomRow]);

  const colspanValues = Array(11)
    .fill(0)
    .map((_) => [1, 1, 1])
    .concat([[3]]);


  const dataTable = (
    <DataTable
      contents={dataTableContents}
      colspanValues={colspanValues}
      tableClassName="datatable-no-outer-border"
    />
  );

  return <InfoBox topText="Top rated" content={dataTable} contentPadding="0" />;
};
