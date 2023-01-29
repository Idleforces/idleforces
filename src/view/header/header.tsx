import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import "./header.css";
import logoUrl from "/logo.svg";

export const Header = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const leaveGame = props.leaveGameRef.current;
  return (
    <header>
      <Link
        to="/"
        onClick={(_e) => {
          leaveGame();
        }}
        id="logo"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") leaveGame();
        }}
      >
        <img src={logoUrl} alt="Idleforces" />
      </Link>
      <a
        href="https://github.com/posij118/idleforces"
        target="_blank"
        rel="noreferrer"
        className="text-link"
      >
        <FontAwesomeIcon icon={["fab", "github"]} />
        Contribute!
      </a>
    </header>
  );
};
