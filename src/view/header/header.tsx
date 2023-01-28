import "./header.css";
import logoUrl from "/logo.svg";

export const Header = (props: {
  leaveGameRef: React.MutableRefObject<() => void>;
}) => {
  const leaveGame = props.leaveGameRef.current;
  return (
    <header>
      <a
        onClick={(_e) => {
          leaveGame();
        }}
        id="logo"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") leaveGame();
        }}
      >
        <img src={logoUrl} alt="Idleforces" />
      </a>
    </header>
  );
};
