import type { Dispatch, SetStateAction } from "react";
import { Outlet } from "react-router";
import { SubNavBar } from "../sub-navbar";
import "./contest.css";

import type { RatingRecomputeData } from "./standings/standings";
import type { ContestSubmissionsFilterData } from "./status/status";

export const Contest = (props: {
  setRatingRecomputeData: Dispatch<SetStateAction<RatingRecomputeData>>;
  setContestSubmissionsFilterData: Dispatch<SetStateAction<ContestSubmissionsFilterData>>;
}) => {
  const setRatingRecomputeData = props.setRatingRecomputeData;
  const setContestSubmissionsFilterData = props.setContestSubmissionsFilterData;

  return (
    <>
      <SubNavBar
        baseURL="/game/contest/"
        pages={["problems", "standings", "friends standings", "my submissions", "status"]}
        setRatingRecomputeData={setRatingRecomputeData}
        setContestSubmissionsFilterData={setContestSubmissionsFilterData}
      />
      <main id="contest-main">
        <Outlet />
      </main>
    </>
  );
};
