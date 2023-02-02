import { atan } from "@stdlib/math/base/special/";
import { betaPrimeAltParam } from "../problems/utils";
import type { XPGain } from "../XP/types";
import { multiplyXPGainByScalar } from "../XP/utils";
import {
  BOOK_READING_PROGRESS_GAIN_EXPONENT,
  BOOK_READING_PROGRESS_SCALING_FACTOR,
  BOOK_XP_GAIN_DISTRIBUTION_PRECISION,
  BOOK_XP_GAIN_EXPONENT,
} from "./constants";
import type { ProgressPageInterval } from "./types";

export const computeBookLengthByHoursToRead = (hoursToRead: number) =>
  Math.round(hoursToRead * 3600);

const computePrevPage = (page: number, bookLength: number) =>
  page > 0 ? page - 1 : bookLength - 1;
export const computeNextPage = (page: number, bookLength: number) =>
  page < bookLength - 1 ? page + 1 : 0;

const computeXPGainMultiplierFromProgress = (progress: number) => {
  const XPGainMultiplier =
    (Math.pow(Math.E, -BOOK_XP_GAIN_EXPONENT) -
      Math.pow(Math.E, -progress * BOOK_XP_GAIN_EXPONENT)) /
      BOOK_XP_GAIN_EXPONENT +
    1;

  return progress === 0 ? 0 : XPGainMultiplier;
};

export const computeXPGainFromProgressDiff = (
  oldProgress: number,
  newProgress: number,
  baseXPGain: XPGain,
  XPGainStdevMultiplier?: number
) => {
  const baseXPGainMultiplier =
    computeXPGainMultiplierFromProgress(newProgress) -
    computeXPGainMultiplierFromProgress(oldProgress);

  const XPGainMultiplier =
    baseXPGainMultiplier *
    (1 +
      (betaPrimeAltParam(1, BOOK_XP_GAIN_DISTRIBUTION_PRECISION) - 1) *
        (XPGainStdevMultiplier ?? 1));

  return multiplyXPGainByScalar(baseXPGain, XPGainMultiplier);
};

const isInsideProgressPageInterval = (
  pageNumber: number,
  progressPageInterval: ProgressPageInterval
) =>
  progressPageInterval.progressPageIntervalEndInclusive >= pageNumber &&
  progressPageInterval.progressPageIntervalStartInclusive <= pageNumber;

export const findProgressPageInterval = (
  pageNumber: number,
  bookLength: number,
  progressPageIntervals: Array<ProgressPageInterval>
) => {
  if (
    pageNumber < 0 ||
    pageNumber >= bookLength ||
    !Number.isInteger(pageNumber)
  )
    throw Error("Bad page number");
  const foundProgressPageInterval = progressPageIntervals.find(
    (progressPageInterval) =>
      isInsideProgressPageInterval(pageNumber, progressPageInterval)
  );

  if (!foundProgressPageInterval)
    throw Error("Could not find progress page interval");
  return foundProgressPageInterval;
};

const deletePageFromProgressPageInterval = (
  pageNumber: number,
  progressPageIntervals: Array<ProgressPageInterval>
) => {
  return progressPageIntervals
    .map((progressPageInterval) => {
      if (isInsideProgressPageInterval(pageNumber, progressPageInterval)) {
        const replacementIntervals: Array<ProgressPageInterval> = [];
        const progress = progressPageInterval.progress;
        const timestampInSecondsOfLastReadingOfStart =
          progressPageInterval.timestampInSecondsOfLastReadingOfStart;

        if (
          pageNumber > progressPageInterval.progressPageIntervalStartInclusive
        ) {
          replacementIntervals.push({
            progressPageIntervalStartInclusive:
              progressPageInterval.progressPageIntervalStartInclusive,
            progressPageIntervalEndInclusive: pageNumber - 1,
            progress,
            timestampInSecondsOfLastReadingOfStart,
          });
        }

        if (
          pageNumber < progressPageInterval.progressPageIntervalEndInclusive
        ) {
          replacementIntervals.push({
            progressPageIntervalEndInclusive:
              progressPageInterval.progressPageIntervalEndInclusive,
            progressPageIntervalStartInclusive: pageNumber + 1,
            progress,
            timestampInSecondsOfLastReadingOfStart:
              progressPageInterval.timestampInSecondsOfLastReadingOfStart !==
              null
                ? progressPageInterval.timestampInSecondsOfLastReadingOfStart +
                  pageNumber +
                  1 -
                  progressPageInterval.progressPageIntervalStartInclusive
                : null,
          });
        }

        return replacementIntervals;
      } else return progressPageInterval;
    })
    .flat();
};

export const addDataToProgressPageIntervals = (
  currentTimeInSeconds: number,
  progress: number,
  pageNumber: number,
  bookLength: number,
  progressPageIntervals: Array<ProgressPageInterval>
): Array<ProgressPageInterval> => {
  let mergeWithPrevious = false;
  const previousPageNumber = computePrevPage(pageNumber, bookLength);

  if (pageNumber) {
    const previousPageInterval = findProgressPageInterval(
      previousPageNumber,
      bookLength,
      progressPageIntervals
    );

    const previousReadingTimestamp =
      previousPageInterval.timestampInSecondsOfLastReadingOfStart !== null
        ? previousPageInterval.timestampInSecondsOfLastReadingOfStart +
          previousPageNumber -
          previousPageInterval.progressPageIntervalStartInclusive
        : null;

    if (
      previousPageInterval.progress === progress &&
      previousReadingTimestamp !== null &&
      previousReadingTimestamp + 1 === currentTimeInSeconds
    )
      mergeWithPrevious = true;
  }

  if (!mergeWithPrevious) {
    const newProgressPageInterval: ProgressPageInterval = {
      progressPageIntervalStartInclusive: pageNumber,
      progressPageIntervalEndInclusive: pageNumber,
      progress,
      timestampInSecondsOfLastReadingOfStart: currentTimeInSeconds,
    };

    return deletePageFromProgressPageInterval(
      pageNumber,
      progressPageIntervals
    ).concat([newProgressPageInterval]);
  } else {
    return deletePageFromProgressPageInterval(
      pageNumber,
      progressPageIntervals
    ).map((progressPageInterval) => {
      if (
        pageNumber &&
        isInsideProgressPageInterval(previousPageNumber, progressPageInterval)
      ) {
        return {
          ...progressPageInterval,
          progressPageIntervalEndInclusive: pageNumber,
        };
      }

      return progressPageInterval;
    });
  }
};

export const computeLastReadTimestamp = (
  progressPageInterval: ProgressPageInterval,
  pageNumber: number
) => {
  if (progressPageInterval.timestampInSecondsOfLastReadingOfStart === null)
    return null;
  return (
    progressPageInterval.timestampInSecondsOfLastReadingOfStart +
    (pageNumber - progressPageInterval.progressPageIntervalStartInclusive)
  );
};

export const computeProgressDiff = (
  currentTimestamp: number,
  lastReadTimestamp: number | null,
  bookLength: number
) => {
  if (lastReadTimestamp === null) return 1;

  return (
    (2 *
      atan(
        Math.pow(
          (currentTimestamp - lastReadTimestamp) / bookLength,
          BOOK_READING_PROGRESS_GAIN_EXPONENT
        ) / BOOK_READING_PROGRESS_SCALING_FACTOR
      )) /
    Math.PI
  );
};
