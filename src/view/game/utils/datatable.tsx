type AllowableTableClassNames =
  | "datatable-no-outer-border"
  | "datatable-no-header";
type AllowableTableIds = never;
type AllowableContainerIds = never;

export const DataTable = (props: {
  topText?: string;
  containerBorderRadiusPx?: number;
  contents: Array<Array<JSX.Element>>;
  classNames?: Array<Array<string>>;
  tableClassName?: AllowableTableClassNames;
  tableId?: AllowableTableIds;
  containerId?: AllowableContainerIds;
  colspanValues?: Array<Array<number>>;
}) => {
  const contents = props.contents;
  const classNames = props.classNames;
  const topText = props.topText;
  const containerBorderRadiusPx = props.containerBorderRadiusPx ?? 0;
  const tableId = props.tableId;
  const containerId = props.containerId;
  const tableClassName = props.tableClassName ?? "";
  const colspanValues = props.colspanValues;

  return (
    <div
      className="datatable"
      id={containerId}
      style={{
        paddingRight: (3 / 2) * containerBorderRadiusPx,
        paddingLeft: containerBorderRadiusPx / 2,
        paddingTop: containerBorderRadiusPx / 2,
        paddingBottom: containerBorderRadiusPx / 2,
        borderRadius: containerBorderRadiusPx,
      }}
    >
      {topText !== undefined ? <div className="header">{topText}</div> : <></>}
      <table
        id={tableId}
        className={tableClassName.trim()}
        style={{
          margin: containerBorderRadiusPx / 2,
        }}
      >
        <thead>
          <tr>
            {contents[0].map((cellContent, columnIndex) => (
              <th
                key={columnIndex}
                colSpan={
                  colspanValues ? colspanValues[0][columnIndex] : undefined
                }
                className={`top ${
                  classNames ? classNames[0][columnIndex] : ""
                } ${columnIndex === 0 ? "left" : ""} ${
                  columnIndex === contents[0].length - 1 ? "right" : ""
                }`.trim()}
              >
                {cellContent}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contents.slice(1).map((rowContents, rowIndex) => (
            <tr key={rowIndex}>
              {rowContents.map((cellContent, columnIndex) => (
                <td
                  key={columnIndex}
                  colSpan={
                    colspanValues
                      ? colspanValues[rowIndex + 1][columnIndex]
                      : undefined
                  }
                  className={`${
                    classNames ? classNames[rowIndex + 1][columnIndex] : ""
                  } ${columnIndex === 0 ? "left" : ""} ${
                    columnIndex === rowContents.length - 1 ? "right" : ""
                  }
                  ${rowIndex === contents.length - 1 ? "down" : ""}
                  ${rowIndex % 2 === 0 ? "dark" : ""}`.trim()}
                >
                  {cellContent}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
