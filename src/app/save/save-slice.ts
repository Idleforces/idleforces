import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type Activity =
  | "contest-simulation"
  | "contest-participation"
  | "book-reading"
  | null;
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

    setPlayerRating(
      state: SaveSlice,
      action: PayloadAction<number | undefined>
    ) {
      return state
        ? { ...state, rating: action.payload ?? state.rating }
        : null;
    },
  },
});

export const { setSaveData, resetSaveData, setActivity, setPlayerRating } =
  saveSlice.actions;
export const selectSaveData = (state: RootState) => state.save;
export const selectHandle = (state: RootState) => state.save?.handle;
export const selectActivity = (state: RootState) =>
  state.save ? state.save.activity : null;
export const saveReducer = saveSlice.reducer;
