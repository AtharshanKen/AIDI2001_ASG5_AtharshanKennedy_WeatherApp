import unittest

from weather_etl.gold_generation import generate_gold_payload


class GoldGenerationTests(unittest.TestCase):
    def test_generate_gold_payload_marks_exact_threshold_day_as_great_day(self) -> None:
        silver_payload = {
            "metadata": {"city": "toronto", "run_date": "2026-04-07"},
            "daily_forecasts": [
                {
                    "date": "2026-04-10",
                    "temp_min": 10.0,
                    "temp_max": 20.0,
                    "precipitation_sum": 1.0,
                    "wind_speed_max": 20.0,
                    "weather_code": 0,
                }
            ],
        }

        gold_payload = generate_gold_payload(silver_payload)
        gold_record = gold_payload["daily_forecasts"][0]

        self.assertEqual(gold_record["avg_temp"], 15.0)
        self.assertEqual(gold_record["outing_label"], "Great Day")
        self.assertEqual(gold_record["outing_score"], 3)

    def test_generate_gold_payload_marks_just_outside_great_day_as_okay_day(self) -> None:
        silver_payload = {
            "metadata": {"city": "toronto", "run_date": "2026-04-07"},
            "daily_forecasts": [
                {
                    "date": "2026-04-11",
                    "temp_min": 10.0,
                    "temp_max": 20.0,
                    "precipitation_sum": 1.1,
                    "wind_speed_max": 20.0,
                    "weather_code": 2,
                }
            ],
        }

        gold_payload = generate_gold_payload(silver_payload)
        gold_record = gold_payload["daily_forecasts"][0]

        self.assertEqual(gold_record["avg_temp"], 15.0)
        self.assertEqual(gold_record["outing_label"], "Okay Day")
        self.assertEqual(gold_record["outing_score"], 2)
        self.assertEqual(
            gold_record["outing_reason"],
            "Partly Cloudy with manageable wind and precipitation.",
        )

    def test_generate_gold_payload_transforms_one_silver_record_into_app_ready_gold(self) -> None:
        silver_payload = {
            "metadata": {"city": "toronto", "run_date": "2026-04-07"},
            "daily_forecasts": [
                {
                    "date": "2026-04-08",
                    "temp_min": 16.0,
                    "temp_max": 24.0,
                    "precipitation_sum": 0.5,
                    "wind_speed_max": 12.0,
                    "weather_code": 1,
                }
            ],
        }

        gold_payload = generate_gold_payload(silver_payload)

        self.assertEqual(
            gold_payload,
            {
                "metadata": {"city": "toronto", "run_date": "2026-04-07"},
                "daily_forecasts": [
                    {
                        "date": "2026-04-08",
                        "avg_temp": 20.0,
                        "weather_condition": "Mainly Clear",
                        "outing_score": 3,
                        "outing_label": "Great Day",
                        "outing_reason": "Mainly clear with comfortable temperatures, low wind, and little rain.",
                    }
                ],
            },
        )

    def test_generate_gold_payload_builds_grounded_not_good_reason_from_weather_factors(self) -> None:
        silver_payload = {
            "metadata": {"city": "toronto", "run_date": "2026-04-07"},
            "daily_forecasts": [
                {
                    "date": "2026-04-09",
                    "temp_min": 4.0,
                    "temp_max": 10.0,
                    "precipitation_sum": 8.0,
                    "wind_speed_max": 42.0,
                    "weather_code": 63,
                }
            ],
        }

        gold_payload = generate_gold_payload(silver_payload)
        gold_record = gold_payload["daily_forecasts"][0]

        self.assertEqual(gold_record["avg_temp"], 7.0)
        self.assertEqual(gold_record["weather_condition"], "Rain")
        self.assertEqual(gold_record["outing_label"], "Not Good")
        self.assertEqual(gold_record["outing_score"], 1)
        self.assertEqual(
            gold_record["outing_reason"],
            "Rain with 8.0 mm precipitation, 42.0 km/h wind, and a cool 7.0 C average temperature.",
        )

    def test_generate_gold_payload_maps_supported_seasonal_weather_codes(self) -> None:
        silver_payload = {
            "metadata": {"city": "toronto", "run_date": "2026-04-07"},
            "daily_forecasts": [
                {
                    "date": "2026-04-12",
                    "temp_min": -2.0,
                    "temp_max": 4.0,
                    "precipitation_sum": 2.0,
                    "wind_speed_max": 18.0,
                    "weather_code": 85,
                }
            ],
        }

        gold_payload = generate_gold_payload(silver_payload)
        gold_record = gold_payload["daily_forecasts"][0]

        self.assertEqual(gold_record["weather_condition"], "Light Snow Showers")
        self.assertIn("Light Snow Showers", gold_record["outing_reason"])


if __name__ == "__main__":
    unittest.main()
