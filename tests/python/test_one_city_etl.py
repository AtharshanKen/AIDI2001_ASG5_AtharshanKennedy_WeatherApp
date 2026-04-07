import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from weather_etl.cli import main


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


class OneCityEtlTests(unittest.TestCase):
    def test_run_command_writes_bronze_and_silver_artifacts_for_supported_city(self) -> None:
        temp_root = Path("tests/.tmp")
        temp_root.mkdir(parents=True, exist_ok=True)

        with tempfile.TemporaryDirectory(dir=temp_root) as temp_dir:
            output_root = Path(temp_dir)

            with patch(
                "weather_etl.forecast_client.fetch_forecast",
                return_value=FAKE_FORECAST_RESPONSE,
            ):
                exit_code = main(
                    [
                        "run",
                        "--city",
                        "toronto",
                        "--output-root",
                        str(output_root),
                        "--run-date",
                        "2026-04-07",
                    ]
                )

            bronze_path = output_root / "bronze" / "toronto_2026-04-07.json"
            silver_path = output_root / "silver" / "toronto_forecast_2026-04-07.json"

            self.assertEqual(exit_code, 0)
            self.assertTrue(bronze_path.exists())
            self.assertTrue(silver_path.exists())

    def test_bronze_artifact_preserves_raw_response_and_run_metadata(self) -> None:
        temp_root = Path("tests/.tmp")
        temp_root.mkdir(parents=True, exist_ok=True)

        with tempfile.TemporaryDirectory(dir=temp_root) as temp_dir:
            output_root = Path(temp_dir)

            with patch(
                "weather_etl.forecast_client.fetch_forecast",
                return_value=FAKE_FORECAST_RESPONSE,
            ):
                exit_code = main(
                    [
                        "run",
                        "--city",
                        "toronto",
                        "--output-root",
                        str(output_root),
                        "--run-date",
                        "2026-04-07",
                    ]
                )

            bronze_path = output_root / "bronze" / "toronto_2026-04-07.json"
            bronze_payload = json.loads(bronze_path.read_text(encoding="utf-8"))

            self.assertEqual(exit_code, 0)
            self.assertEqual(
                bronze_payload["metadata"],
                {"city": "toronto", "run_date": "2026-04-07"},
            )
            self.assertEqual(bronze_payload["raw_response"], FAKE_FORECAST_RESPONSE)

    def test_silver_artifact_contains_normalized_daily_forecasts(self) -> None:
        temp_root = Path("tests/.tmp")
        temp_root.mkdir(parents=True, exist_ok=True)

        with tempfile.TemporaryDirectory(dir=temp_root) as temp_dir:
            output_root = Path(temp_dir)

            with patch(
                "weather_etl.forecast_client.fetch_forecast",
                return_value=FAKE_FORECAST_RESPONSE,
            ):
                exit_code = main(
                    [
                        "run",
                        "--city",
                        "toronto",
                        "--output-root",
                        str(output_root),
                        "--run-date",
                        "2026-04-07",
                    ]
                )

            silver_path = output_root / "silver" / "toronto_forecast_2026-04-07.json"
            silver_payload = json.loads(silver_path.read_text(encoding="utf-8"))

            self.assertEqual(exit_code, 0)
            self.assertEqual(
                silver_payload["metadata"],
                {"city": "toronto", "run_date": "2026-04-07"},
            )
            self.assertEqual(
                silver_payload["daily_forecasts"],
                [
                    {
                        "date": "2026-04-08",
                        "temp_min": 7.0,
                        "temp_max": 14.0,
                        "precipitation_sum": 0.2,
                        "wind_speed_max": 12.0,
                        "weather_code": 1,
                    }
                ],
            )


if __name__ == "__main__":
    unittest.main()
