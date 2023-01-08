import {
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_MIDPOINT,
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_SINGLE_LOGIT,
  ATTRIBUTE_GENERATION_STDEV,
  USER_ATTRIBUTES_CONSTANTS,
  USER_INITIAL_RATING,
} from "./constants";
import usersJSON from "./trimmed-users.json" assert { type: "json" };
import { normal } from "@stdlib/random/base";
import type { AttributeValues, User, UserCore } from "./types";
import { attributeNames } from "./types";
import { sigmoid } from "../../utils/utils";
import { betaPrimeAltParam } from "../problems/utils";
import type { UsersSlice } from "./users-slice";
import { decompressFromUTF16 } from "lz-string";

export type RatingPoint = {
  timestamp: number;
  rating: number;
};

export const generateUser = (
  handle: string,
  officialRating: number,
  country: string | null,
  isPlayer: boolean
): User => {
  const ratingHistory: Array<RatingPoint> = [
    { timestamp: Date.now(), rating: USER_INITIAL_RATING },
  ];

  const userCore: UserCore = {
    handle,
    officialRating,
    country,
    ratingHistory,
    attributes: Object.fromEntries(
      attributeNames.map((attributeName) => [
        attributeName,
        isPlayer
          ? 0
          : Math.round(
              100 *
                (USER_ATTRIBUTES_CONSTANTS[attributeName].MIN_VALUE +
                  (USER_ATTRIBUTES_CONSTANTS[attributeName].MAX_VALUE -
                    USER_ATTRIBUTES_CONSTANTS[attributeName].MIN_VALUE) *
                    sigmoid(
                      normal(
                        (officialRating -
                          ATTRIBUTE_GENERATION_OFFICIAL_RATING_MIDPOINT) /
                          ATTRIBUTE_GENERATION_OFFICIAL_RATING_SINGLE_LOGIT,
                        ATTRIBUTE_GENERATION_STDEV
                      )
                    ))
            ) / 100,
      ])
    ) as AttributeValues,
  };

  if (!isPlayer) {
    return {
      ...userCore,
      isPlayer,
      likelihoodOfCompeting:
        Math.round(100 * sigmoid(normal(-0.8, 0.75))) / 100,
      willingnessToTryHarderProblems:
        Math.round(100 * 0.25 * betaPrimeAltParam(1, 0.5)) / 100,
      expectedTimeMultiplierToSwitchToADifferentProblem:
        Math.round(100 * 2.5 * betaPrimeAltParam(1, 16)) / 100,
    };
  } else {
    return {
      ...userCore,
      isPlayer,
    };
  }
};

export const fetchUsers = () => {
  const timeOfSnapshot = usersJSON.timeOfSnapshot;
  const users = usersJSON.result;
  return { users, timeOfSnapshot };
};

export const generateUsers = (
  playerHandle: string
): { users: Array<User>; timeOfSnapshot: number } => {
  const NPCsWithTimeOfSnapshot = fetchUsers();
  const NPCs = NPCsWithTimeOfSnapshot.users.map((user) =>
    generateUser(user.handle, user.officialRating, user.country, false)
  );

  const usersWithTimeOfSnapshot = {
    users: [generateUser(playerHandle, USER_INITIAL_RATING, null, true)].concat(
      NPCs.filter((user) => user.handle !== playerHandle)
    ),
    timeOfSnapshot: NPCsWithTimeOfSnapshot.timeOfSnapshot,
  };

  return usersWithTimeOfSnapshot;
};

export const loadOrGenerateUsers = (
  saveName: string,
  handle: string
): Exclude<UsersSlice, null> => {
  const savedUsersJSON: string | null = localStorage.getItem(
    `users-${saveName}`
  );
  if (savedUsersJSON === null) return generateUsers(handle);

  const savedUsers = JSON.parse(
    decompressFromUTF16(savedUsersJSON) as string
  ) as UsersSlice;
  if (!savedUsers) return generateUsers(handle);

  return savedUsers;
};
