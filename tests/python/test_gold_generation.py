import unittest

from weather_etl.gold_generation import generate_gold_payload


class GoldGenerationTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
