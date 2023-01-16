import { cloneDeep, reverse } from "lodash";
import { useState } from "react";
import { useParams } from "react-router";
import { selectArchivedContests } from "../../../../app/contest-archive/contest-archive-slice";
import { useAppSelector } from "../../../../app/hooks";
import { selectUsers } from "../../../../app/users/users-slice";

export const ProfileContests = () => {
  const { handle } = useParams();
  const users = useAppSelector(selectUsers);
  const user = users ? users.find((user) => user.handle === handle) : undefined;
  const contestArchive = useAppSelector(selectArchivedContests);
  const [reverseRatingHistory, setReverseRatingHistory] = useState(true);

  if (handle === undefined || !users || !user) return <></>;

  const displayedRatingHistory = reverseRatingHistory
    ? reverse(cloneDeep(user).ratingHistory)
    : user.ratingHistory;

  const indexColumn = displayedRatingHistory.map((_, index) =>
    reverseRatingHistory ? displayedRatingHistory.length - index : index + 1
  );

  return <></>;
};
