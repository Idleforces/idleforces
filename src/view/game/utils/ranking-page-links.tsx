import type { Dispatch, SetStateAction } from "react";
import React from "react";
import type { RatingRecomputeData } from "../contest/standings/standings";

const powersOfTwo: Array<number> = [
  0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
  32768, 65536, 131072,
];

export const RankingPageLinks = (props: {
  selectedPage: number;
  setSelectedPage: Dispatch<SetStateAction<number>>;
  additionalDispatch?: {
    dispatch: Dispatch<SetStateAction<RatingRecomputeData>>;
    param: RatingRecomputeData;
  };
  dataLength: number;
  dataOnOnePage: number;
  usePowerOfTwoGaps?: boolean;
}) => {
  const {
    selectedPage,
    setSelectedPage,
    additionalDispatch,
    dataLength,
    dataOnOnePage,
  } = props;

  const usePowerOfTwoGaps = props.usePowerOfTwoGaps ?? false;

  return (
    <div id="standings-page-links-container">
      {Array(Math.ceil(dataLength / dataOnOnePage))
        .fill(0)
        .map((_, index, arr) =>
          !usePowerOfTwoGaps ||
          powersOfTwo.includes(Math.abs(selectedPage - (index + 1))) ||
          index === 0 ||
          index === arr.length - 1 ? (
            <a
              onClick={(_e) => {
                setSelectedPage(index + 1);
                if (additionalDispatch)
                  additionalDispatch.dispatch(additionalDispatch.param);
              }}
              tabIndex={0}
              key={index}
              style={
                selectedPage === index + 1
                  ? { borderBottom: "2px solid darkblue" }
                  : {}
              }
            >
              {!usePowerOfTwoGaps
                ? `${dataOnOnePage * index + 1}-${Math.min(
                    dataOnOnePage * (index + 1),
                    dataLength
                  )}`
                : index + 1}
            </a>
          ) : (
            <React.Fragment key={index}></React.Fragment>
          )
        )}
    </div>
  );
};
