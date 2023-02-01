import { NavLink, useLocation } from "react-router-dom";
import "./navbar.css";

const computeURLFromCodeforcesPage = (codeforcesPage: string) => {
  if (codeforcesPage === "api") return "https://codeforces.com/apiHelp";
  return `https://codeforces.com/${codeforcesPage}`;
};

export const NavBar = () => {
  const location = useLocation();
  const pages = ["dashboard", "contests", "rating", "library"];
  const codeforcesLinks = ["api"];

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
        {codeforcesLinks.map((page) => (
          <a
            href={computeURLFromCodeforcesPage(page)}
            className={
              location.pathname.startsWith(`/game/${page}`) ? "current" : ""
            }
            key={page}
            target="_blank"
            rel="noreferrer"
          >
            {page}
          </a>
        ))}
      </div>
    </nav>
  );
};
