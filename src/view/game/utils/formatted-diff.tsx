export const FormattedDiff = (props: { diff: number }) => {
  const { diff } = props;

  return (
    <div className={diff > 0 ? "green bold" : diff < 0 ? "red bold" : ""}>
      {diff > 0 ? `+${diff}` : diff}
    </div>
  );
};
