import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./navbar.css";

export const NavBar = (props: { gameSaving: boolean }) => {
  const location = useLocation();
  const pages = ["dashboard", "contests", "rating"];

  return (
    <nav>
      <div id="navlinks-container">
        {pages.map((page) => (
          <NavLink
            to={`/game/${page}`}
            className={
              location.pathname.startsWith(`/game/${page}`) ? "current" : ""
            }
            key={page}
          >
            {page}
          </NavLink>
        ))}
      </div>
      {props.gameSaving ? (
        <>
          <FontAwesomeIcon icon={["fas", "spinner"]} />
          <span>Loading...</span>
        </>
      ) : (
        <div></div>
      )}
    </nav>
  );
};
