import type { AnyAction, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ContestEvent, EventsSlice } from "./types";

export const eventsSlice = createSlice({
  name: "events",
  initialState: null as EventsSlice,
  reducers: {
    resetEvents: (_state: EventsSlice, _action: PayloadAction<null>) => null,
    setEventsToEmptyArray: (
      _state: EventsSlice,
      _action: PayloadAction<null>
    ) => [],
    addEvent: (state: EventsSlice, action: PayloadAction<ContestEvent>) =>
      state ? [...state, action.payload] : [action.payload],
  },
});

export const { resetEvents, setEventsToEmptyArray, addEvent } =
  eventsSlice.actions;
export const selectEvents = (state: RootState) => state.events;
export const eventsReducer = eventsSlice.reducer;

export const saveEvent = (
  event: ContestEvent
): ThunkAction<void, RootState, undefined, AnyAction> => {
  return function saveEventThunk(dispatch, _getState) {
    dispatch(addEvent(event));
  };
};
