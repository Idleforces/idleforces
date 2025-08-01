import { useAppSelector } from "../../app/hooks";
import { selectTimeOfSnapshot } from "../../app/users/users-slice";

export const Footer = () => {
  const timeOfSnapshot = useAppSelector(selectTimeOfSnapshot);
  return (
    <footer>
      <p
        style={{ fontSize: "0.75rem", marginTop: "2rem", marginBottom: "1rem" }}
      >
        If you have been inspired by this silly game and want to grind IRL, then
        Codeforces is the platform for you.
      </p>
      <p style={{ fontSize: "0.75rem" }}>
        *This game uses real Codeforces handles provided by the Codeforces API.
        Their performance in this game depends only on their real rating
        {timeOfSnapshot !== null
          ? ` snapshotted at ${new Date(timeOfSnapshot).toLocaleString()}`
          : ""}
        .
      </p>
    </footer>
  );
};
