import { useAppSelector } from "../../app/hooks";
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "./navbars/navbar";
import { selectActivity } from "../../app/save/save-slice";
import { SideBar } from "./sidebar/sidebar";
import "./game.css";
import { ContestSideBar } from "./contest/contest-sidebar";
import { PersistData } from "./model/persist-data";
import { ProcessContest } from "./model/process-contest";
import { ProcessBookReading } from "./model/process-book-reading";

export const Game = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const activity = useAppSelector(selectActivity);
  const location = useLocation();

  return (
    <div id="game-container">
      <PersistData leaveGameRef={props.leaveGameRef} />
      {activity === "contest-participation" ||
      activity === "contest-simulation" ? (
        <ProcessContest leaveGameRef={props.leaveGameRef} />
      ) : activity === "book-reading" ? (
        <ProcessBookReading />
      ) : (
        <></>
      )}

      <NavBar />
      <main id="game">
        <div id="game-page-container">
          <Outlet />
        </div>
        {location.pathname.startsWith("/game/contest") &&
        !location.pathname.startsWith("/game/contests") ? (
          <ContestSideBar />
        ) : (
          <SideBar />
        )}
      </main>
    </div>
  );
};
