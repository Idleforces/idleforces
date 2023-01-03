import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type SaveSlice = {
  handle: string;
  rating: number;
  saveName: string;
  inContest: boolean;
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

    setInContest(state: SaveSlice, action: PayloadAction<boolean>) {
      return state ? { ...state, inContest: action.payload } : null;
    },
  },
});

export const { setSaveData, resetSaveData, setInContest } = saveSlice.actions;
export const selectSaveData = (state: RootState) => state.save;
export const selectHandle = (state: RootState) => state.save?.handle;
export const saveReducer = saveSlice.reducer;
