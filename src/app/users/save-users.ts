import { compressToUTF16 } from "lz-string";
import { safeSetLocalStorageValue } from "../../utils/utils";
import type { UsersSlice } from "./users-slice";

export type LocalStorageUsersValue = Record<
  keyof Exclude<UsersSlice, null>,
  string
>;

export const saveUsers = async (
  state: UsersSlice,
  saveName: string,
  savedNPCsHash: string,
  NPCsHash: string,
  leaveGame: () => void
) => {
  if (state) {
    const localStorageUsersValueJSON = localStorage.getItem(
      `users-${saveName}`
    );

    const localStorageUsersValue =
      localStorageUsersValueJSON !== null
        ? (JSON.parse(localStorageUsersValueJSON) as LocalStorageUsersValue)
        : null;

    const NPCsJSON = JSON.stringify(state.NPCs);

    const compressedState: LocalStorageUsersValue = {
      player: JSON.stringify(state.player),
      NPCs:
        localStorageUsersValue === null || NPCsHash !== savedNPCsHash
          ? compressToUTF16(NPCsJSON)
          : localStorageUsersValue.NPCs,
      timeOfSnapshot: JSON.stringify(state.timeOfSnapshot),
      ratingsUpdatedCount: JSON.stringify(state.ratingsUpdatedCount),
    };

    await safeSetLocalStorageValue(
      `users-${saveName}`,
      JSON.stringify(compressedState),
      leaveGame
    );
  }
};
