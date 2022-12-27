import type { AnyAction } from "@reduxjs/toolkit";
import { assert } from "vitest";
import type { ContestEvent } from "../../src/app/events/types";

export enum mockActionTypes {
  addEvent = "events/addEvent",
}

export const mockStore = {
  events: [] as Array<ContestEvent>,
  mockDispatch: (action: AnyAction) => {
    assert.include(
      Object.values(mockActionTypes),
      action.type,
      `Please include handling of an action of type ${
        action.type as string
      } in the mock store.`
    );

    switch (action.type as mockActionTypes) {
      case "events/addEvent":
        mockStore.events.push(action.payload as ContestEvent);
        break;
    }
  },
};

export type MockDispatch = typeof mockStore.mockDispatch;
