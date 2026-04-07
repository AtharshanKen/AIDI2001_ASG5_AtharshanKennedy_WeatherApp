WEATHER_CONDITIONS = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Rain Showers",
    95: "Thunderstorm",
}


def generate_gold_payload(silver_payload: dict) -> dict:
    return {
        "metadata": dict(silver_payload["metadata"]),
        "daily_forecasts": [
            transform_daily_record(record) for record in silver_payload["daily_forecasts"]
        ],
    }


def transform_daily_record(record: dict) -> dict:
    avg_temp = round((record["temp_min"] + record["temp_max"]) / 2, 1)
    weather_condition = map_weather_condition(record["weather_code"])
    outing_label = classify_outing_day(
        avg_temp=avg_temp,
        precipitation_sum=record["precipitation_sum"],
        wind_speed_max=record["wind_speed_max"],
    )

    return {
        "date": record["date"],
        "avg_temp": avg_temp,
        "weather_condition": weather_condition,
        "outing_score": score_for_label(outing_label),
        "outing_label": outing_label,
        "outing_reason": build_outing_reason(weather_condition, outing_label),
    }


def map_weather_condition(weather_code: int) -> str:
    return WEATHER_CONDITIONS.get(weather_code, "Unknown")


def classify_outing_day(
    *,
    avg_temp: float,
    precipitation_sum: float,
    wind_speed_max: float,
) -> str:
    if precipitation_sum <= 1 and wind_speed_max <= 20 and 15 <= avg_temp <= 25:
        return "Great Day"
    if precipitation_sum <= 5 and wind_speed_max <= 35 and 10 <= avg_temp <= 30:
        return "Okay Day"
    return "Not Good"


def score_for_label(outing_label: str) -> int:
    if outing_label == "Great Day":
        return 3
    if outing_label == "Okay Day":
        return 2
    return 1


def build_outing_reason(weather_condition: str, outing_label: str) -> str:
    if outing_label == "Great Day":
        return (
            f"{weather_condition.lower()} with comfortable temperatures, low wind, "
            "and little rain."
        ).capitalize()
    if outing_label == "Okay Day":
        return f"{weather_condition} with manageable wind and precipitation."
    return f"{weather_condition} with conditions that are not ideal for going out."
