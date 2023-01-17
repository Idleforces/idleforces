import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./navbar.css";
import type { RatingRecomputeData } from "./contest/standings/standings";
import type { ContestSubmissionsFilterData } from "./contest/status/status";
import { useAppSelector } from "../../app/hooks";
import { selectHandle } from "../../app/save/save-slice";

function computePageUrl<T extends string>(
  baseURL: string,
  page: T,
  handle?: string
) {
  const pageURL =
    page === "friends standings"
      ? `${baseURL}standings/friends`
      : page === "contests" && handle !== undefined
      ? `${baseURL}${handle}/${page}`
      : page === "my submissions"
      ? `${baseURL}my`
      : `${baseURL}${page}`;

  return pageURL;
}

function computeIfInitialSelected<T extends string>(
  locationPathname: string,
  pageName: T
) {
  const pageNameRegex = new RegExp(
    pageName === "friends standings"
      ? "friends"
      : pageName === "my submissions"
      ? "my$"
      : `${pageName}$`
  );
  return locationPathname.match(pageNameRegex) !== null;
}

function handleNavBarClickSideEffects<T extends string>(data: {
  page: T;
  setRatingRecomputeData?: Dispatch<SetStateAction<RatingRecomputeData>>;
  setContestSubmissionsFilterData?: Dispatch<
    SetStateAction<ContestSubmissionsFilterData>
  >;
  playerHandle?: string;
}) {
  const {
    page,
    setRatingRecomputeData,
    setContestSubmissionsFilterData,
    playerHandle,
  } = data;

  if (setRatingRecomputeData) {
    setRatingRecomputeData({ placeholder: true });
  }

  if (
    page === "my submissions" &&
    setContestSubmissionsFilterData &&
    playerHandle !== undefined
  ) {
    setContestSubmissionsFilterData({
      handle: playerHandle,
      problemPlacement: null,
      verdict: null,
    });
  }

  if (page === "status" && setContestSubmissionsFilterData) {
    setContestSubmissionsFilterData({
      handle: "",
      problemPlacement: null,
      verdict: null,
    });
  }
}

export function SubNavBar<T extends string>(props: {
  baseURL: string;
  pages: Array<T>;
  handle?: string;
  setRatingRecomputeData?: Dispatch<SetStateAction<RatingRecomputeData>>;
  setContestSubmissionsFilterData?: Dispatch<
    SetStateAction<ContestSubmissionsFilterData>
  >;
}) {
  const {
    setRatingRecomputeData,
    pages,
    baseURL,
    handle,
    setContestSubmissionsFilterData,
  } = props;

  const location = useLocation();
  const playerHandle = useAppSelector(selectHandle);

  const [selected, setSelected] = useState(
    pages.map((page) => computeIfInitialSelected(location.pathname, page))
  );

  return (
    <nav className="sub-navbar">
      <div id="navlinks-container">
        {pages.map((page, index) => (
          <NavLink
            to={computePageUrl(baseURL, page, handle)}
            className={selected[index] ? "current" : ""}
            key={page}
            onMouseOver={(_e) => {
              setSelected(pages.map((menuPage) => menuPage === page));
            }}
            onMouseOut={(_e) => {
              setSelected(
                pages.map((page) =>
                  computeIfInitialSelected(location.pathname, page)
                )
              );
            }}
            onClick={(_e) => {
              handleNavBarClickSideEffects({
                page,
                setRatingRecomputeData,
                setContestSubmissionsFilterData,
                playerHandle,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleNavBarClickSideEffects({
                  page,
                  setRatingRecomputeData,
                  setContestSubmissionsFilterData,
                  playerHandle,
                });
              }
            }}
          >
            {page}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
