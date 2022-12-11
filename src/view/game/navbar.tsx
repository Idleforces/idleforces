import { NavLink, useLocation } from "react-router-dom";
import "./navbar.css";

export const NavBar = () => {
  const location = useLocation();
  const pages = ["dashboard"];

  return (
    <nav>
      {pages.map((page) => (
        <NavLink
          to={`/game/${page}`}
          className={location.pathname.includes(page) ? "current" : ""}
          key={page}
        >
          {page}
        </NavLink>
      ))}
    </nav>
  );
};
