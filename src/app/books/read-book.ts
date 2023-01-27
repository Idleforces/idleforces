import { cloneDeep } from "lodash";
import type { XPGain } from "../XP/types";
import { addXPGains, multiplyXPGainByScalar } from "../XP/utils";
import type { BookReadingData, ProgressPageInterval } from "./types";
import {
  addDataToProgressPageIntervals,
  computeBookLengthByHoursToRead,
  computeLastReadTimestamp,
  computeNextPage,
  computeProgressDiff,
  computeXPGainFromProgressDiff,
  findProgressPageInterval,
} from "./utils";

export const computeInitialBookReadingData = (
  bookLength: number,
  id: number
): BookReadingData => {
  return {
    currentStintStartTimestampInSecondsExclusive: null,
    progressPageIntervals: [
      {
        progressPageIntervalStartInclusive: 0,
        progressPageIntervalEndInclusive: bookLength - 1,
        progress: 0,
        timestampInSecondsOfLastReadingOfStart: null,
      },
    ],
    lastCountedTimeInSeconds: null,
    lastReadPage: bookLength - 1,
    id,
  };
};

export const processTickOfBookReading = (
  bookReadingData: BookReadingData,
  baseXPGain: XPGain,
  hoursToRead: number,
  currentTimeInSeconds: number
): { XPGain: XPGain; bookReadingData: BookReadingData } => {
  let XPGain: XPGain = {};
  const newBookReadingData = cloneDeep(bookReadingData);

  const currentStintStartTimestampInSecondsExclusive =
    bookReadingData.currentStintStartTimestampInSecondsExclusive;
  if (currentStintStartTimestampInSecondsExclusive === null)
    return {
      XPGain,
      bookReadingData,
    };

  const bookLength = computeBookLengthByHoursToRead(hoursToRead);
  const lastCountedTimeInSeconds =
    bookReadingData.lastCountedTimeInSeconds ?? -999_999_999;

  const firstConsideredTimestamp = Math.max(
    lastCountedTimeInSeconds + 1,
    currentStintStartTimestampInSecondsExclusive + 1
  );
  let timestampConsidered = firstConsideredTimestamp;

  while (timestampConsidered <= currentTimeInSeconds) {
    const numReadingRounds = Math.floor(
      (currentTimeInSeconds - timestampConsidered) / bookLength
    );

    if (
      timestampConsidered - firstConsideredTimestamp === bookLength &&
      numReadingRounds
    ) {
      const newProgressPageIntervals: Array<ProgressPageInterval> =
        newBookReadingData.progressPageIntervals.map((progressPageInterval) => {
          const progressDiffPerRound = computeProgressDiff(
            bookLength,
            0,
            bookLength
          );
          const oldProgress = progressPageInterval.progress;
          const newProgress =
            progressPageInterval.progress +
            progressDiffPerRound * numReadingRounds;

          const currentXPGain = multiplyXPGainByScalar(
            computeXPGainFromProgressDiff(oldProgress, newProgress, baseXPGain),
            progressPageInterval.progressPageIntervalEndInclusive -
              progressPageInterval.progressPageIntervalStartInclusive +
              1
          );

          XPGain = addXPGains(XPGain, currentXPGain);

          return {
            progressPageIntervalStartInclusive:
              progressPageInterval.progressPageIntervalStartInclusive,
            progressPageIntervalEndInclusive:
              progressPageInterval.progressPageIntervalEndInclusive,
            progress: newProgress,
            timestampInSecondsOfLastReadingOfStart:
              progressPageInterval.timestampInSecondsOfLastReadingOfStart !==
              null
                ? progressPageInterval.timestampInSecondsOfLastReadingOfStart +
                  numReadingRounds * bookLength
                : null,
          };
        });

      newBookReadingData.progressPageIntervals = newProgressPageIntervals;
      timestampConsidered += numReadingRounds * bookLength;
      newBookReadingData.lastCountedTimeInSeconds = timestampConsidered - 1;
      continue;
    }

    const currentPage = computeNextPage(
      newBookReadingData.lastReadPage,
      bookLength
    );
    newBookReadingData.lastReadPage = currentPage;
    newBookReadingData.lastCountedTimeInSeconds = timestampConsidered;

    const progressPageInterval = findProgressPageInterval(
      currentPage,
      bookLength,
      newBookReadingData.progressPageIntervals
    );
    const oldProgress = progressPageInterval.progress;
    const lastReadTimestamp = computeLastReadTimestamp(
      progressPageInterval,
      currentPage
    );
    const newProgress =
      computeProgressDiff(timestampConsidered, lastReadTimestamp, bookLength) +
      oldProgress;

    XPGain = addXPGains(
      XPGain,
      computeXPGainFromProgressDiff(oldProgress, newProgress, baseXPGain)
    );

    newBookReadingData.progressPageIntervals = addDataToProgressPageIntervals(
      timestampConsidered,
      newProgress,
      currentPage,
      bookLength,
      newBookReadingData.progressPageIntervals
    );

    timestampConsidered++;
  }

  return {
    XPGain,
    bookReadingData: newBookReadingData,
  };
};
