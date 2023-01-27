import { cloneDeep } from "lodash";
import { describe, expect, it } from "vitest";
import {
  computeInitialBookReadingData,
  processTickOfBookReading,
} from "../../../src/app/books/read-book";
import type { BookData, BookReadingData } from "../../../src/app/books/types";
import { computeBookLengthByHoursToRead } from "../../../src/app/books/utils";
import type { XPGain } from "../../../src/app/XP/types";
import { addXPGains } from "../../../src/app/XP/utils";

describe("during book reading process", () => {
  const mockBookData: BookData = {
    id: 0,
    title: "How to test software",
    author: "Steve Freeman, Nat Pryce",
    goodFor: "This test suite",
    description: `
      Test-Driven Development (TDD) is now an established technique for delivering better software faster.

      TDD is based on a simple idea: Write tests for your code before you write the code itself.
      `,
    hoursToRead: 8 / 3600,
    baseXPGain: {
      implementationCare: 1,
    },
  };
  const baseXPGain = mockBookData.baseXPGain;
  const hoursToRead = mockBookData.hoursToRead;

  const initialBookReadingData: BookReadingData = computeInitialBookReadingData(
    computeBookLengthByHoursToRead(hoursToRead),
    mockBookData.id
  );
  initialBookReadingData.currentStintStartTimestampInSecondsExclusive = -1;

  it("initial book reading data contains one big progress page interval", () => {
    expect(initialBookReadingData.progressPageIntervals.length).toBe(1);
    expect(initialBookReadingData.progressPageIntervals[0]).toMatchObject({
      progressPageIntervalStartInclusive: 0,
      progressPageIntervalEndInclusive: 7,
      progress: 0,
      timestampInSecondsOfLastReadingOfStart: null,
    });
  });

  it("contains two progress page intervals with correct data after one tick of reading", () => {
    const { bookReadingData } = processTickOfBookReading(
      initialBookReadingData,
      baseXPGain,
      hoursToRead,
      0
    );

    expect(bookReadingData.progressPageIntervals).toMatchObject([
      {
        progressPageIntervalEndInclusive: 7,
        progressPageIntervalStartInclusive: 1,
        progress: 0,
        timestampInSecondsOfLastReadingOfStart: null,
      },
      {
        progressPageIntervalStartInclusive: 0,
        progressPageIntervalEndInclusive: 0,
        progress: 1,
        timestampInSecondsOfLastReadingOfStart: 0,
      },
    ]);
    expect(bookReadingData.lastCountedTimeInSeconds).toBe(0);
    expect(bookReadingData.lastReadPage).toBe(0);
  });

  it("computes correct XP gain after one tick of reading", () => {
    const { XPGain } = processTickOfBookReading(
      initialBookReadingData,
      baseXPGain,
      hoursToRead,
      0
    );

    expect(XPGain.implementationCare).toBe(baseXPGain.implementationCare);
  });

  it("does not matter if some ticks are never explicitly performed", () => {
    let bookReadingDataDense = cloneDeep(initialBookReadingData);
    let bookReadingDataSparse = cloneDeep(initialBookReadingData);
    const iValuesPerformed = [6, 13, 27, 48, 49, 51, 100];

    for (let i = 0; i <= 100; i++) {
      bookReadingDataDense = processTickOfBookReading(
        bookReadingDataDense,
        baseXPGain,
        hoursToRead,
        i
      ).bookReadingData;

      if (iValuesPerformed.includes(i)) {
        bookReadingDataSparse = processTickOfBookReading(
          bookReadingDataSparse,
          baseXPGain,
          hoursToRead,
          i
        ).bookReadingData;
      }
    }

    const expectedBookReadingData = {
      currentStintStartTimestampInSecondsExclusive: -1,
      progressPageIntervals: [
        {
          progressPageIntervalEndInclusive: 7,
          progressPageIntervalStartInclusive: 5,
          progress: 2.1565060476475755,
          timestampInSecondsOfLastReadingOfStart: 93,
        },
        {
          progressPageIntervalStartInclusive: 0,
          progressPageIntervalEndInclusive: 4,
          progress: 2.2616429610700823,
          timestampInSecondsOfLastReadingOfStart: 96,
        },
      ],
      lastCountedTimeInSeconds: 100,
      lastReadPage: 4,
      id: 0,
    };

    expect(bookReadingDataDense).toMatchObject(expectedBookReadingData);
    expect(bookReadingDataSparse).toMatchObject(expectedBookReadingData);
  });

  it("turning reading on and off fragments progress page intervals", () => {
    let bookReadingData = cloneDeep(initialBookReadingData);

    const timestamps = [0, 6, 100, 10000];
    timestamps.forEach((timestamp) => {
      bookReadingData.currentStintStartTimestampInSecondsExclusive =
        timestamp - 1;

      let totalXPGain: XPGain = {};

      for (let i = 0; i < 3; i++) {
        let XPGain: XPGain;
        ({ bookReadingData, XPGain } = processTickOfBookReading(
          bookReadingData,
          baseXPGain,
          hoursToRead,
          timestamp + i
        ));

        totalXPGain = addXPGains(totalXPGain, XPGain);
      }
    });

    expect(bookReadingData).toMatchObject({
      currentStintStartTimestampInSecondsExclusive: 9999,
      progressPageIntervals: [
        {
          progressPageIntervalEndInclusive: 5,
          progressPageIntervalStartInclusive: 4,
          progress: 1,
          timestampInSecondsOfLastReadingOfStart: 7,
        },
        {
          progressPageIntervalStartInclusive: 6,
          progressPageIntervalEndInclusive: 7,
          progress: 1,
          timestampInSecondsOfLastReadingOfStart: 100,
        },
        {
          progressPageIntervalStartInclusive: 0,
          progressPageIntervalEndInclusive: 0,
          progress: 1.4968527371016696,
          timestampInSecondsOfLastReadingOfStart: 102,
        },
        {
          progressPageIntervalStartInclusive: 1,
          progressPageIntervalEndInclusive: 2,
          progress: 1.9740591436887172,
          timestampInSecondsOfLastReadingOfStart: 10000,
        },
        {
          progressPageIntervalStartInclusive: 3,
          progressPageIntervalEndInclusive: 3,
          progress: 1.974053700206377,
          timestampInSecondsOfLastReadingOfStart: 10002,
        },
      ],
      lastCountedTimeInSeconds: 10002,
      lastReadPage: 3,
      id: 0,
    });
  });
});
