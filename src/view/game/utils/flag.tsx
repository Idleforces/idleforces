import { findFlagUrlByCountryName } from "country-flags-svg";

export const Flag = (props: { countryName: string | null }) => {
  const countryName = props.countryName;

  if (countryName === null) return <></>;
  const flagURL = findFlagUrlByCountryName(countryName);
  if (!flagURL) return <></>;

  return <img src={flagURL} alt={countryName} height="16px" width="auto" style={{paddingRight: "5px"}}/>;
};
