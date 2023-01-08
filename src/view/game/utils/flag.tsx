import { findFlagUrlByCountryName } from "country-flags-svg";

const countryNamesWhitelist: Array<string> = [];
const countryNamesBlacklist: Array<string> = [];

export const Flag = (props: { countryName: string | null }) => {
  const countryName = props.countryName;

  if (countryName === null || countryNamesBlacklist.includes(countryName))
    return <></>;

  const flagURL = findFlagUrlByCountryName(countryName);
  if (flagURL === null || flagURL === "") {
    if (!countryNamesBlacklist.includes(countryName))
      countryNamesBlacklist.push(countryName);
    return <></>;
  }

  if (
    !countryNamesBlacklist.includes(countryName) &&
    !countryNamesWhitelist.includes(countryName)
  ) {
    fetch(flagURL)
      .then((response) => {
        if (response.status === 200) countryNamesWhitelist.push(countryName);
        else countryNamesBlacklist.push(countryName);
      })
      .catch((err: unknown) => {
        console.warn(err);
      });
  }

  return (
    <img
      src={flagURL}
      alt={countryName}
      height="16px"
      width="auto"
      style={{ paddingRight: "5px" }}
    />
  );
};
