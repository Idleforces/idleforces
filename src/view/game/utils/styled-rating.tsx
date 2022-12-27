export const RatingStyled = (props: {
  rating: number;
  stringToStyle: number | string;
}) => {
  const rating = props.rating;
  const stringToStyle = String(props.stringToStyle);

  if (rating >= 3000) {
    return (
      <>
        <span style={{ fontWeight: 600, color: "black" }}>
          {stringToStyle[0]}
        </span>
        <span style={{ fontWeight: 600, color: "#ff3333" }}>
          {stringToStyle.slice(1)}
        </span>
      </>
    );
  }
  return (
    <span
      style={{
        fontWeight: 600,
        color:
          rating >= 2600
            ? "#f33"
            : rating >= 2400
              ? "#f77"
              : rating >= 2300
                ? "#fb5"
                : rating >= 2100
                  ? "#fc8"
                  : rating >= 1900
                    ? "#f8f"
                    : rating >= 1600
                      ? "#aaf"
                      : rating >= 1400
                        ? "#7db"
                        : rating >= 1200
                          ? "#7f7"
                          : "#ccc",
      }}
    >
      {stringToStyle}
    </span>
  );
};
