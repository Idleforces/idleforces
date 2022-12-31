import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { User } from "./types";
import type { RatingPoints } from "../contest/types";

export type UsersSlice = { users: Array<User>; timeOfSnapshot: number } | null;

export const usersSlice = createSlice({
  name: "users",
  initialState: null as UsersSlice,
  reducers: {
    resetUsers: (_state: UsersSlice, _action: PayloadAction<null>) => null,
    setUsers: (_state: UsersSlice, action: PayloadAction<UsersSlice>) =>
      action.payload,

    updateRatings: (state: UsersSlice, action: PayloadAction<RatingPoints>) => {
      if (state === null) return null;
      state.users.forEach((user) => {
        user.ratingHistory.push(action.payload[user.handle]);
      });

      return state;
    },
  },
});

export const { resetUsers, setUsers, updateRatings } = usersSlice.actions;

export const selectUsersWithTimeOfSnapshot = (state: RootState) => state.users;
export const selectUsers = (state: RootState) =>
  state.users ? state.users.users : null;
export const selectTimeOfSnapshot = (state: RootState) =>
  state.users ? state.users.timeOfSnapshot : null;
export const selectPlayer = (state: RootState) =>
  state.users ? state.users.users[0] : null;

export const usersReducer = usersSlice.reducer;
