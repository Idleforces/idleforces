import { useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RatingPoint } from "../../../app/users/load-users";
import { useAppSelector } from "../../../app/hooks";
import { selectArchivedContests } from "../../../app/contest-archive/contest-archive-slice";
import type { ContestArchiveSlice } from "../../../app/contest-archive/types";

export const computeContestIdFromRatingPoint = (
  ratingPoint: RatingPoint,
  contestArchive: ContestArchiveSlice
) => {
  return (
    contestArchive.findIndex(
      (archivedContest) => archivedContest.name === ratingPoint.contestName
    ) + 1
  );
};

export const computeXCoordFromContestId = (
  contestId: number,
  contestArchive: ContestArchiveSlice,
  viewBoxWidth: number
) => {
  if (!contestArchive.length) return viewBoxWidth / 2;
  return (
    (contestId * 0.9 * viewBoxWidth) / contestArchive.length +
    0.05 * viewBoxWidth
  );
};

export const computeYCoordFromRating = (
  rating: number,
  globals: {
    maxViewRating: number;
    minViewRating: number;
    viewBoxHeight: number;
  }
) => {
  const { maxViewRating, minViewRating, viewBoxHeight } = globals;
  return (
    ((maxViewRating - rating) / (maxViewRating - minViewRating)) * viewBoxHeight
  );
};

const computeHeightFromRatingDiff = (
  ratingDiff: number,
  globals: {
    maxViewRating: number;
    minViewRating: number;
    viewBoxHeight: number;
  }
) => {
  const { maxViewRating, minViewRating, viewBoxHeight } = globals;
  return (ratingDiff * viewBoxHeight) / (maxViewRating - minViewRating);
};

export const RatingGraph = (props: {
  ratingHistory: Array<RatingPoint>;
  globals: {
    minViewRating: number;
    maxViewRating: number;
    viewBoxWidth: number;
    viewBoxHeight: number;
  };
  setHiddenHoverContestData: Dispatch<SetStateAction<Array<boolean>>>;
}) => {
  const contestArchive = useAppSelector(selectArchivedContests);

  const ratingHistory = props.ratingHistory;
  const globals = props.globals;
  const setHiddenHoverContestData = props.setHiddenHoverContestData;
  const viewBoxWidth = globals.viewBoxWidth;

  const ratings = ratingHistory.map((ratingPoint) => ratingPoint.rating);
  const contestIds = ratingHistory.map((ratingPoint) =>
    computeContestIdFromRatingPoint(ratingPoint, contestArchive)
  );

  const svgRef = useRef<SVGSVGElement | null>(null);

  const ratingPointStrokeWidth = "3px";
  const ratingPointRadius =
    (viewBoxWidth * Math.pow(contestArchive.length + 1, -0.2)) / 60;
  const pathStrokeWidth = 0.007;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${viewBoxWidth} ${globals.viewBoxHeight}`}
      version="1.1"
      id="rating-graph"
    >
      <defs id="defs2">
        <linearGradient id="rating-point-gradient"></linearGradient>
        {ratingHistory.map((_ratingPoint, index) => (
          <radialGradient
            id={`radial-rating-point-gradient-${index}`}
            key={index}
          >
            <stop
              style={{ stopColor: "#faf1c0", stopOpacity: 1 }}
              offset="0.58734179"
            />
            <stop style={{ stopColor: "#e8c000", stopOpacity: 1 }} offset="1" />
          </radialGradient>
        ))}
      </defs>
      <g id={"rating-graph-background"}>
        <rect
          style={{ fill: "#aa0000", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(2000, globals)}
          x="0"
          y={computeYCoordFromRating(5000, globals)}
        />
        <rect
          style={{ fill: "#ff3333", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(400, globals)}
          x="0"
          y={computeYCoordFromRating(3000, globals)}
        />
        <rect
          style={{ fill: "#ff7777", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(200, globals)}
          x="0"
          y={computeYCoordFromRating(2600, globals)}
        />
        <rect
          style={{ fill: "#ffbb55", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(100, globals)}
          x="0"
          y={computeYCoordFromRating(2400, globals)}
        />
        <rect
          style={{ fill: "#ffcc88", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(200, globals)}
          x="0"
          y={computeYCoordFromRating(2300, globals)}
        />
        <rect
          style={{ fill: "#ff88ff", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(200, globals)}
          x="0"
          y={computeYCoordFromRating(2100, globals)}
        />
        <rect
          style={{ fill: "#aaaaff", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(300, globals)}
          x="0"
          y={computeYCoordFromRating(1900, globals)}
        />
        <rect
          style={{ fill: "#77ddbb", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(200, globals)}
          x="0"
          y={computeYCoordFromRating(1600, globals)}
        />
        <rect
          style={{ fill: "#77ff77", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(200, globals)}
          x="0"
          y={computeYCoordFromRating(1400, globals)}
        />
        <rect
          style={{ fill: "#cccccc", fillOpacity: 1 }}
          width={viewBoxWidth}
          height={computeHeightFromRatingDiff(2200, globals)}
          x="0"
          y={computeYCoordFromRating(1200, globals)}
        />
      </g>
      <g id="rating-graph-segments">
        <path
          style={{
            fill: "none",
            stroke: "#edc700",
            strokeOpacity: 1,
            strokeWidth: pathStrokeWidth,
            strokeDasharray: "none",
          }}
          d={`${ratings
            .map((rating, index) => {
              if (index === 0)
                return `M ${computeXCoordFromContestId(
                  contestIds[index],
                  contestArchive,
                  viewBoxWidth
                )} ${computeYCoordFromRating(rating, globals)} `;
              const contestId = contestIds[index];

              return `
                  L ${computeXCoordFromContestId(
                    contestId,
                    contestArchive,
                    viewBoxWidth
                  )} ${computeYCoordFromRating(rating, globals)}
                `;
            })
            .join(" ")}`}
        />
      </g>
      <g id="rating-graph-rating-points">
        {ratings.map((rating, index) => {
          const contestId = contestIds[index];

          return (
            <circle
              style={{
                fill: `url('#radial-rating-point-gradient-${index}')`,
                fillOpacity: 1,
                strokeWidth: ratingPointStrokeWidth,
              }}
              cx={String(
                computeXCoordFromContestId(
                  contestId,
                  contestArchive,
                  viewBoxWidth
                )
              )}
              cy={String(computeYCoordFromRating(rating, globals))}
              r={ratingPointRadius}
              onMouseOver={(_e) => {
                setHiddenHoverContestData(
                  ratingHistory.map(
                    (_, hoverElementIndex) => hoverElementIndex !== index
                  )
                );
              }}
              onMouseOut={(_e) => {
                setHiddenHoverContestData((prev) =>
                  prev.map((hoverElementHidden, hoverElementIndex) =>
                    hoverElementIndex === index ? true : hoverElementHidden
                  )
                );
              }}
              key={index}
            />
          );
        })}
      </g>
    </svg>
  );
};
