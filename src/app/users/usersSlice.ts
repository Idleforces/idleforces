import { CaseReducer, createSlice } from "@reduxjs/toolkit";
import { generateUsers } from "./loadUsers";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { User } from "./loadUsers";
import { decompressFromUTF16 } from "lz-string";

type SaveData = {
  saveName: string;
  handle: string;
};

export type UsersSlice = {users: Array<User>, timeOfSnapshot: number} | null;
const loadUsersFromSave: CaseReducer<UsersSlice, PayloadAction<SaveData>> = (
  state,
  action
) => {
  const savedUsers: string | null = localStorage.getItem(
    `users-${action.payload.saveName}`
  );

  return savedUsers
    ? JSON.parse(decompressFromUTF16(savedUsers) as string)
    : generateUsers(action.payload.handle).users;
};

export const usersSlice = createSlice({
  name: "users",
  initialState: null as UsersSlice,
  reducers: {
    resetUsers: (state: UsersSlice, _action: PayloadAction<null>) => {
      state = null;
    },
    loadUsersFromSaveFile: loadUsersFromSave,
  },
});

export const { resetUsers, loadUsersFromSaveFile } =
  usersSlice.actions;
export const selectUsersWithTimeOfSnapshot = (state: RootState) => state.users;
export const selectUsers = (state: RootState) => state.users?.users;
export const selectTimeOfSnapshot = (state: RootState) => state.users?.timeOfSnapshot;
export const selectPlayer = (state: RootState) => (state.users ? state.users.users[0] : null);
export const usersReducer = usersSlice.reducer;
