export const DataTable = (props: {
  topText?: string;
  containerBorderRadiusPx?: number;
  contents: Array<Array<JSX.Element>>;
  classNames?: Array<Array<string>>;
  tableId?: string
  containerId?: string
}) => {
  const contents = props.contents;
  const classNames = props.classNames;
  const topText = props.topText;
  const containerBorderRadiusPx = props.containerBorderRadiusPx ?? 0;
  const tableId = props.tableId;
  const containerId = props.containerId;

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
        style={{
          margin: containerBorderRadiusPx / 2,
        }}
      >
        <thead>
          <tr>
            {contents[0].map((cellContent, columnIndex) => (
              <th
                key={columnIndex}
                className={`top ${classNames ? classNames[0][columnIndex] : ""} ${
                  columnIndex === 0 ? "left" : ""
                } ${columnIndex === contents[0].length - 1 ? "right" : ""}`}
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
                  className={`${classNames ? classNames[rowIndex + 1][columnIndex] : ""} ${
                    columnIndex === 0 ? "left" : ""
                  } ${columnIndex === rowContents.length - 1 ? "right" : ""}
                  ${rowIndex === contents.length - 1 ? "down" : ""}
                  ${rowIndex % 2 === 0 ? "dark" : ""}`}
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
