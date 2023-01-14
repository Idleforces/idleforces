import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Index } from "./view";
import { Game } from "./view/game/game";
import { Dashboard } from "./view/game/pages/dashboard";
import { Header } from "./view/header/header";
import { useAppDispatch } from "./app/hooks";
import { resetUsers } from "./app/users/users-slice";
import { resetSaveData } from "./app/save/save-slice";
import { Footer } from "./view/footer/footer";
import { Loading } from "./view/loading/loading";
import { resetContest } from "./app/contest/contest-slice";
import { resetEvents } from "./app/events/events-slice";
import type { ContestTypeRunning } from "./view/game/types";
import { useRef, useState } from "react";
import { Contests } from "./view/game/pages/contests";
import { Contest } from "./view/game/contest/contest";
import { Standings } from "./view/game/contest/standings/standings";
import { Problems } from "./view/game/contest/problems/problems";
import { Rating } from "./view/game/pages/rating";
import { resetContestArchive } from "./app/contest-archive/contest-archive-slice";
import { Profile } from "./view/game/pages/profile";

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [contestTypeRunning, setContestTypeRunning] =
    useState<ContestTypeRunning>(null);
  const [noPlayerContestSimSpeed, setNoPlayerContestSimSpeed] = useState(0);

  const resetData = () => {
    dispatch(resetUsers(null));
    dispatch(resetSaveData(null));
    dispatch(resetContest(null));
    dispatch(resetEvents(null));
    dispatch(resetContestArchive(null));
    setContestTypeRunning(null);
    setNoPlayerContestSimSpeed(0);
  };

  const leaveGameRef = useRef(() => {
    resetData();
    navigate("/");
  });

  return (
    <>
      <Header leaveGameRef={leaveGameRef} />
      <Routes>
        <Route
          path="/game/*"
          element={
            <Game
              leaveGameRef={leaveGameRef}
              contestTypeRunning={contestTypeRunning}
              noPlayerContestSimSpeed={noPlayerContestSimSpeed}
            />
          }
        >
          <Route
            path="contests"
            element={
              <Contests
                setContestTypeRunning={setContestTypeRunning}
                contestTypeRunning={contestTypeRunning}
                setNoPlayerContestSimSpeed={setNoPlayerContestSimSpeed}
              />
            }
          />
          <Route path="contest/" element={<Contest
            noPlayerContestSimSpeed={noPlayerContestSimSpeed}
            setNoPlayerContestSimSpeed={setNoPlayerContestSimSpeed}
            contestTypeRunning={contestTypeRunning}
            setContestTypeRunning={setContestTypeRunning}
          />}>
            <Route path="standings" element={<Standings/>}/>
            <Route path="*" element={<Problems />}/>
          </Route>
          <Route path="rating" element={<Rating/>}/>
          <Route path="profile/:user" element={<Profile/>}/>
          <Route path="*" element={<Dashboard />} />
        </Route>
        <Route path="/loading" element={<Loading />} />
        <Route
          path="/*"
          element={
            <Index
              setContestTypeRunning={setContestTypeRunning}
              leaveGameRef={leaveGameRef}
            />
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
