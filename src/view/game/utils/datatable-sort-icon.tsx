import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Dispatch, SetStateAction } from "react";

function computeFontAwesomeIconName<T extends string>(
  field: T,
  dataTableSortBy: T,
  reverseDataTable: boolean
) {
  if (field !== dataTableSortBy) return "sort";
  if (reverseDataTable) return "sort-down";
  return "sort-up";
}

const handleSortClick = <T extends string>(
  field: T,
  dataTableSortBy: T,
  setDataTableSortBy: Dispatch<SetStateAction<T>>,
  setReverseDataTable: Dispatch<SetStateAction<boolean>>
) => {
  if (field !== dataTableSortBy) {
    setDataTableSortBy(field);
    setReverseDataTable(false);
  } else {
    setReverseDataTable((prev) => !prev);
  }
};

export function DataTableSortIcon<T extends string>(props: {
  field: T;
  dataTableSortBy: T;
  setDataTableSortBy: Dispatch<SetStateAction<T>>;
  reverseDataTable: boolean;
  setReverseDataTable: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    field,
    dataTableSortBy,
    setDataTableSortBy,
    reverseDataTable,
    setReverseDataTable,
  } = props;

  return (
    <FontAwesomeIcon
      className="datatable-sort-icon"
      icon={[
        "fas",
        computeFontAwesomeIconName(field, dataTableSortBy, reverseDataTable),
      ]}
      tabIndex={0}
      style={{cursor: "pointer", padding: "0 0.2rem"}}
      onClick={(_e) => {
        handleSortClick(
          field,
          dataTableSortBy,
          setDataTableSortBy,
          setReverseDataTable
        );
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSortClick(
            field,
            dataTableSortBy,
            setDataTableSortBy,
            setReverseDataTable
          );
        }
      }}
    />
  );
}
