import { configureStore } from "@reduxjs/toolkit";

import { eventsReducer } from "./events/events-slice";
import { saveReducer } from "./save/save-slice";
import { usersReducer } from "./users/users-slice";
import { contestReducer } from "./contest/contest-slice";
import { contestArchiveReducer } from "./contest-archive/contest-archive-slice";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const store = configureStore({
  reducer: {
    save: saveReducer,
    users: usersReducer,
    events: eventsReducer,
    contest: contestReducer,
    contestArchive: contestArchiveReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
