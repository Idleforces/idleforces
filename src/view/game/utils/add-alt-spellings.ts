import type { Countries } from "./types";

export const addAltSpellings = (countries: Countries) => {
  const altSpellingsKeyedByNames = {
    ["Czech Republic"]: ["Czechia"],
  };

  Object.entries(altSpellingsKeyedByNames).forEach(([name, altSpellings]) => {
    const index = countries.findIndex((country) => country.name === name);
    countries[index].altSpellings = altSpellings;
  });
};
