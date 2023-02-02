import type { AttributeConstants } from "./types";

export const USER_INITIAL_RATING = 1400;
export const ATTRIBUTE_GENERATION_OFFICIAL_RATING_MIDPOINT = 2000;
export const ATTRIBUTE_GENERATION_OFFICIAL_RATING_SINGLE_LOGIT = 800;
export const ATTRIBUTE_GENERATION_STDEV = 0.5;

// ts-prune-ignore-next
export const USER_ATTRIBUTES_CONSTANTS = {
  reading: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  dp: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  greedy: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  math: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  graphs: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  adHoc: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  trees: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  penPaperCare: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  implementationSpeed: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },

  implementationCare: {
    MAX_VALUE: 50,
    MIN_VALUE: 0,
    hardness: 1,
  },
} as const satisfies AttributeConstants;

export const USER_RATING_HISTORY_MAX_LENGTH = 20;
