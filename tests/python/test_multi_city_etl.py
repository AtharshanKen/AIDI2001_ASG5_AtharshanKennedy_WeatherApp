import io
import json
import tempfile
import unittest
from contextlib import redirect_stderr
from pathlib import Path
from unittest.mock import patch

from weather_etl.cli import main
from weather_etl.city_catalog import SUPPORTED_CITIES


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


class MultiCityEtlTests(unittest.TestCase):
    def test_run_command_rejects_using_city_and_all_together(self) -> None:
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

    def test_run_command_with_all_writes_bronze_and_silver_for_every_supported_city(self) -> None:
        temp_root = Path("tests/.tmp")
        temp_root.mkdir(parents=True, exist_ok=True)

        with tempfile.TemporaryDirectory(dir=temp_root) as temp_dir:
            output_root = Path(temp_dir)

            with patch(
                "weather_etl.forecast_client.fetch_forecast",
                return_value=FAKE_FORECAST_RESPONSE,
            ) as fetch_forecast:
                exit_code = main(
                    [
                        "run",
                        "--all",
                        "--output-root",
                        str(output_root),
                        "--run-date",
                        "2026-04-07",
                    ]
                )

            for city_key in SUPPORTED_CITIES:
                bronze_path = output_root / "bronze" / f"{city_key}_2026-04-07.json"
                silver_path = output_root / "silver" / f"{city_key}_forecast_2026-04-07.json"

                self.assertTrue(bronze_path.exists())
                self.assertTrue(silver_path.exists())

            self.assertEqual(exit_code, 0)
            self.assertEqual(fetch_forecast.call_count, len(SUPPORTED_CITIES))

    def test_run_command_with_all_returns_clear_error_when_one_city_fails(self) -> None:
        temp_root = Path("tests/.tmp")
        temp_root.mkdir(parents=True, exist_ok=True)

        def fetch_side_effect(city):
            if city["id"] == "vancouver":
                raise RuntimeError("upstream timeout")
            return FAKE_FORECAST_RESPONSE

        with tempfile.TemporaryDirectory(dir=temp_root) as temp_dir:
            output_root = Path(temp_dir)
            stderr = io.StringIO()

            with patch(
                "weather_etl.forecast_client.fetch_forecast",
                side_effect=fetch_side_effect,
            ):
                with redirect_stderr(stderr):
                    exit_code = main(
                        [
                            "run",
                            "--all",
                            "--output-root",
                            str(output_root),
                            "--run-date",
                            "2026-04-07",
                        ]
                    )

            self.assertEqual(exit_code, 1)
            self.assertIn("Failed to process city vancouver", stderr.getvalue())
            self.assertIn("upstream timeout", stderr.getvalue())

    def test_run_command_with_all_writes_gold_artifacts_for_every_supported_city(self) -> None:
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
                        "--all",
                        "--output-root",
                        str(output_root),
                        "--run-date",
                        "2026-04-07",
                    ]
                )

            for city_key in SUPPORTED_CITIES:
                gold_path = output_root / "gold" / f"{city_key}_activity_forecast_2026-04-07.json"
                self.assertTrue(gold_path.exists())

            toronto_gold_path = (
                output_root / "gold" / "toronto_activity_forecast_2026-04-07.json"
            )
            toronto_gold_payload = json.loads(toronto_gold_path.read_text(encoding="utf-8"))

            self.assertEqual(exit_code, 0)
            self.assertEqual(
                toronto_gold_payload,
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


if __name__ == "__main__":
    unittest.main()
