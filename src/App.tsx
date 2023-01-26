import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Index } from "./view";
import { Game } from "./view/game/game";
import { Dashboard } from "./view/game/pages/dashboard";
import { Header } from "./view/header/header";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { resetUsers } from "./app/users/users-slice";
import { resetSaveData } from "./app/save/save-slice";
import { Footer } from "./view/footer/footer";
import { Loading } from "./view/loading/loading";
import { resetContest } from "./app/contest/contest-slice";
import { resetEvents } from "./app/events/events-slice";
import { useEffect, useRef } from "react";
import { Contests } from "./view/game/pages/contests";
import { Contest } from "./view/game/contest/contest";
import { Standings } from "./view/game/contest/standings/standings";
import { Problems } from "./view/game/contest/problems/problems";
import { Rating } from "./view/game/pages/rating";
import { resetContestArchive } from "./app/contest-archive/contest-archive-slice";
import { Profile } from "./view/game/pages/profile/profile";
import { resetFriends } from "./app/friends/friends-slice";
import { ProfileContests } from "./view/game/pages/profile/profile-contests";
import { Status } from "./view/game/contest/status/status";
import {
  selectSecondsSincePageLoad,
  selectTimestampAtPageLoad,
  setNoPlayerContestSimSpeed,
  setSecondsSincePageLoad,
} from "./app/view/view-slice";

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const secondsSincePageLoad = useAppSelector(selectSecondsSincePageLoad);
  const timestampAtPageLoad = useAppSelector(selectTimestampAtPageLoad);

  useEffect(() => {
    let ignore = false;
    void new Promise((resolve, _reject) => {
      setTimeout(() => {
        if (!ignore) {
          dispatch(
            setSecondsSincePageLoad(
              secondsSincePageLoad +
                Math.max(
                  Math.floor(
                    (-timestampAtPageLoad + Date.now()) / 1000 -
                      secondsSincePageLoad
                  ) - 1,
                  1
                )
            )
          );
          resolve("DONE");
        } else {
          resolve("IGNORED");
        }
      }, Math.max(timestampAtPageLoad - Date.now() + 1000 * (secondsSincePageLoad + 1), 0));
    });

    return () => {
      ignore = true;
    };
  }, [secondsSincePageLoad, dispatch, timestampAtPageLoad]);

  const resetData = () => {
    dispatch(resetUsers(null));
    dispatch(resetSaveData(null));
    dispatch(resetContest(null));
    dispatch(resetEvents(null));
    dispatch(resetContestArchive(null));
    dispatch(resetFriends(null));
    dispatch(setNoPlayerContestSimSpeed(0));
  };

  const leaveGameRef = useRef(() => {
    resetData();
    navigate("/");
  });

  return (
    <>
      <Header leaveGameRef={leaveGameRef} />
      <Routes>
        <Route path="/game/*" element={<Game leaveGameRef={leaveGameRef} />}>
          <Route path="profile/:handle" element={<Profile />} />
          <Route
            path="profile/:handle/contests"
            element={<ProfileContests />}
          />
          <Route path="contests" element={<Contests />} />

          <Route path="contest/" element={<Contest />}>
            <Route path="standings" element={<Standings />} />
            <Route path="my" element={<Status />} />
            <Route path="status" element={<Status />} />
            <Route path="standings/friends" element={<Standings />} />
            <Route path="*" element={<Problems />} />
          </Route>
          <Route path="rating" element={<Rating />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
        <Route path="/loading" element={<Loading />} />
        <Route path="/*" element={<Index leaveGameRef={leaveGameRef} />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
