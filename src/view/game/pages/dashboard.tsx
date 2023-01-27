import { useAppSelector } from "../../../app/hooks";
import { selectSaveData } from "../../../app/save/save-slice";

export const Dashboard = () => {
  const saveData = useAppSelector(selectSaveData);

  if (!saveData)
    return <div>Something went wrong. We cannot find the save data.</div>;
  return (
    <div id="dashboard">
      <p>Logged in as {saveData.handle}.</p>
      <p>The game save name is {saveData.saveName}.</p>
      <p>Rating: {saveData.rating}</p>
    </div>
  );
};
