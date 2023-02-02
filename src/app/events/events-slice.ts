import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ContestEvent, EventsSlice } from "./types";

const eventsSlice = createSlice({
  name: "events",
  initialState: null as EventsSlice,
  reducers: {
    resetEvents: (_state: EventsSlice, _action: PayloadAction<null>) => null,
    setEvents: (_state: EventsSlice, action: PayloadAction<EventsSlice>) =>
      action.payload,
    setEventsToEmptyArray: (
      _state: EventsSlice,
      _action: PayloadAction<null>
    ) => [],
    addEvent: (state: EventsSlice, action: PayloadAction<ContestEvent>) =>
      state ? [...state, action.payload] : [action.payload],
  },
});

export const { resetEvents, setEvents, setEventsToEmptyArray, addEvent } =
  eventsSlice.actions;
export const selectEvents = (state: RootState) => state.events;
export const eventsReducer = eventsSlice.reducer;
