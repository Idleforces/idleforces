import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type SaveSlice = {
  handle: string;
  rating: number;
  saveName: string;
} | null;

const saveSlice = createSlice({
  name: "save",
  initialState: null as SaveSlice,
  reducers: {
    setSaveData (_state: SaveSlice, action: PayloadAction<SaveSlice>) {
      return action.payload;
    },

    resetSaveData (_state: SaveSlice, _action: PayloadAction<null>) {
      return null;
    }
  },
});

export const {setSaveData, resetSaveData} = saveSlice.actions;
export const selectSaveData = (state: RootState) => state.save;
export const saveReducer = saveSlice.reducer;