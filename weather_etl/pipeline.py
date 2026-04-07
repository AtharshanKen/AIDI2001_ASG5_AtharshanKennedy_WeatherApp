import json
from pathlib import Path

from weather_etl import forecast_client
from weather_etl.city_catalog import SUPPORTED_CITIES, get_city


def run_one_city(city_key: str, output_root: Path, run_date: str) -> None:
    city = get_city(city_key)
    raw_payload = forecast_client.fetch_forecast(city)
    silver_records = build_silver_records(raw_payload)

    bronze_path = output_root / "bronze" / f"{city['id']}_{run_date}.json"
    silver_path = output_root / "silver" / f"{city['id']}_forecast_{run_date}.json"

    write_json(
        bronze_path,
        {
            "metadata": {"city": city["id"], "run_date": run_date},
            "raw_response": raw_payload,
        },
    )
    write_json(
        silver_path,
        {
            "metadata": {"city": city["id"], "run_date": run_date},
            "daily_forecasts": silver_records,
        },
    )


def run_all_cities(output_root: Path, run_date: str) -> None:
    for city_key in SUPPORTED_CITIES:
        try:
            run_one_city(city_key=city_key, output_root=output_root, run_date=run_date)
        except Exception as error:
            raise ValueError(f"Failed to process city {city_key}: {error}") from error


def build_silver_records(raw_payload: dict) -> list[dict]:
    daily = raw_payload.get("daily", {})
    dates = daily.get("time", [])
    temp_mins = daily.get("temperature_2m_min", [])
    temp_maxes = daily.get("temperature_2m_max", [])
    precipitation_sums = daily.get("precipitation_sum", [])
    wind_speeds = daily.get("wind_speed_10m_max", [])
    weather_codes = daily.get("weather_code", [])

    record_count = len(dates)
    if not all(
        len(values) == record_count
        for values in [
            temp_mins,
            temp_maxes,
            precipitation_sums,
            wind_speeds,
            weather_codes,
        ]
    ):
        raise ValueError("Forecast daily arrays must all be the same length")

    records = []
    for index, date in enumerate(dates):
        records.append(
            {
                "date": date,
                "temp_min": temp_mins[index],
                "temp_max": temp_maxes[index],
                "precipitation_sum": precipitation_sums[index],
                "wind_speed_max": wind_speeds[index],
                "weather_code": weather_codes[index],
            }
        )
    return records


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
