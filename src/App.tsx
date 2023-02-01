import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Index } from "./view/index";
import { Game } from "./view/game/game";
import { Dashboard } from "./view/game/pages/dashboard";
import { Header } from "./view/header/header";
import { useAppDispatch } from "./app/hooks";
import { resetUsers } from "./app/users/users-slice";
import { resetSaveData } from "./app/save/save-slice";
import { Footer } from "./view/footer/footer";
import { resetContest } from "./app/contest/contest-slice";
import { resetEvents } from "./app/events/events-slice";
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
import { resetBooksSlice } from "./app/books/books-slice";
import { Library } from "./view/game/pages/library";
import { useRef } from "react";
import { Clock } from "./clock";

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const resetData = () => {
    dispatch(resetUsers(null));
    dispatch(resetSaveData(null));
    dispatch(resetContest(null));
    dispatch(resetEvents(null));
    dispatch(resetContestArchive(null));
    dispatch(resetFriends(null));
    dispatch(resetBooksSlice(null));
  };

  const leaveGameRef = useRef(() => {
    resetData();
    navigate("/");
  });

  return (
    <>
      <Clock />

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
          <Route path="library" element={<Library />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
        <Route path="/*" element={<Index leaveGameRef={leaveGameRef} />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
