import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { NPC, Player, User } from "./types";
import type { RatingPoints } from "../contest/types";
import { USER_RATING_HISTORY_MAX_LENGTH } from "./constants";
import type { XPGain } from "../XP/types";
import { modifyAttributesAccordingToXPGain } from "../XP/xp-calculation-base";

export type UsersSlice = {
  NPCs: Array<NPC>;
  player: Player;
  timeOfSnapshot: number;
  ratingsUpdatedCount: number;
} | null;

const updateUserRatingHistory = (user: User, ratingPoints: RatingPoints) => {
  const newUserRatingPoint = ratingPoints[user.handle];
  if (newUserRatingPoint) user.ratingHistory.push(newUserRatingPoint);
  if (
    !user.isPlayer &&
    user.ratingHistory.length >= USER_RATING_HISTORY_MAX_LENGTH
  )
    user.ratingHistory.shift();
};

const usersSlice = createSlice({
  name: "users",
  initialState: null as UsersSlice,
  reducers: {
    resetUsers: (_state: UsersSlice, _action: PayloadAction<null>) => null,
    setUsers: (_state: UsersSlice, action: PayloadAction<UsersSlice>) =>
      action.payload,

    updateRatings: (state: UsersSlice, action: PayloadAction<RatingPoints>) => {
      if (state === null) return null;
      state.NPCs.forEach((user) => {
        updateUserRatingHistory(user, action.payload);
      });
      updateUserRatingHistory(state.player, action.payload);

      state.ratingsUpdatedCount += 1;
    },

    applyXPGain: (state: UsersSlice, action: PayloadAction<XPGain>) => {
      if (state === null) return null;
      const newPlayer = modifyAttributesAccordingToXPGain(
        state.player,
        action.payload
      );
      return {
        ...state,
        player: newPlayer,
      };
    },
  },
});

export const { resetUsers, setUsers, updateRatings, applyXPGain } =
  usersSlice.actions;

export const selectUsersWithTimeOfSnapshot = (state: RootState) => state.users;
export const selectUsers = (state: RootState) =>
  state.users ? [state.users.player, ...state.users.NPCs] : null;
export const selectTimeOfSnapshot = (state: RootState) =>
  state.users ? state.users.timeOfSnapshot : null;
export const selectPlayer = (state: RootState) =>
  state.users ? state.users.player : null;
export const selectRatingsUpdatedCount = (state: RootState) =>
  state.users ? state.users.ratingsUpdatedCount : null;

export const usersReducer = usersSlice.reducer;
