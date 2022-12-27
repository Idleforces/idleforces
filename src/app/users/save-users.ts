import { compressToUTF16 } from "lz-string";
import { safeSetLocalStorageValue } from "../../utils/utils";
import type { UsersSlice } from "./users-slice";

export const saveUsers = (state: UsersSlice, saveName: string, leaveGame: () => void) => {
  if (state) {
    const usersJSON = JSON.stringify(state);
    const compressedJSON = compressToUTF16(usersJSON);
    safeSetLocalStorageValue(`users-${saveName}`, compressedJSON, leaveGame);
  }
};
