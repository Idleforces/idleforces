import { useState } from "react";
import type { Dispatch, SetStateAction} from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../navbar.css";
import type { RatingRecomputeData } from "../standings/standings";

const computePageUrl = (page: string) => {
  return page === "friends standings"
    ? "/game/contest/standings/friends"
    : `/game/contest/${page}`;
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

export const ContestNavBar = (props: {
  setRatingRecomputeData: Dispatch<SetStateAction<RatingRecomputeData>>
}) => {
  const {setRatingRecomputeData} = props;
  const location = useLocation();
  const pages = ["problems", "standings", "friends standings"];

  const [selected, setSelected] = useState(
    pages.map((page) => computeIfInitialSelected(location.pathname, page))
  );

  return (
    <nav className="sub-navbar">
      <div id="navlinks-container">
        {pages.map((page, index) => (
          <NavLink
            to={`${computePageUrl(page)}`}
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
            onClick={(_e) => { setRatingRecomputeData({placeholder: true}); }}
          >
            {page}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
