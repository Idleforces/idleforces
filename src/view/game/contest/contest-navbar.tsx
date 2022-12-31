import { NavLink, useLocation } from "react-router-dom";
import "../navbar.css";

export const ContestNavBar = () => {
  const location = useLocation();
  const pages = ["problems", "standings"];

  return (
    <nav>
      <div id="navlinks-container">
        {pages.map((page) => (
          <NavLink
            to={`/game/contest/${page}`}
            className={location.pathname.includes(page) ? "current" : ""}
            key={page}
          >
            {page}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};