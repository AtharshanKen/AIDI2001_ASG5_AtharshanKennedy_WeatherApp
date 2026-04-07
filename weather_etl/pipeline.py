from pathlib import Path

from weather_etl import forecast_client
from weather_etl.city_catalog import SUPPORTED_CITIES, get_city
from weather_etl.gold_generation import generate_gold_payload
from weather_etl.storage import LocalArtifactStorage


def run_one_city(
    city_key: str,
    output_root: Path | None = None,
    run_date: str | None = None,
    storage=None,
) -> None:
    if run_date is None:
        raise ValueError("run_date is required")

    city = get_city(city_key)
    raw_payload = forecast_client.fetch_forecast(city)
    silver_records = build_silver_records(raw_payload)
    silver_payload = {
        "metadata": {"city": city["id"], "run_date": run_date},
        "daily_forecasts": silver_records,
    }
    gold_payload = generate_gold_payload(silver_payload)
    storage = resolve_storage(output_root=output_root, storage=storage)
    artifact_keys = build_artifact_keys(city_id=city["id"], run_date=run_date)

    storage.write_json(
        artifact_keys["bronze"],
        {
            "metadata": {"city": city["id"], "run_date": run_date},
            "raw_response": raw_payload,
        },
    )
    storage.write_json(
        artifact_keys["silver"],
        silver_payload,
    )
    storage.write_json(artifact_keys["gold"], gold_payload)


def run_all_cities(
    output_root: Path | None = None,
    run_date: str | None = None,
    storage=None,
) -> None:
    if run_date is None:
        raise ValueError("run_date is required")

    for city_key in SUPPORTED_CITIES:
        try:
            run_one_city(
                city_key=city_key,
                output_root=output_root,
                run_date=run_date,
                storage=storage,
            )
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


def build_artifact_keys(city_id: str, run_date: str) -> dict[str, str]:
    return {
        "bronze": f"bronze/{city_id}_{run_date}.json",
        "silver": f"silver/{city_id}_forecast_{run_date}.json",
        "gold": f"gold/{city_id}_activity_forecast_{run_date}.json",
    }


def resolve_storage(output_root: Path | None, storage):
    if storage is not None:
        return storage
    if output_root is None:
        raise ValueError("output_root is required when no storage is provided")
    return LocalArtifactStorage(output_root)
