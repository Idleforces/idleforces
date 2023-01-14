import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { FriendsSlice } from "./types";
import type { RootState } from "../store";

export const friendsSlice = createSlice({
  name: "friends",
  initialState: [] as FriendsSlice,
  reducers: {
    setFriends: (_state: FriendsSlice, action: PayloadAction<FriendsSlice>) =>
      action.payload,

    resetFriends: (_state: FriendsSlice, _action: PayloadAction<null>) => [],

    toggleFriend: (state: FriendsSlice, action: PayloadAction<string>) => {
      const found =
        state.filter((friendHandle) => friendHandle === action.payload).length >
        0;

      if (found)
        return state.filter((friendHandle) => friendHandle !== action.payload);
      return [...state, action.payload];
    },
  },
});

export const { setFriends, resetFriends, toggleFriend } = friendsSlice.actions;

export const selectFriends = (state: RootState) => state.friends;

export const friendsReducer = friendsSlice.reducer;
