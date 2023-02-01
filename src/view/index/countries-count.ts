import type { User } from "../../app/users/types";

export const countriesCount = new Map<string, number>();

export const populateCountriesCount = (users: Array<User>) => {
  users.forEach((user) => {
    const countryName = user.country;
    if (countryName !== null) {
      const countryCount = countriesCount.get(countryName);
      if (countryCount === undefined) countriesCount.set(countryName, 1);
      else countriesCount.set(countryName, countryCount + 1);
    }
  });
};
