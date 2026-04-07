class UnsupportedCityError extends Error {
  constructor(cityKey) {
    super(`City "${cityKey}" is not supported.`);
    this.name = "UnsupportedCityError";
  }
}

const CITIES = [
  { key: "toronto", label: "Toronto" },
  { key: "ottawa", label: "Ottawa" },
  { key: "vancouver", label: "Vancouver" },
  { key: "montreal", label: "Montreal" },
  { key: "calgary", label: "Calgary" },
];

function listCities() {
  return CITIES.map((city) => ({ ...city }));
}

function getCity(cityKey) {
  const normalizedKey = String(cityKey).trim().toLowerCase();
  const city = CITIES.find((entry) => entry.key === normalizedKey);

  if (!city) {
    throw new UnsupportedCityError(cityKey);
  }

  return { ...city };
}

module.exports = {
  UnsupportedCityError,
  getCity,
  listCities,
};
