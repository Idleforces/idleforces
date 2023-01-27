import { exponential } from "@stdlib/random/base/";

export const resetNextEventIn = (nextEventIn: number): number => {
  return nextEventIn + exponential(1);
};
