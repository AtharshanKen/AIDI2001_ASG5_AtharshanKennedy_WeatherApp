import io
import unittest
from contextlib import redirect_stderr
from unittest.mock import MagicMock

from weather_etl.cli import main
from weather_etl.city_catalog import SUPPORTED_CITIES
from weather_etl.pipeline import WeatherEtlRunner


FAKE_FORECAST_RESPONSE = {
    "daily": {
        "time": ["2026-04-08"],
        "temperature_2m_min": [7.0],
        "temperature_2m_max": [14.0],
        "precipitation_sum": [0.2],
        "wind_speed_10m_max": [12.0],
        "weather_code": [1],
    }
}


class RecordingStorage:
    def __init__(self) -> None:
        self.writes = []

    def write_json(self, artifact_key: str, payload: dict) -> None:
        self.writes.append((artifact_key, payload))


class EtlRunnerTests(unittest.TestCase):
    def test_runner_writes_bronze_silver_and_gold_for_one_city(self) -> None:
        storage = RecordingStorage()
        fetch_forecast = MagicMock(return_value=FAKE_FORECAST_RESPONSE)
        runner = WeatherEtlRunner(storage=storage, fetch_forecast=fetch_forecast)

        runner.run_city("toronto", run_date="2026-04-07")

        fetch_forecast.assert_called_once()
        self.assertEqual(fetch_forecast.call_args.args[0]["id"], "toronto")
        self.assertEqual(
            [artifact_key for artifact_key, _ in storage.writes],
            [
                "bronze/toronto_2026-04-07.json",
                "silver/toronto_forecast_2026-04-07.json",
                "gold/toronto_activity_forecast_2026-04-07.json",
            ],
        )
        self.assertEqual(
            storage.writes[0][1],
            {
                "metadata": {"city": "toronto", "run_date": "2026-04-07"},
                "raw_response": FAKE_FORECAST_RESPONSE,
            },
        )
        self.assertEqual(
            storage.writes[1][1],
            {
                "metadata": {"city": "toronto", "run_date": "2026-04-07"},
                "daily_forecasts": [
                    {
                        "date": "2026-04-08",
                        "temp_min": 7.0,
                        "temp_max": 14.0,
                        "precipitation_sum": 0.2,
                        "wind_speed_max": 12.0,
                        "weather_code": 1,
                    }
                ],
            },
        )
        self.assertEqual(
            storage.writes[2][1],
            {
                "metadata": {"city": "toronto", "run_date": "2026-04-07"},
                "daily_forecasts": [
                    {
                        "date": "2026-04-08",
                        "avg_temp": 10.5,
                        "weather_condition": "Mainly Clear",
                        "outing_score": 2,
                        "outing_label": "Okay Day",
                        "outing_reason": "Mainly Clear with manageable wind and precipitation.",
                    }
                ],
            },
        )

    def test_runner_run_all_writes_gold_pipeline_outputs_for_every_supported_city(self) -> None:
        storage = RecordingStorage()
        fetch_forecast = MagicMock(return_value=FAKE_FORECAST_RESPONSE)
        runner = WeatherEtlRunner(storage=storage, fetch_forecast=fetch_forecast)

        runner.run_all(run_date="2026-04-07")

        self.assertEqual(fetch_forecast.call_count, len(SUPPORTED_CITIES))
        written_keys = {artifact_key for artifact_key, _ in storage.writes}
        for city_key in SUPPORTED_CITIES:
            self.assertIn(f"bronze/{city_key}_2026-04-07.json", written_keys)
            self.assertIn(f"silver/{city_key}_forecast_2026-04-07.json", written_keys)
            self.assertIn(f"gold/{city_key}_activity_forecast_2026-04-07.json", written_keys)

    def test_runner_run_all_surfaces_city_specific_failures(self) -> None:
        storage = RecordingStorage()

        def fetch_side_effect(city: dict) -> dict:
            if city["id"] == "vancouver":
                raise RuntimeError("upstream timeout")
            return FAKE_FORECAST_RESPONSE

        runner = WeatherEtlRunner(storage=storage, fetch_forecast=fetch_side_effect)

        with self.assertRaisesRegex(
            ValueError,
            "Failed to process city vancouver: upstream timeout",
        ):
            runner.run_all(run_date="2026-04-07")

    def test_cli_rejects_using_city_and_all_together(self) -> None:
        stderr = io.StringIO()

        with redirect_stderr(stderr):
            exit_code = main(
                [
                    "run",
                    "--city",
                    "toronto",
                    "--all",
                    "--output-root",
                    "ignored",
                    "--run-date",
                    "2026-04-07",
                ]
            )

        self.assertEqual(exit_code, 2)
        self.assertIn("not allowed with argument", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
