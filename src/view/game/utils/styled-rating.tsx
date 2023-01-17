export const computeColorOfRatingStyled = (rating: number) => {
  return rating >= 3000
    ? "nutella"
    : rating >= 2400
    ? "red"
    : rating >= 2300
    ? "#fb5"
    : rating >= 2100
    ? "#ff8c00"
    : rating >= 1900
    ? "#a0a"
    : rating >= 1600
    ? "blue"
    : rating >= 1400
    ? "#03a89e"
    : rating >= 1200
    ? "green"
    : "gray";
};

export const RatingStyled = (props: {
  rating: number;
  stringToStyle: number | string;
  nutellaFormatting?: boolean;
}) => {
  const rating = props.rating;
  const stringToStyle = String(props.stringToStyle);
  const nutellaFormatting =
    props.nutellaFormatting === undefined ? true : props.nutellaFormatting;

  if (rating >= 3000 && nutellaFormatting) {
    return (
      <>
        <span style={{ fontWeight: 600, color: "black" }}>
          {stringToStyle[0]}
        </span>
        <span style={{ fontWeight: 600, color: "red" }}>
          {stringToStyle.slice(1)}
        </span>
      </>
    );
  }
  return (
    <span
      style={{
        fontWeight: 600,
        color: computeColorOfRatingStyled(rating).replace("nutella", "red"),
      }}
    >
      {stringToStyle}
    </span>
  );
};
