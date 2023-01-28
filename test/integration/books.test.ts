import { describe, it, assert } from "vitest";
import { BOOKS_DATA } from "../../src/app/books/books";
import {
  computeInitialBookReadingData,
  processTickOfBookReading,
} from "../../src/app/books/read-book";
import { computeBookLengthByHoursToRead } from "../../src/app/books/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../../src/app/users/constants";
import { attributeNames } from "../../src/app/users/types";
import { XPToLevel } from "../../src/app/users/utils";
import type { XPGain } from "../../src/app/XP/types";
import { addXPGains } from "../../src/app/XP/utils";
import { declareRecordByInitializer } from "../../src/utils/utils";

describe("reading all books", () => {
  it("is fast and produces reasonable attribute levels", () => {
    let totalXPGain: XPGain = {};

    BOOKS_DATA.forEach((bookData) => {
      let bookReadingData = computeInitialBookReadingData(
        computeBookLengthByHoursToRead(bookData.hoursToRead),
        bookData.id
      );

      bookReadingData.currentStintStartTimestampInSecondsExclusive = -1;
      let XPGain: XPGain;
      ({ bookReadingData, XPGain } = processTickOfBookReading(
        bookReadingData,
        bookData.baseXPGain,
        bookData.hoursToRead,
        1_000_000_000
      ));

      totalXPGain = addXPGains(totalXPGain, XPGain);
    });

    const levels = declareRecordByInitializer(attributeNames, (attributeName) =>
      XPToLevel(
        totalXPGain[attributeName] ?? 0,
        USER_ATTRIBUTES_CONSTANTS[attributeName]
      )
    );

    attributeNames.forEach((attributeName) => {
      switch (attributeName) {
        case "implementationCare":
          assert.closeTo(levels[attributeName], 32, 5);
          break;
        case "implementationSpeed":
          assert.closeTo(levels[attributeName], 22, 5);
          break;
        case "penPaperCare":
          assert.closeTo(levels[attributeName], 30, 5);
          break;
        case "reading":
          assert.closeTo(levels[attributeName], 29, 5);
          break;
        default:
          assert.closeTo(levels[attributeName], 28, 5);
      }
    });
  });
});
