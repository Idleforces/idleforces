import { findFlagUrlByCountryName, countries } from "country-flags-svg";
import { addAltSpellings } from "./add-alt-spellings";

const countryNamesWhitelist: Array<string> = [];
const countryNamesBlacklist: Array<string> = [];
addAltSpellings(countries);
const countriesWithAltSpellings = countries.filter(
  (country) => country.altSpellings?.length
);

export const Flag = (props: { countryName: string | null }) => {
  let countryName = props.countryName;

  countriesWithAltSpellings.forEach((country) => {
    if (country.altSpellings)
      country.altSpellings.forEach((altSpelling) => {
        if (altSpelling === countryName) countryName = country.name;
      });
  });

  if (countryName === null || countryNamesBlacklist.includes(countryName))
    return <></>;

  const countryNameString = countryName;

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
        if (response.status === 200)
          countryNamesWhitelist.push(countryNameString);
        else countryNamesBlacklist.push(countryNameString);
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
