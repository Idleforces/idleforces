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
import { useEffect, useRef, useState } from "react";
import { Contests } from "./view/game/pages/contests";
import { Contest } from "./view/game/contest/contest";
import { Standings } from "./view/game/contest/standings/standings";
import type { RatingRecomputeData } from "./view/game/contest/standings/standings";
import { Problems } from "./view/game/contest/problems/problems";
import { Rating } from "./view/game/pages/rating";
import { resetContestArchive } from "./app/contest-archive/contest-archive-slice";
import { Profile } from "./view/game/pages/profile";
import { resetFriends } from "./app/friends/friends-slice";

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [contestTypeRunning, setContestTypeRunning] =
    useState<ContestTypeRunning>(null);
  const [noPlayerContestSimSpeed, setNoPlayerContestSimSpeed] = useState(0);
  const [ratingRecomputeData, setRatingRecomputeData] =
    useState<RatingRecomputeData>({
      placeholder: true,
    });

  const timestampAtPageLoad = useRef<number>(Date.now());
  const [secondsSincePageLoad, setSecondsSincePageLoad] = useState(0);

  useEffect(() => {
    let ignore = false;
    void new Promise((resolve, _reject) => {
      setTimeout(() => {
        if (!ignore) {
          setSecondsSincePageLoad(
            (prev) =>
              prev +
              Math.max(
                Math.floor((-timestampAtPageLoad.current + Date.now()) / 1000 - secondsSincePageLoad) - 1,
                1
              )
          );
          resolve("DONE");
        } else {
          resolve("IGNORED");
        }
      }, Math.max(timestampAtPageLoad.current - Date.now() + 1000 * (secondsSincePageLoad + 1), 0));
    });

    return () => {
      ignore = true;
    };
  }, [secondsSincePageLoad]);

  const resetData = () => {
    dispatch(resetUsers(null));
    dispatch(resetSaveData(null));
    dispatch(resetContest(null));
    dispatch(resetEvents(null));
    dispatch(resetContestArchive(null));
    dispatch(resetFriends(null));
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
              secondsSincePageLoad={secondsSincePageLoad}
              timestampAtPageLoad={timestampAtPageLoad}
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
                secondsSincePageLoad={secondsSincePageLoad}
                timestampAtPageLoad={timestampAtPageLoad}
              />
            }
          />
          <Route
            path="contest/"
            element={
              <Contest
                noPlayerContestSimSpeed={noPlayerContestSimSpeed}
                setNoPlayerContestSimSpeed={setNoPlayerContestSimSpeed}
                contestTypeRunning={contestTypeRunning}
                setContestTypeRunning={setContestTypeRunning}
                setRatingRecomputeData={setRatingRecomputeData}
              />
            }
          >
            <Route
              path="standings"
              element={
                <Standings
                  ratingRecomputeData={ratingRecomputeData}
                  setRatingRecomputeData={setRatingRecomputeData}
                />
              }
            />
            <Route
              path="standings/friends"
              element={
                <Standings
                  ratingRecomputeData={ratingRecomputeData}
                  setRatingRecomputeData={setRatingRecomputeData}
                />
              }
            />
            <Route path="*" element={<Problems />} />
          </Route>
          <Route path="rating" element={<Rating />} />
          <Route path="profile/:user" element={<Profile />} />
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
