import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { lowerCase } from "lodash";
import React, { useState } from "react";
import { useParams } from "react-router";
import { selectArchivedContests } from "../../../app/contest-archive/contest-archive-slice";
import {
  selectFriends,
  toggleFriend,
} from "../../../app/friends/friends-slice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectHandle } from "../../../app/save/save-slice";
import { selectUsers } from "../../../app/users/users-slice";
import { Flag } from "../utils/flag";
import {
  computeContestIdFromRatingPoint,
  computeXCoordFromContestId,
  computeYCoordFromRating,
  RatingGraph,
} from "../utils/rating-graph";
import { RatingStyled } from "../utils/styled-rating";
import { computeUserTitle } from "../utils/user-titles";
import "./profile.css";

export const Profile = () => {
  const params = useParams();
  const handle = params["user"];

  const playerHandle = useAppSelector(selectHandle);
  const users = useAppSelector(selectUsers);
  const contestArchive = useAppSelector(selectArchivedContests);
  const friends = useAppSelector(selectFriends);
  const dispatch = useAppDispatch();

  const [hiddenHoverContestData, setHiddenHoverContestData] = useState<
    Array<boolean>
  >([]);

  if (handle === undefined || !users) return <></>;
  const user = users.find((searchedUser) => searchedUser.handle === handle);
  if (!user) return <></>;

  const ratingHistory = user.ratingHistory;
  const ratings = ratingHistory.map((ratingPoint) => ratingPoint.rating);
  const rating = Math.round(ratings.slice(-1)[0]);

  const maxRating = Math.round(Math.max(...ratings));
  const minRating = Math.min(...ratings);

  const maxViewRating = Math.max(
    maxRating + 300,
    1.4 * maxRating - 0.4 * minRating
  );
  const minViewRating = Math.min(
    minRating - 300,
    1.4 * minRating - 0.4 * maxRating
  );
  const viewBoxWidth = 2.5;
  const viewBoxHeight = 1;
  const globals = { maxViewRating, minViewRating, viewBoxHeight, viewBoxWidth };
  const ratingBounds = [1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000];

  const contestIds = ratingHistory.map((ratingPoint) =>
    computeContestIdFromRatingPoint(ratingPoint, contestArchive)
  );

  if (!hiddenHoverContestData.length)
    setHiddenHoverContestData(ratingHistory.map((_) => true));

  const isFriend = friends.includes(handle) || handle === playerHandle;

  return (
    <div id="profile-page">
      <div id="user-info-container">
        <p>
          <RatingStyled
            stringToStyle={computeUserTitle(rating)}
            rating={rating}
            nutellaFormatting={false}
          />
        </p>
        <h2>
          <Flag countryName={user.country} />
          <RatingStyled stringToStyle={user.handle} rating={rating} />
          <span
            id="toggle-friend-button"
            tabIndex={0}
            onClick={(_e) => dispatch(toggleFriend(handle))}
          >
            <FontAwesomeIcon
              icon={[`fa${isFriend ? "s" : "r"}`, "star"]}
              className={isFriend ? "friend" : "not-friend"}
              />
          </span>
        </h2>
        <p>
          Contest rating:{" "}
          {
            <RatingStyled
              stringToStyle={rating}
              rating={rating}
              nutellaFormatting={false}
            />
          }{" "}
          (max.{" "}
          {
            <RatingStyled
              stringToStyle={maxRating}
              rating={maxRating}
              nutellaFormatting={false}
            />
          }
          ,{" "}
          {
            <RatingStyled
              stringToStyle={lowerCase(computeUserTitle(maxRating))}
              rating={maxRating}
              nutellaFormatting={false}
            />
          }
          )
        </p>
      </div>
      <div id="rating-graph-container">
        <div id="rating-graph-dummy-container">
          <RatingGraph
            ratingHistory={ratingHistory}
            globals={globals}
            setHiddenHoverContestData={setHiddenHoverContestData}
          />
          {ratingBounds.map((ratingBound) => {
            const ratingBoundYCoord = computeYCoordFromRating(
              ratingBound,
              globals
            );
            if (ratingBoundYCoord >= 0 && ratingBoundYCoord <= viewBoxHeight) {
              return (
                <div
                  className="rating-graph-y-axis-marker"
                  key={ratingBound}
                  style={{
                    top: `calc(${
                      (ratingBoundYCoord * 100) / viewBoxHeight
                    }% - 0.7rem)`,
                  }}
                >
                  {ratingBound}
                </div>
              );
            } else return <React.Fragment key={ratingBound}></React.Fragment>;
          })}
          {ratings.map((historicalRating, index) => {
            const contestId = contestIds[index] - 1;
            const ratingYCoord = computeYCoordFromRating(
              historicalRating,
              globals
            );
            const ratingXCoord = computeXCoordFromContestId(
              contestId + 1,
              contestArchive,
              viewBoxWidth
            );
            const contestName = ratingHistory[index].contestName;

            if (index) {
              const prevRating = ratings[index - 1];
              const ratingDiff = Math.round(historicalRating - prevRating);

              return (
                <div
                  key={index}
                  className="rating-graph-hover-contest-data"
                  hidden={hiddenHoverContestData[index]}
                  style={{
                    top: `calc(${
                      (ratingYCoord * 100) / viewBoxHeight
                    }% - 0.7rem)`,
                    left: `calc(${(ratingXCoord * 100) / viewBoxWidth}% - ${
                      ratingXCoord < 0.5 * viewBoxWidth ? "-6rem" : "20rem"
                    })`,
                  }}
                >
                  <p>{contestName}</p>
                  <p>
                    Rating: {Math.round(historicalRating)}{" "}
                    {ratingDiff > 0 ? `(+${ratingDiff})` : `(${ratingDiff})`},{" "}
                    {lowerCase(computeUserTitle(rating))}
                  </p>
                </div>
              );
            } else
              return (
                <div
                  key={index}
                  className="rating-graph-hover-contest-data"
                  hidden={hiddenHoverContestData[index]}
                  style={{
                    top: `calc(${
                      (ratingYCoord * 100) / viewBoxHeight
                    }% - 0.7rem)`,
                    left: `calc(${(ratingXCoord * 100) / viewBoxWidth}% - ${
                      ratingXCoord < 0.5 * viewBoxWidth ? "-6rem" : "20rem"
                    })`,
                  }}
                >
                  <p>Initial rating</p>
                  <p>
                    Rating: {Math.round(historicalRating)},{" "}
                    {lowerCase(computeUserTitle(historicalRating))}
                  </p>
                </div>
              );
          })}
        </div>
      </div>
    </div>
  );
};
