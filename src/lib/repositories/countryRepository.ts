import { countries } from "@/lib/data/countries";

export function getCountries() {
  return countries;
}

export function getCountryByCode(code: string) {
  return countries.find((c) => c.code === code);
}

