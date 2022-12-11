import { configureStore } from "@reduxjs/toolkit";
import { saveReducer } from "./save/saveSlice";
import { usersReducer } from "./users/usersSlice";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const store = configureStore({
  reducer: {
    save: saveReducer,
    users: usersReducer,
  },
});
