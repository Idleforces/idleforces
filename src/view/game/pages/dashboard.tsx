import { useAppSelector } from "../../../app/hooks"
import { selectSaveData } from "../../../app/save/saveSlice";

export const Dashboard = () => {
    const saveData = useAppSelector(selectSaveData);
    return (
        <div id="dashboard">
            <p>Logged in as {saveData?.handle}.</p>
            <p>The game save name is {saveData?.saveName}.</p>
            <p>Rating: {saveData?.rating}</p>
        </div>
    )
}