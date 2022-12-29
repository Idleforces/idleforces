export const DataTable = (props: {
  topText?: string;
  containerBorderRadiusPx?: number;
  contents: Array<Array<JSX.Element>>;
  extraClassNames: Array<Array<string>>;
}) => {
  const contents = props.contents;
  const extraClassNames = props.extraClassNames;
  const topText = props.topText;
  const containerBorderRadiusPx = props.containerBorderRadiusPx ?? 0;

  return (
    <div
      className="datatable"
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
        style={{
          margin: containerBorderRadiusPx / 2,
        }}
      >
        <thead>
          <tr>
            {contents[0].map((cellContent, columnIndex) => (
              <th
                key={columnIndex}
                className={`top ${extraClassNames[0][columnIndex]} ${
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
                  className={`${extraClassNames[rowIndex][columnIndex]} ${
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
