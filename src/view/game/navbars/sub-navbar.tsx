import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./navbar.css";
import type { RatingRecomputeData } from "../contest/standings/standings";
import type { ContestSubmissionsFilterData } from "../contest/status/status";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectHandle } from "../../../app/save/save-slice";
import type {
  ActionCreatorWithPayload,
  AnyAction,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import { setStandingsSelectedPage } from "../../../app/view/view-slice";

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
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>;
  setRatingRecomputeData?: ActionCreatorWithPayload<
    RatingRecomputeData,
    "view/setRatingRecomputeData"
  >;
  setContestSubmissionsFilterData?: ActionCreatorWithPayload<
    ContestSubmissionsFilterData,
    "view/setContestSubmissionsFilterData"
  >;
  setStandingsSelectedPage?: ActionCreatorWithPayload<
    number,
    "view/setStandingsSelectedPage"
  >;
  playerHandle?: string;
}) {
  const {
    page,
    setRatingRecomputeData,
    setContestSubmissionsFilterData,
    playerHandle,
    setStandingsSelectedPage,
    dispatch,
  } = data;

  if (setRatingRecomputeData) {
    dispatch(setRatingRecomputeData({ placeholder: true }));
  }

  if (
    page === "my submissions" &&
    setContestSubmissionsFilterData &&
    playerHandle !== undefined
  ) {
    dispatch(
      setContestSubmissionsFilterData({
        handle: playerHandle,
        problemPlacement: null,
        verdict: null,
      })
    );
  }

  if (page === "status" && setContestSubmissionsFilterData) {
    dispatch(
      setContestSubmissionsFilterData({
        handle: "",
        problemPlacement: null,
        verdict: null,
      })
    );
  }

  if (
    (page === "standings" || page === "friends standings") &&
    setStandingsSelectedPage
  )
    dispatch(setStandingsSelectedPage(1));
}

export function SubNavBar<T extends string>(props: {
  baseURL: string;
  pages: Array<T>;
  handle?: string;
  setRatingRecomputeData?: ActionCreatorWithPayload<
    RatingRecomputeData,
    "view/setRatingRecomputeData"
  >;
  setContestSubmissionsFilterData?: ActionCreatorWithPayload<
    ContestSubmissionsFilterData,
    "view/setContestSubmissionsFilterData"
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
  const dispatch = useAppDispatch();

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
                dispatch,
                setRatingRecomputeData,
                setContestSubmissionsFilterData,
                playerHandle,
                setStandingsSelectedPage,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleNavBarClickSideEffects({
                  page,
                  dispatch,
                  setRatingRecomputeData,
                  setContestSubmissionsFilterData,
                  playerHandle,
                  setStandingsSelectedPage,
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
