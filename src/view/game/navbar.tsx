import { NavLink, useLocation } from "react-router-dom";
import "./navbar.css";

export const NavBar = (props: { gameSaving: boolean }) => {
  const location = useLocation();
  const pages = ["dashboard"];

  return (
    <nav>
      <div id="navlinks-container">
        {pages.map((page) => (
          <NavLink
            to={`/game/${page}`}
            className={location.pathname.includes(page) ? "current" : ""}
            key={page}
          >
            {page}
          </NavLink>
        ))}
      </div>
      {props.gameSaving ? (
        <>
          <i className="fa-solid fa-spinner"></i>
          <span>Loading...</span>
        </>
      ) : (
        <></>
      )}
    </nav>
  );
};
