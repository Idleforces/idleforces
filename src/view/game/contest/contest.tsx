import { Outlet } from "react-router";
import {
  setContestSubmissionsFilterData,
  setRatingRecomputeData,
} from "../../../app/view/view-slice";
import { SubNavBar } from "../sub-navbar";
import "./contest.css";

export const Contest = () => {
  return (
    <>
      <SubNavBar
        baseURL="/game/contest/"
        pages={[
          "problems",
          "standings",
          "friends standings",
          "my submissions",
          "status",
        ]}
        setRatingRecomputeData={setRatingRecomputeData}
        setContestSubmissionsFilterData={setContestSubmissionsFilterData}
      />
      <main id="contest-main">
        <Outlet />
      </main>
    </>
  );
};
