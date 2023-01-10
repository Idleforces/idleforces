export const StandingsStub = (props: {text: string}) => {
  const {text} = props;
  return (
    <div style={{ fontSize: "2rem", color: "darkgray" }}>{text}</div>
  );
};
