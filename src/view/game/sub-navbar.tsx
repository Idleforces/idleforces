import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./navbar.css";
import type { RatingRecomputeData } from "./contest/standings/standings";

const computePageUrl = (baseURL: string, page: string, handle?: string) => {
  const pageURL =
    page === "friends standings"
      ? `${baseURL}standings/friends`
      : page === "contests" && handle !== undefined
      ? `${baseURL}${handle}/${page}`
      : `${baseURL}${page}`;

  return pageURL;
};

const computeIfInitialSelected = (
  locationPathname: string,
  pageName: string
) => {
  const pageNameRegex = new RegExp(
    pageName === "friends standings" ? "friends" : `${pageName}$`
  );
  return locationPathname.match(pageNameRegex) !== null;
};

export const SubNavBar = (props: {
  baseURL: string;
  pages: Array<string>;
  handle?: string;
  setRatingRecomputeData?: Dispatch<SetStateAction<RatingRecomputeData>>;
}) => {
  const { setRatingRecomputeData, pages, baseURL, handle } = props;
  const location = useLocation();

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
            onClick={
              setRatingRecomputeData
                ? (_e) => {
                    setRatingRecomputeData({ placeholder: true });
                  }
                : undefined
            }
          >
            {page}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
