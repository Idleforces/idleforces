import {
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_MIDPOINT,
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_SINGLE_LOGIT,
  ATTRIBUTE_GENERATION_STDEV,
  USER_ATTRIBUTES_CONSTANTS,
  USER_INITIAL_RATING,
} from "./constants";
import usersJSON from "./trimmedUsers.json" assert { type: "json" };
import { normal } from "@stdlib/random/base";
import { AttributeValues, AttributeConstants, AttributeValue } from "./types";
import { sigmoid } from "../../utils/utils";

export type RatingPoint = {
  time: number;
  rating: number;
};

const generateUser = (
  handle: string,
  officialRating: number,
  country: string | null,
  isPlayer: Boolean
) => {
  const attributeConstantsKeys = Object.keys(
    USER_ATTRIBUTES_CONSTANTS
  ) as Array<keyof AttributeConstants>;

  return {
    isPlayer,
    handle,
    officialRating,
    country,
    rating: USER_INITIAL_RATING,
    ratingHistory: [{ time: Date.now(), rating: USER_INITIAL_RATING }],
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
    likelihoodOfCompeting: Math.round(100 * sigmoid(normal(-0.5, 0.5))) / 100,
  };
};

export type User = ReturnType<typeof generateUser>;

export const fetchUsers = () => {
  const timeOfSnapshot = usersJSON.timeOfSnapshot;
  const users = usersJSON.result;
  return {users, timeOfSnapshot};
};

export const generateUsers = (playerHandle: string): {users: Array<User> | null, timeOfSnapshot: number} => {
  const NPCsWithTimeOfSnapshot = fetchUsers();
  const NPCs = NPCsWithTimeOfSnapshot.users.map((user) =>
    generateUser(user.handle, user.officialRating, user.country, false)
  );

  const usersWithTimeOfSnapshot = {
    users:  [generateUser(playerHandle, USER_INITIAL_RATING, null, true)].concat(
      NPCs.filter((user) => user.handle !== playerHandle)),
    timeOfSnapshot: NPCsWithTimeOfSnapshot.timeOfSnapshot
  };

  return usersWithTimeOfSnapshot;
};
