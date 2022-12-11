import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type SaveSlice = {
  handle: string;
  rating: number;
  saveName: string;
} | null;

const saveSlice = createSlice({
  name: "save",
  initialState: null as SaveSlice,
  reducers: {
    setSaveData (state: SaveSlice, action: PayloadAction<SaveSlice>) {
      return action.payload;
    },

    resetSaveData (state: SaveSlice, action: PayloadAction<null>) {
      return null;
    }
  },
});

export const {setSaveData, resetSaveData} = saveSlice.actions;
export const selectSaveData = (state: RootState) => state.save;
export const saveReducer = saveSlice.reducer;