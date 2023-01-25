import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RatingRecomputeData } from "../../view/game/contest/standings/standings";
import type { ContestSubmissionsFilterData } from "../../view/game/contest/status/status";
import type { RootState } from "../store";

export type ViewSlice = {
  noPlayerContestSimSpeed: number;
  ratingRecomputeData: RatingRecomputeData;
  contestSubmissionsFilterData: ContestSubmissionsFilterData;
  secondsSincePageLoad: number;
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
  },
});

export const {
  setContestSubmissionsFilterData,
  setNoPlayerContestSimSpeed,
  setRatingRecomputeData,
  setSecondsSincePageLoad,
} = viewSlice.actions;

export const selectNoPlayerContestSimSpeed = (state: RootState) =>
  state.view.noPlayerContestSimSpeed;
export const selectRatingRecomputeData = (state: RootState) =>
  state.view.ratingRecomputeData;
export const selectContestSubmissionsFilterData = (state: RootState) =>
  state.view.contestSubmissionsFilterData;
export const selectSecondsSincePageLoad = (state: RootState) =>
  state.view.secondsSincePageLoad;

export const viewReducer = viewSlice.reducer;
