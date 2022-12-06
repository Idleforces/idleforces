import { createSlice } from "@reduxjs/toolkit";
import { fetchUsers, fetchUsersAbortController } from "./loadUsers";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface User {
  handle: string;
}

type UsersSlice = Promise<Array<User>> | null;

export const usersSlice = createSlice({
  name: "users",
  initialState: null,
  reducers: {
    resetUsers: (state: UsersSlice, _action: PayloadAction<null>) => {
        fetchUsersAbortController.abort();
        state = null;
    },

    loadUsersFromSaveFile: (state: UsersSlice, action: PayloadAction<string>) => {
        const savedUsers: string | null = localStorage.getItem(`users-${action.payload}`)
        if (savedUsers === null) 
            state = fetchUsers()
        else state = new Promise((resolve, _reject) => {
            resolve(JSON.parse(String(savedUsers)));
        })
    },

    saveUsers: (state: UsersSlice, action: PayloadAction<string>) => {
        state?.then(users => localStorage.setItem(`users-${action.payload}`, JSON.stringify(users)))
    }
  },
});

export const { resetUsers, loadUsersFromSaveFile, saveUsers } = usersSlice.actions;
export const selectUsers = (state: RootState) => state.users;
export const usersReducer = usersSlice.reducer;
