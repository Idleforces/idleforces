import type { Dispatch, SetStateAction } from "react";
import type { RatingRecomputeData } from "../contest/standings/standings";

export const RankingPageLinks = (props: {
  setSelectedPage: Dispatch<SetStateAction<number>>;
  additionalDispatch?: {
    dispatch: Dispatch<SetStateAction<RatingRecomputeData>>;
    param: RatingRecomputeData;
  };
  dataLength: number;
  dataOnOnePage: number;
}) => {
  const { setSelectedPage, additionalDispatch, dataLength, dataOnOnePage } =
    props;
  return (
    <div id="standings-page-links-container">
      {Array(Math.ceil(dataLength / dataOnOnePage))
        .fill(0)
        .map((_, index) => (
          <a
            onClick={(_e) => {
              setSelectedPage(index + 1);
              if (additionalDispatch)
                additionalDispatch.dispatch(additionalDispatch.param);
            }}
            tabIndex={0}
            key={index}
          >
            {dataOnOnePage * index + 1}-
            {Math.min(dataOnOnePage * (index + 1), dataLength)}
          </a>
        ))}
    </div>
  );
};
