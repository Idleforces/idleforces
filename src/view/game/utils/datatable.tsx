export const DataTable = (props: {
  contents: Array<Array<JSX.Element>>;
  extraClassNames: Array<Array<string>>;
}) => {
  const contents = props.contents;
  const extraClassNames = props.extraClassNames;

  return (
    <table className="datatable">
      {contents.map((rowContents, rowIndex) => (
        <tr key={rowIndex}>
          {rowIndex === 0
            ? rowContents.map((cellContent, columnIndex) => (
                <th
                  key={columnIndex}
                  className={`top ${extraClassNames[rowIndex][columnIndex]} ${
                    columnIndex === 0 ? "left" : ""
                  } ${columnIndex === rowContents.length - 1 ? "right" : ""}`}
                >
                  {cellContent}
                </th>
              ))
            : rowContents.map((cellContent, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`top ${extraClassNames[rowIndex][columnIndex]} ${
                    columnIndex === 0 ? "left" : ""
                  } ${columnIndex === rowContents.length - 1 ? "right" : ""}`}
                >
                  {cellContent}
                </td>
              ))}
        </tr>
      ))}
    </table>
  );
};
