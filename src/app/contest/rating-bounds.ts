import type { ProblemDivision } from "../problems/types";
import type { User } from "../users/types";

const isWithinRatingBound = (rating: number, division: ProblemDivision) => {
  switch (division) {
    case 1:
      return rating >= 1900;
    case 2:
      return rating <= 2100;
    case 3:
      return rating <= 1600;
    case 4:
      return rating <= 1400;
  }
};

export const filterUsersSatisfyingRatingBound = (
  users: Array<User>,
  division: ProblemDivision
) => {
  return users.filter((user) =>
    isWithinRatingBound(user.ratingHistory.slice(-1)[0].rating, division)
  );
};
