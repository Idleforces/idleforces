import {
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_MIDPOINT,
  ATTRIBUTE_GENERATION_OFFICIAL_RATING_SINGLE_LOGIT,
  ATTRIBUTE_GENERATION_STDEV,
  USER_ATTRIBUTES_CONSTANTS,
  USER_INITIAL_RATING,
} from "./constants";
import usersJSON from "./trimmed-users.json" assert { type: "json" };
import { normal } from "@stdlib/random/base";
import type { AttributeValues, NPC, Player, UserCore } from "./types";
import { attributeNames } from "./types";
import { sigmoid } from "../../utils/utils";
import { betaPrimeAltParam } from "../problems/utils";
import type { UsersSlice } from "./users-slice";
import { decompressFromUTF16 } from "lz-string";
import type { LocalStorageUsersValue } from "./save-users";

export type RatingPoint = {
  contestName: string | null;
  rating: number;
};

const generateUserCore = (
  handle: string,
  officialRating: number,
  country: string | null,
  isPlayer: boolean
): UserCore => {
  const ratingHistory: Array<RatingPoint> = [
    { contestName: null, rating: USER_INITIAL_RATING },
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

  return userCore;
};

export const generatePlayer = (
  handle: string,
  officialRating: number,
  country: string | null
): Player => {
  const userCore = generateUserCore(handle, officialRating, country, true);

  return {
    ...userCore,
    isPlayer: true,
  };
};

export const generateNPC = (
  handle: string,
  officialRating: number,
  country: string | null
): NPC => {
  const userCore = generateUserCore(handle, officialRating, country, false);

  return {
    ...userCore,
    isPlayer: false,
    likelihoodOfCompeting: Math.round(100 * sigmoid(normal(-0.8, 0.75))) / 100,
    willingnessToTryHarderProblems:
      Math.round(100 * 0.25 * betaPrimeAltParam(1, 0.5)) / 100,
    expectedTimeMultiplierToSwitchToADifferentProblem:
      Math.round(100 * 2.5 * betaPrimeAltParam(1, 16)) / 100,
  };
};

const fetchUsers = () => {
  const timeOfSnapshot = usersJSON.timeOfSnapshot;
  const users = usersJSON.result;
  return { users, timeOfSnapshot };
};

export const generateUsers = (playerHandle: string) => {
  const NPCsWithTimeOfSnapshot = fetchUsers();

  const NPCs = NPCsWithTimeOfSnapshot.users.map((NPC) =>
    generateNPC(NPC.handle, NPC.officialRating, NPC.country)
  );

  const player = generatePlayer(playerHandle, USER_INITIAL_RATING, null);

  const usersWithTimeOfSnapshot = {
    NPCs: NPCs.filter((NPC) => NPC.handle !== playerHandle),
    player,
    timeOfSnapshot: NPCsWithTimeOfSnapshot.timeOfSnapshot,
    ratingsUpdatedCount: 0,
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

  const savedUsers = JSON.parse(savedUsersJSON) as LocalStorageUsersValue;
  const savedNPCs = decompressFromUTF16(savedUsers.NPCs);
  if (savedNPCs === null) return generateUsers(handle);

  const users: Exclude<UsersSlice, null> = {
    player: JSON.parse(savedUsers.player) as Player,
    NPCs: JSON.parse(savedNPCs) as Array<NPC>,
    timeOfSnapshot: JSON.parse(savedUsers.timeOfSnapshot) as number,
    ratingsUpdatedCount: JSON.parse(savedUsers.ratingsUpdatedCount) as number,
  };

  return users;
};
