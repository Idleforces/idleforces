import { selectEvents } from "../../../../app/events/events-slice";
import { useAppSelector } from "../../../../app/hooks";
import { convertSecondsToHHMMSS } from "../../../../utils/time-format";
import { transposeArray } from "../../../../utils/utils";
import { DataTable } from "../../utils/datatable";
import "./events.css";

export const Events = (props: { heightInRem: number }) => {
  const height = props.heightInRem;
  const events = useAppSelector(selectEvents);
  if (!events) return <></>;

  const dataTableColumn = transposeArray([events.map((event, index) => (
    <div
      className={`event-container event-container-${event.sentiment}`}
      key={index}
    >
      <span>
        [{event.problemPlacement} -{" "}
        {convertSecondsToHHMMSS(event.ticksSinceBeginning)}]
      </span>
      <span style={{ textAlign: "left", paddingLeft: "1rem" }}>
        {event.message}
      </span>
    </div>
  ))]);

  return (
    <div id="events-container" style={{ maxHeight: `${height}rem` }}>
      <DataTable
        contents={[[<></>]].concat(dataTableColumn)}
        topText="Events"
        containerBorderRadiusPx={8}

      />
    </div>
  );
};
