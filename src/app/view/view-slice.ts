import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RatingRecomputeData } from "../../view/game/contest/standings/standings";
import type { ContestSubmissionsFilterData } from "../../view/game/contest/status/status";
import type { RootState } from "../store";
import type { XPGain } from "../XP/types";

export type ViewSlice = {
  noPlayerContestSimSpeed: number;
  ratingRecomputeData: RatingRecomputeData;
  contestSubmissionsFilterData: ContestSubmissionsFilterData;
  secondsSincePageLoad: number;
  timestampAtPageLoad: number;
  lastXPGainData: {
    XPGain: XPGain;
    secondSincePageLoad: number;
    secondsVisible: number;
  } | null;
};

export const viewSlice = createSlice({
  name: "view",
  initialState: {
    noPlayerContestSimSpeed: 0,
    ratingRecomputeData: {
      placeholder: true,
    },
    contestSubmissionsFilterData: {
      problemPlacement: null,
      verdict: null,
      handle: "",
    },
    secondsSincePageLoad: 0,
    timestampAtPageLoad: Date.now(),
    lastXPGainData: null,
  } as ViewSlice,
  reducers: {
    setNoPlayerContestSimSpeed: (
      state: ViewSlice,
      action: PayloadAction<number>
    ) => ({ ...state, noPlayerContestSimSpeed: action.payload }),
    setRatingRecomputeData: (
      state: ViewSlice,
      action: PayloadAction<RatingRecomputeData>
    ) => ({ ...state, ratingRecomputeData: action.payload }),
    setContestSubmissionsFilterData: (
      state: ViewSlice,
      action: PayloadAction<ContestSubmissionsFilterData>
    ) => ({ ...state, contestSubmissionsFilterData: action.payload }),
    setSecondsSincePageLoad: (
      state: ViewSlice,
      action: PayloadAction<number>
    ) => ({ ...state, secondsSincePageLoad: action.payload }),
    setLastXPGainData: (
      state: ViewSlice,
      action: PayloadAction<{ XPGain: XPGain; secondsVisible: number } | null>
    ) => ({
      ...state,
      lastXPGainData: action.payload
        ? {
            ...action.payload,
            secondSincePageLoad: state.secondsSincePageLoad,
          }
        : null,
    }),
  },
});

export const {
  setContestSubmissionsFilterData,
  setNoPlayerContestSimSpeed,
  setRatingRecomputeData,
  setSecondsSincePageLoad,
  setLastXPGainData,
} = viewSlice.actions;

export const selectNoPlayerContestSimSpeed = (state: RootState) =>
  state.view.noPlayerContestSimSpeed;
export const selectRatingRecomputeData = (state: RootState) =>
  state.view.ratingRecomputeData;
export const selectContestSubmissionsFilterData = (state: RootState) =>
  state.view.contestSubmissionsFilterData;
export const selectSecondsSincePageLoad = (state: RootState) =>
  state.view.secondsSincePageLoad;
export const selectVisibleXPGain = (state: RootState) => {
  const XPGainData = state.view.lastXPGainData;
  if (
    !XPGainData ||
    XPGainData.secondSincePageLoad + XPGainData.secondsVisible >=
      state.view.secondsSincePageLoad
  )
    return null;
  return XPGainData.XPGain;
};
export const selectTimestampAtPageLoad = (state: RootState) =>
  state.view.timestampAtPageLoad;
export const selectCurrentTimeInSeconds = (state: RootState) =>
  state.view.timestampAtPageLoad / 1000 + state.view.secondsSincePageLoad;

export const viewReducer = viewSlice.reducer;
