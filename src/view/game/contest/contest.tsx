import type { Dispatch, SetStateAction } from "react";
import { Outlet } from "react-router";
import { SubNavBar } from "../sub-navbar";
import "./contest.css";

import type { RatingRecomputeData } from "./standings/standings";

export const Contest = (props: {
  setRatingRecomputeData: Dispatch<SetStateAction<RatingRecomputeData>>;
}) => {
  const setRatingRecomputeData = props.setRatingRecomputeData;

  return (
    <>
      <SubNavBar
        baseURL="/game/contest/"
        pages={["problems", "standings", "friends standings"]}
        setRatingRecomputeData={setRatingRecomputeData}
      />
      <main id="contest-main">
        <Outlet />
      </main>
    </>
  );
};
