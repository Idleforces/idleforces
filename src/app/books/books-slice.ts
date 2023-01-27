import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { BOOKS_DATA } from "./books";
import { computeInitialBookReadingData } from "./read-book";
import type { BookReadingData } from "./types";
import type { RootState } from "../store";
import { computeBookLengthByHoursToRead } from "./utils";

export type BooksSlice = Array<BookReadingData>;

export const booksSlice = createSlice({
  name: "books",
  initialState: BOOKS_DATA.map((bookData) =>
    computeInitialBookReadingData(
      computeBookLengthByHoursToRead(bookData.hoursToRead),
      bookData.id
    )
  ),
  reducers: {
    updateBookReadingData: (
      state: BooksSlice,
      action: PayloadAction<BookReadingData>
    ) =>
      state.map((bookReadingData) =>
        bookReadingData.id === action.payload.id
          ? action.payload
          : bookReadingData
      ),

    startBookReadingById: (
      state: BooksSlice,
      action: PayloadAction<{ id: number; currentTimeInSeconds: number }>
    ) =>
      state.map((bookReadingData) =>
        bookReadingData.id === action.payload.id
          ? {
              ...bookReadingData,
              currentStintStartTimestampInSecondsExclusive:
                action.payload.currentTimeInSeconds,
            }
          : bookReadingData
      ),

    stopBookReading: (state: BooksSlice, _action: PayloadAction<null>) =>
      state.map((bookReadingData) => ({
        ...bookReadingData,
        currentStintStartTimestampInSecondsExclusive: null,
      })),
  },
});

export const { updateBookReadingData, stopBookReading, startBookReadingById } =
  booksSlice.actions;
export const selectBooksReadingData = (state: RootState) => state.books;
export const selectBooksReadingDataByIdFactory =
  (id: number) => (state: RootState) =>
    state.books.find((bookReadingData) => bookReadingData.id === id);

export const booksReducer = booksSlice.reducer;
