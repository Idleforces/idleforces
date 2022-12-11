import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Index } from "./view";
import { Game } from "./view/game/game";
import { Dashboard } from "./view/game/pages/dashboard";
import { Header } from "./view/header/header";
import { useAppDispatch } from "./app/hooks";
import { resetUsers } from "./app/users/usersSlice";
import { resetSaveData } from "./app/save/saveSlice";
import { Footer } from "./view/footer/footer";

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const resetData = () => {
    dispatch(resetUsers(null));
    dispatch(resetSaveData(null));
  };

  const leaveGame = () => {
    resetData();
    navigate("/");
  };

  return (
    <>
      <Header leaveGame={leaveGame}/>
      <Routes>
        <Route path="/game/*" element={<Game leaveGame={leaveGame}/>}>
          <Route path="*" element={<Dashboard/>} />
        </Route>
        <Route
          path="/"
          element={<Index/>}
        />
      </Routes>
      <Footer/>
    </>
  );
}

export default App;
