import type { XPGain } from "../XP/types";

export type ProgressPageInterval = {
  progressPageIntervalStartInclusive: number;
  progressPageIntervalEndInclusive: number;
  progress: number;
  timestampInSecondsOfLastReadingOfStart: number | null;
};

export type BookReadingData = {
  id: number;
  currentStintStartTimestampInSecondsExclusive: number | null;
  progressPageIntervals: Array<ProgressPageInterval>;
  lastCountedTimeInSeconds: number | null;
  lastReadPage: number;
};

export type BookData = {
  id: number;
  title: string;
  author: string;
  description: string;
  goodFor: string;

  /**
   * Conventionally, a player reads one page every second, so hoursToRead will round to a multiple of 1/3600.
   */
  hoursToRead: number;
  baseXPGain: XPGain;
} & ({ imageURL?: string } | { imageSVG: JSX.Element });
