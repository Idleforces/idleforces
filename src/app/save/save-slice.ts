import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { USER_INITIAL_RATING } from "../users/constants";

export type Activity = "contest-simulation" | "contest-participation" | null;
export type SaveSlice = {
  handle: string;
  rating: number;
  saveName: string;
  activity: Activity;
} | null;

const saveSlice = createSlice({
  name: "save",
  initialState: null as SaveSlice,
  reducers: {
    setSaveData(_state: SaveSlice, action: PayloadAction<SaveSlice>) {
      return action.payload;
    },

    resetSaveData(_state: SaveSlice, _action: PayloadAction<null>) {
      return null;
    },

    setActivity(state: SaveSlice, action: PayloadAction<Activity>) {
      return state ? { ...state, activity: action.payload } : null;
    },

    setRating(state: SaveSlice, action: PayloadAction<number>) {
      return state ? { ...state, rating: action.payload } : null;
    },
  },
});

export const { setSaveData, resetSaveData, setActivity } = saveSlice.actions;
export const selectSaveData = (state: RootState) => state.save;
export const selectHandle = (state: RootState) => state.save?.handle;
export const selectRating = (state: RootState) =>
  state.save ? state.save.rating : USER_INITIAL_RATING;
export const selectActivity = (state: RootState) =>
  state.save ? state.save.activity : null;
export const saveReducer = saveSlice.reducer;
