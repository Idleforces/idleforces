import { useEffect, useMemo, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { useAppDispatch } from "./app/hooks";
import { loadUsersFromSaveFile, resetUsers, saveUsers } from "./app/users/usersSlice";

function App() {
  const startingTimestamp = useMemo(() => Date.now(), []);
  const [ticksPassed, setTicksPassed] = useState(0);
  const [gameSave, setGameSave] = useState("");
  const dispatch = useAppDispatch();

  const resetData = () => {
    dispatch(resetUsers(null))
  } 

  const handleTick = () => {
    dispatch(saveUsers(gameSave));
  };

  useEffect(() => {
    new Promise((resolve, _reject) => {
      setTimeout(() => {
        handleTick();
        setTicksPassed((prev) => (prev += 1));
        resolve("DONE");
      }, Math.max(startingTimestamp - Date.now() + 1000 * (ticksPassed + 1), 500));
    });
  }, [ticksPassed]);

  return (
    <div className="App">
      <form onSubmit={() => {dispatch(loadUsersFromSaveFile(gameSave))}}>
        <label htmlFor="game-save-input">Enter save name:</label>
        <input
          type="text"
          value={gameSave}
          onChange={(e) => setGameSave(e.target.value)}
          name="game-save-input"
          required
        />
        <input
          type="submit"
          value="Create / load game save"
        />
      </form>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button>count is 0</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
