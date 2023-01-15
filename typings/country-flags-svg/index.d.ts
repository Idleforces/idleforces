declare module "country-flags-svg" {
  export function findFlagUrlByCountryName(countryName: string): string | null;
  export const countries: Array<{
    name: string;
    demonym: string;
    iso2: string;
    iso3: string;
    altSpellings?: Array<string>;
  }>;
}
