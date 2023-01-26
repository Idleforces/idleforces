/* eslint-disable react/jsx-key */
import { useAppSelector } from "../../../app/hooks";
import { attributeNames } from "../../../app/users/types";
import { selectPlayer } from "../../../app/users/users-slice";
import { selectVisibleXPGain } from "../../../app/view/view-slice";
import { transposeArray } from "../../../utils/utils";
import { Bar } from "../utils/bar";
import { DataTable } from "../utils/datatable";
import { InfoBox } from "../utils/info-box";
import { printAttributeName } from "../utils/print-attribute-name";

export const AttributeInfoBox = () => {
  const visibleXPGain = useAppSelector(selectVisibleXPGain);
  const player = useAppSelector(selectPlayer);
  if (!player) return <></>;

  const attributeBarsColumn = attributeNames.map((attributeName) => {
    const attributeValue = player.attributes[attributeName];
    const attributeXPGain = visibleXPGain
      ? visibleXPGain[attributeName]
      : undefined;

    return (
      <Bar
        kind="gradient"
        gradientLeftColor="#0077ed"
        gradientMidColor="#2700ed"
        gradientRightColor="#9e00ed"
        labelPosition="inline"
        leftLabel={String(Math.floor(attributeValue))}
        rightLabel={String(Math.floor(attributeValue) + 1)}
        ratioFilled={attributeValue - Math.floor(attributeValue)}
        centerDiff={attributeXPGain}
      />
    );
  });

  const attributeNamesColumn = attributeNames.map((attributeName) => (
    <>{printAttributeName(attributeName)}</>
  ));
  const topRow = [<>Attribute</>, <>#</>];

  const dataTableContents: Array<Array<JSX.Element>> = [topRow].concat(
    transposeArray([attributeNamesColumn].concat([attributeBarsColumn]))
  );

  const classNames = Array(attributeNames.length + 1)
    .fill(0)
    .map((_) => ["narrow", "wide"]);

  const dataTable = (
    <DataTable
      contents={dataTableContents}
      tableClassName="datatable-no-outer-border"
      classNames={classNames}
    />
  );

  return (
    <InfoBox
      content={<>{dataTable}</>}
      topText="Attributes"
      contentPadding="0"
    />
  );
};
