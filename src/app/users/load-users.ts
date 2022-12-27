import {
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_MIDPOINT,
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_SINGLE_LOGIT,
  ATTRIBUTE_GENERATION_STDEV,
  USER_ATTRIBUTES_CONSTANTS,
  USER_INITIAL_RATING,
} from "./constants";
import usersJSON from "./trimmedUsers.json" assert { type: "json" };
import { normal } from "@stdlib/random/base";
import type {
  AttributeValues,
  AttributeConstants,
  User,
  UserCore,
} from "./types";
import { sigmoid } from "../../utils/utils";
import { betaPrimeAltParam } from "../problems/utils";

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
  const attributeConstantsKeys = Object.keys(
    USER_ATTRIBUTES_CONSTANTS
  ) as Array<keyof AttributeConstants>;

  const userCore: UserCore = {
    handle,
    officialRating,
    country,
    ratingHistory: [
      { timestamp: Date.now(), rating: USER_INITIAL_RATING },
    ] as Array<RatingPoint>,
    attributes: Object.fromEntries(
      attributeConstantsKeys.map((attributeName) => [
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
        Math.round(100 * 3.5 * betaPrimeAltParam(1, 16)) / 100,
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
