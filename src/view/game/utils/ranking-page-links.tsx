import type { Dispatch, SetStateAction } from "react";

export const RankingPageLinks = (props: {
  setSelectedPage: Dispatch<SetStateAction<number>>;
  additionalDispatch?: {
    dispatch: Dispatch<SetStateAction<number>>;
    param: number;
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
            key={index}
          >
            {dataOnOnePage * index + 1}-
            {Math.min(dataOnOnePage * (index + 1), dataLength)}
          </a>
        ))}
    </div>
  );
};
