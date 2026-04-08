from pathlib import Path

from weather_etl import forecast_client
from weather_etl.city_catalog import SUPPORTED_CITIES, get_city
from weather_etl.gold_generation import generate_gold_payload
from weather_etl.storage import LocalArtifactStorage


class WeatherEtlRunner:
    def __init__(
        self,
        *,
        storage,
        fetch_forecast=forecast_client.fetch_forecast,
        supported_city_keys=SUPPORTED_CITIES,
    ) -> None:
        self.storage = storage
        self.fetch_forecast = fetch_forecast
        self.supported_city_keys = tuple(supported_city_keys)

    def run_city(self, city_key: str, run_date: str | None = None) -> None:
        if run_date is None:
            raise ValueError("run_date is required")

        city = get_city(city_key)
        raw_payload = self.fetch_forecast(city)
        artifact_payloads = self._build_artifact_payloads(
            city_id=city["id"],
            run_date=run_date,
            raw_payload=raw_payload,
        )

        for artifact_key, payload in artifact_payloads:
            self.storage.write_json(artifact_key, payload)

    def run_all(self, run_date: str | None = None) -> None:
        if run_date is None:
            raise ValueError("run_date is required")

        for city_key in self.supported_city_keys:
            try:
                self.run_city(city_key=city_key, run_date=run_date)
            except Exception as error:
                raise ValueError(f"Failed to process city {city_key}: {error}") from error

    def _build_artifact_payloads(
        self,
        *,
        city_id: str,
        run_date: str,
        raw_payload: dict,
    ) -> list[tuple[str, dict]]:
        silver_payload = build_silver_payload(
            city_id=city_id,
            run_date=run_date,
            raw_payload=raw_payload,
        )
        gold_payload = generate_gold_payload(silver_payload)
        artifact_keys = build_artifact_keys(city_id=city_id, run_date=run_date)

        return [
            (
                artifact_keys["bronze"],
                {
                    "metadata": {"city": city_id, "run_date": run_date},
                    "raw_response": raw_payload,
                },
            ),
            (artifact_keys["silver"], silver_payload),
            (artifact_keys["gold"], gold_payload),
        ]


def run_one_city(
    city_key: str,
    output_root: Path | None = None,
    run_date: str | None = None,
    storage=None,
) -> None:
    runner = create_runner(output_root=output_root, storage=storage)
    runner.run_city(city_key=city_key, run_date=run_date)


def run_all_cities(
    output_root: Path | None = None,
    run_date: str | None = None,
    storage=None,
) -> None:
    runner = create_runner(output_root=output_root, storage=storage)
    runner.run_all(run_date=run_date)


def create_runner(
    output_root: Path | None = None,
    storage=None,
    fetch_forecast=forecast_client.fetch_forecast,
) -> WeatherEtlRunner:
    return WeatherEtlRunner(
        storage=resolve_storage(output_root=output_root, storage=storage),
        fetch_forecast=fetch_forecast,
    )


def build_silver_payload(*, city_id: str, run_date: str, raw_payload: dict) -> dict:
    silver_records = build_silver_records(raw_payload)
    return {
        "metadata": {"city": city_id, "run_date": run_date},
        "daily_forecasts": silver_records,
    }


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
