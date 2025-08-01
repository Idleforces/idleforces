import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import { useAppDispatch } from "../../../app/hooks";
import "./ranking-page-links.css";

const powersOfTwo: Array<number> = [
  0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
  32768, 65536, 131072,
];

export function RankingPageLinks<T>(props: {
  selectedPage: number;
  setSelectedPage?: Dispatch<SetStateAction<number>>;
  additionalPayloadActions?: Array<
    | {
        action: ActionCreatorWithPayload<T>;
        param: T;
        useIndex: false;
      }
    | {
        action: ActionCreatorWithPayload<number>;
        useIndex: true;
      }
  >;
  dataLength: number;
  dataOnOnePage: number;
  usePowerOfTwoGaps?: boolean;
}) {
  const {
    selectedPage,
    setSelectedPage,
    additionalPayloadActions,
    dataLength,
    dataOnOnePage,
  } = props;
  const dispatch = useAppDispatch();

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
            <button
              className="remove-default-styles ranking-page-link"
              onClick={(_e) => {
                if (setSelectedPage) setSelectedPage(index + 1);

                if (additionalPayloadActions)
                  additionalPayloadActions.forEach(
                    (additionalPayloadAction) => {
                      if (additionalPayloadAction.useIndex)
                        dispatch(additionalPayloadAction.action(index + 1));
                      else
                        dispatch(
                          additionalPayloadAction.action(
                            additionalPayloadAction.param
                          )
                        );
                    }
                  );
              }}
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
            </button>
          ) : (
            <React.Fragment key={index}></React.Fragment>
          )
        )}
    </div>
  );
}
