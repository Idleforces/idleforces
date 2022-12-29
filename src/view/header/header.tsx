import "./header.css";

export const Header = (props: { leaveGameRef: React.MutableRefObject<() => void>}) => {
  const leaveGame = props.leaveGameRef.current;
  return (
    <header>
      <a onClick={(_e) => { leaveGame(); }} id="logo">
        <img src="/logo.svg" alt="Idleforces" />
      </a>
    </header>
  );
};
