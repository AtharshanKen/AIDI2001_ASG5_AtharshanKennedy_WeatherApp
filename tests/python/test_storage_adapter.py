import unittest
from unittest.mock import patch

from weather_etl.cli import main
from weather_etl.storage import GcpBucketArtifactStorage


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
class FakeBlob:
    def __init__(self, name: str) -> None:
        self.name = name
        self.uploaded_text = None
        self.content_type = None

    def upload_from_string(self, data: str, content_type: str) -> None:
        self.uploaded_text = data
        self.content_type = content_type


class FakeBucket:
    def __init__(self) -> None:
        self.blobs = {}

    def blob(self, name: str) -> FakeBlob:
        blob = FakeBlob(name)
        self.blobs[name] = blob
        return blob


class StorageAdapterTests(unittest.TestCase):
    def test_run_command_can_select_gcp_storage_from_environment(self) -> None:
        bucket = FakeBucket()

        with patch.dict(
            "os.environ",
            {
                "WEATHER_STORAGE_MODE": "gcp",
                "WEATHER_BUCKET_NAME": "assignment-weather",
                "WEATHER_BUCKET_PREFIX": "weather-demo",
            },
            clear=False,
        ):
            with patch(
                "weather_etl.forecast_client.fetch_forecast",
                return_value=FAKE_FORECAST_RESPONSE,
            ):
                with patch(
                    "weather_etl.storage.load_google_cloud_bucket",
                    return_value=bucket,
                ):
                    exit_code = main(
                        [
                            "run",
                            "--city",
                            "toronto",
                            "--output-root",
                            "unused-local-path",
                            "--run-date",
                            "2026-04-07",
                        ]
                    )

        self.assertEqual(exit_code, 0)
        self.assertIn("weather-demo/bronze/toronto_2026-04-07.json", bucket.blobs)
        self.assertIn("weather-demo/silver/toronto_forecast_2026-04-07.json", bucket.blobs)
        self.assertIn(
            "weather-demo/gold/toronto_activity_forecast_2026-04-07.json",
            bucket.blobs,
        )

    def test_gcp_bucket_storage_uploads_json_to_prefixed_blob_key(self) -> None:
        bucket = FakeBucket()
        storage = GcpBucketArtifactStorage(bucket=bucket, prefix="weather-data")

        storage.write_json(
            "gold/toronto_activity_forecast_2026-04-07.json",
            {
                "metadata": {"city": "toronto", "run_date": "2026-04-07"},
                "daily_forecasts": [],
            },
        )

        blob = bucket.blobs["weather-data/gold/toronto_activity_forecast_2026-04-07.json"]

        self.assertEqual(
            blob.uploaded_text,
            '{\n  "metadata": {\n    "city": "toronto",\n    "run_date": "2026-04-07"\n  },\n  "daily_forecasts": []\n}',
        )
        self.assertEqual(blob.content_type, "application/json")

if __name__ == "__main__":
    unittest.main()
