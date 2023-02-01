import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { BOOKS_DATA } from "../../../app/books/books";
import {
  selectBooksReadingData,
  selectIdOfCurrentlyReadBook,
  startBookReadingById,
  stopBookReading,
} from "../../../app/books/books-slice";
import type { BookData } from "../../../app/books/types";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectActivity, setActivity } from "../../../app/save/save-slice";
import { selectCurrentTimeInSeconds } from "../../../app/view/view-slice";
import { declareRecordByInitializer } from "../../../utils/utils";
import { computeActivityErrorMessage } from "../utils/activity-error-message";
import { FormattedBookXPGain } from "../utils/formatted-book-xp-gain";
import "./library.css";

export const Library = () => {
  const currentTimeInSeconds = useAppSelector(selectCurrentTimeInSeconds);
  const booksReadingData = useAppSelector(selectBooksReadingData);
  const activity = useAppSelector(selectActivity);
  const currentlyReadBookId = useAppSelector(selectIdOfCurrentlyReadBook);

  const dispatch = useAppDispatch();

  const [showExtendedById, setShowExtendedById] = useState(
    declareRecordByInitializer(
      booksReadingData.map((bookReadingData) => bookReadingData.id),
      (_id) => false
    )
  );

  return (
    <div id="library-page">
      {booksReadingData.map((bookReadingData) => {
        const id = bookReadingData.id;
        const bookData = BOOKS_DATA.find(
          (traversedBookData) => traversedBookData.id === id
        ) as BookData;

        return (
          <div id="book-container" key={id}>
            <div id="book-base-container">
              <div className="book-title-container">
                <FontAwesomeIcon icon={["fas", "book"]} className="book-icon" />
                <span className="bold">{bookData.title}</span>
              </div>
              <span className="book-author-container">{bookData.author}</span>
              <button
                className="remove-default-styles book-dropdown-toggle"
                onClick={(_e) => {
                  setShowExtendedById((prev) => ({ ...prev, [id]: !prev[id] }));
                }}
              >
                <FontAwesomeIcon
                  icon={
                    showExtendedById[id]
                      ? ["fas", "caret-up"]
                      : ["fas", "caret-down"]
                  }
                />
              </button>
            </div>
            {showExtendedById[id] ? (
              <div className="book-extended-container">
                {BOOKS_DATA[id].imageURL !== undefined ? (
                  <img
                    src={BOOKS_DATA[id].imageURL}
                    alt={BOOKS_DATA[id].title}
                    className="book-image"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={["far", "image"]}
                    className="book-image"
                  />
                )}
                <p>
                  <b>Ability to gain insights:</b>{" "}
                  <FormattedBookXPGain id={id} />
                </p>
                <p>
                  <b>Good for:</b> {BOOKS_DATA[id].goodFor}
                </p>
                <p>
                  <b>Hours to read:</b>
                  {BOOKS_DATA[id].hoursToRead}
                </p>
                <div>
                  <b>Description:</b>
                  <ReactMarkdown>{BOOKS_DATA[id].description}</ReactMarkdown>
                </div>
                {activity === "book-reading" && id === currentlyReadBookId ? (
                  <button
                    onClick={(_e) => {
                      dispatch(stopBookReading(null));
                      dispatch(setActivity(null));
                    }}
                  >
                    Stop book reading
                  </button>
                ) : !activity || activity === "book-reading" ? (
                  <button
                    onClick={(_e) => {
                      dispatch(
                        startBookReadingById({ id, currentTimeInSeconds })
                      );
                      dispatch(setActivity("book-reading"));
                    }}
                  >
                    Start book reading
                  </button>
                ) : (
                  <button disabled>
                    {computeActivityErrorMessage(activity)}
                  </button>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </div>
  );
};
