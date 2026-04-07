SUPPORTED_CITIES = {
    "toronto": {
        "name": "Toronto",
        "latitude": 43.6532,
        "longitude": -79.3832,
        "timezone": "America/Toronto",
    },
    "ottawa": {
        "name": "Ottawa",
        "latitude": 45.4215,
        "longitude": -75.6972,
        "timezone": "America/Toronto",
    },
    "vancouver": {
        "name": "Vancouver",
        "latitude": 49.2827,
        "longitude": -123.1207,
        "timezone": "America/Vancouver",
    },
    "montreal": {
        "name": "Montreal",
        "latitude": 45.5017,
        "longitude": -73.5673,
        "timezone": "America/Toronto",
    },
    "calgary": {
        "name": "Calgary",
        "latitude": 51.0447,
        "longitude": -114.0719,
        "timezone": "America/Edmonton",
    },
}


def get_city(city_key: str) -> dict:
    normalized_key = city_key.lower()
    if normalized_key not in SUPPORTED_CITIES:
        raise ValueError(f"Unsupported city: {city_key}")

    return {"id": normalized_key, **SUPPORTED_CITIES[normalized_key]}
