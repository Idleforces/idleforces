import { createSlice } from "@reduxjs/toolkit";
import { generateUsers } from "./load-users";
import type { PayloadAction, CaseReducer } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { User } from "./types";
import { decompressFromUTF16 } from "lz-string";
import type { RatingPoints } from "../contest/types";

type SaveData = {
  saveName: string;
  handle: string;
};

export type UsersSlice = { users: Array<User>; timeOfSnapshot: number } | null;
const loadUsersFromSave: CaseReducer<UsersSlice, PayloadAction<SaveData>> = (
  _state,
  action
): UsersSlice => {
  const savedUsers: string | null = localStorage.getItem(
    `users-${action.payload.saveName}`
  );

  return savedUsers !== null
    ? (JSON.parse(decompressFromUTF16(savedUsers) as string) as UsersSlice)
    : generateUsers(action.payload.handle);
};

export const usersSlice = createSlice({
  name: "users",
  initialState: null as UsersSlice,
  reducers: {
    resetUsers: (_state: UsersSlice, _action: PayloadAction<null>) => null,
    loadUsersFromSaveFile: loadUsersFromSave,

    updateRatings: (state: UsersSlice, action: PayloadAction<RatingPoints>) => {
      if (state === null) return null;
      state.users.forEach((user) => {
        user.ratingHistory.push(action.payload[user.handle]);
      });

      return state;
    },
  },
});

export const { resetUsers, loadUsersFromSaveFile } = usersSlice.actions;
export const selectUsersWithTimeOfSnapshot = (state: RootState) => state.users;
export const selectUsers = (state: RootState) =>
  state.users ? state.users.users : null;
export const selectTimeOfSnapshot = (state: RootState) =>
  state.users ? state.users.timeOfSnapshot : null;
export const selectPlayer = (state: RootState) =>
  state.users ? state.users.users[0] : null;
export const usersReducer = usersSlice.reducer;
