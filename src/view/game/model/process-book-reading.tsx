import { useEffect } from "react";
import { BOOKS_DATA } from "../../../app/books/books";
import {
  selectBooksReadingDataByIdFactory,
  selectIdOfCurrentlyReadBook,
  updateBookReadingData,
} from "../../../app/books/books-slice";
import { processTickOfBookReading } from "../../../app/books/read-book";
import type { BookReadingData } from "../../../app/books/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectActivity } from "../../../app/save/save-slice";
import { applyXPGain } from "../../../app/users/users-slice";
import {
  selectCurrentTimeInSeconds,
  setLastXPGainData,
} from "../../../app/view/view-slice";
import type { XPGain } from "../../../app/XP/types";

export const ProcessBookReading = () => {
  const dispatch = useAppDispatch();

  const activity = useAppSelector(selectActivity);
  const currentTimeInSeconds = useAppSelector(selectCurrentTimeInSeconds);

  const currentlyReadBookId = useAppSelector(selectIdOfCurrentlyReadBook);
  const currentlyReadBookReadingData = useAppSelector(
    selectBooksReadingDataByIdFactory(currentlyReadBookId)
  );
  const currentlyReadBookData = BOOKS_DATA.find(
    (bookData) => bookData.id === currentlyReadBookId
  );

  useEffect(() => {
    if (
      activity === "book-reading" &&
      currentlyReadBookReadingData &&
      currentlyReadBookData
    ) {
      let bookReadingData: BookReadingData;
      let XPGain: XPGain;

      ({ bookReadingData, XPGain } = processTickOfBookReading(
        currentlyReadBookReadingData,
        currentlyReadBookData.baseXPGain,
        currentlyReadBookData.hoursToRead,
        currentTimeInSeconds
      ));

      dispatch(updateBookReadingData(bookReadingData));
      dispatch(applyXPGain(XPGain));
      dispatch(setLastXPGainData({ XPGain, secondsVisible: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, currentTimeInSeconds]);

  return <></>;
};
