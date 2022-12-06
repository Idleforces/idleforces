import { configureStore } from "@reduxjs/toolkit";
import { usersReducer } from "./users/usersSlice";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



export const store = configureStore({
  reducer: {
    users: usersReducer
  }
});

