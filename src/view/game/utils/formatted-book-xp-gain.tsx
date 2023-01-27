import { BOOKS_DATA } from "../../../app/books/books";
import { selectBooksReadingDataByIdFactory } from "../../../app/books/books-slice";
import { processTickOfBookReading } from "../../../app/books/read-book";
import { useAppSelector } from "../../../app/hooks";
import { attributeNames } from "../../../app/users/types";
import { selectCurrentTimeInSeconds } from "../../../app/view/view-slice";

export const FormattedBookXPGain = (props: { id: number }) => {
  const { id } = props;
  const currentTimeInSeconds = useAppSelector(selectCurrentTimeInSeconds);
  const officialBookReadingData = useAppSelector(
    selectBooksReadingDataByIdFactory(id)
  );

  const book = BOOKS_DATA.find((bookData) => bookData.id === id);
  if (!officialBookReadingData || !book) return <></>;

  const baseXPGain = book.baseXPGain;
  const mockBookReadingData = {
    ...officialBookReadingData,
    currentStintStartTimestampInSecondsExclusive: currentTimeInSeconds - 1,
  };
  const { XPGain } = processTickOfBookReading(
    mockBookReadingData,
    baseXPGain,
    book.hoursToRead,
    currentTimeInSeconds
  );

  let ratio = 0;
  attributeNames.forEach((attributeName) => {
    if (baseXPGain[attributeName] ?? 0)
      ratio = (XPGain[attributeName] ?? 0) / (baseXPGain[attributeName] ?? 0);
  });

  if (ratio > 0.8)
    return <span style={{ color: "rgb(0, 100, 0)" }}>Great</span>;
  if (ratio > 0.5) return <span style={{ color: "rgb(35, 75, 0)" }}>Good</span>;
  if (ratio > 0.35)
    return <span style={{ color: "rgb(70, 50, 0)" }}>Average</span>;
  if (ratio > 0.2)
    return <span style={{ color: "rgb(105, 25, 0)" }}>Poor</span>;
  return <span style={{ color: "rgb(140, 0, 0)" }}>Very poor</span>;
};
