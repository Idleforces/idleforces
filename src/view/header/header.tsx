import "./header.css";

export const Header = (props: { leaveGame: () => void }) => {
  const leaveGame = props.leaveGame;
  return (
    <header>
      <a onClick={(_e) => { leaveGame(); }} id="logo">
        <img src="logo.svg" alt="Idleforces" />
      </a>
    </header>
  );
};
