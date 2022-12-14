import { useAppSelector } from "../../app/hooks";
import { selectTimeOfSnapshot } from "../../app/users/usersSlice";

export const Footer = () => {
  const timeOfSnapshot = useAppSelector(selectTimeOfSnapshot);
  return (
    <>
    <p style={{fontSize: "0.75rem"}}>
      If you have been inspired by this silly game and want to grind IRL, then Codeforces is the platform for you.
    </p>
    <p style={{fontSize: "0.75rem"}}>
      *This game uses real Codeforces handles provided by the Codeforces API. Their performance in this game depends only on their real rating{timeOfSnapshot ? ` snapshotted at ${new Date(timeOfSnapshot).toString()}` : "" }.
    </p>
    </>
  )
};
