export const FormattedDiff = (props: { diff: number }) => {
  const diff = Math.round(100 * props.diff) / 100;

  return (
    <div
      className={diff > 0 ? "dark-green bold" : diff < 0 ? "dark-red bold" : ""}
    >
      {diff > 0 ? `+${diff}` : diff}
    </div>
  );
};
