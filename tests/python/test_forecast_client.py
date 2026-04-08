import unittest
from unittest.mock import MagicMock, patch

from weather_etl.forecast_client import build_openmeteo_client


class ForecastClientTests(unittest.TestCase):
    def test_build_openmeteo_client_uses_cached_retrying_session(self) -> None:
        cached_session = MagicMock(name="cached_session")
        retrying_session = MagicMock(name="retrying_session")
        client_instance = MagicMock(name="openmeteo_client")

        with patch(
            "weather_etl.forecast_client.requests_cache.CachedSession",
            return_value=cached_session,
        ) as cached_session_factory, patch(
            "weather_etl.forecast_client.retry",
            return_value=retrying_session,
        ) as retry_wrapper, patch(
            "weather_etl.forecast_client.openmeteo_requests.Client",
            return_value=client_instance,
        ) as client_factory:
            client = build_openmeteo_client()

        cached_session_factory.assert_called_once_with(".cache/openmeteo", expire_after=3600)
        retry_wrapper.assert_called_once_with(cached_session, retries=5, backoff_factor=0.2)
        client_factory.assert_called_once_with(session=retrying_session)
        self.assertIs(client, client_instance)

    def test_fetch_forecast_uses_seasonal_endpoint_and_returns_normalized_daily_payload(self) -> None:
        class FakeVariable:
            def __init__(self, values):
                self._values = values

            def ValuesAsNumpy(self):
                return self._values

        class FakeDaily:
            def __init__(self):
                self._variables = [
                    FakeVariable([7.0, 8.0]),
                    FakeVariable([14.0, 15.0]),
                    FakeVariable([0.2, 0.4]),
                    FakeVariable([12.0, 18.0]),
                    FakeVariable([1, 3]),
                ]

            def Time(self):
                return 1775606400

            def TimeEnd(self):
                return 1775779200

            def Interval(self):
                return 86400

            def Variables(self, index):
                return self._variables[index]

        class FakeResponse:
            def Daily(self):
                return FakeDaily()

        fake_client = MagicMock(name="openmeteo_client")
        fake_client.weather_api.return_value = [FakeResponse()]
        city = {
            "id": "toronto",
            "latitude": 43.6532,
            "longitude": -79.3832,
            "timezone": "America/Toronto",
        }

        with patch(
            "weather_etl.forecast_client.build_openmeteo_client",
            return_value=fake_client,
        ) as build_client:
            from weather_etl.forecast_client import fetch_forecast

            forecast = fetch_forecast(city)

        build_client.assert_called_once_with()
        fake_client.weather_api.assert_called_once()
        weather_api_args = fake_client.weather_api.call_args.args
        weather_api_kwargs = fake_client.weather_api.call_args.kwargs

        self.assertEqual(
            weather_api_args[0],
            "https://seasonal-api.open-meteo.com/v1/seasonal",
        )
        self.assertEqual(
            weather_api_kwargs["params"],
            {
                "latitude": 43.6532,
                "longitude": -79.3832,
                "timezone": "America/Toronto",
                "daily": [
                    "temperature_2m_min",
                    "temperature_2m_max",
                    "precipitation_sum",
                    "wind_speed_10m_max",
                    "weather_code",
                ],
            },
        )
        self.assertEqual(
            forecast,
            {
                "daily": {
                    "time": ["2026-04-08", "2026-04-09"],
                    "temperature_2m_min": [7.0, 8.0],
                    "temperature_2m_max": [14.0, 15.0],
                    "precipitation_sum": [0.2, 0.4],
                    "wind_speed_10m_max": [12.0, 18.0],
                    "weather_code": [1, 3],
                }
            },
        )

    def test_fetch_forecast_raises_clear_error_when_daily_data_is_missing(self) -> None:
        class EmptyResponse:
            def Daily(self):
                return None

        fake_client = MagicMock(name="openmeteo_client")
        fake_client.weather_api.return_value = [EmptyResponse()]
        city = {
            "id": "toronto",
            "latitude": 43.6532,
            "longitude": -79.3832,
            "timezone": "America/Toronto",
        }

        with patch(
            "weather_etl.forecast_client.build_openmeteo_client",
            return_value=fake_client,
        ):
            from weather_etl.forecast_client import fetch_forecast

            with self.assertRaisesRegex(
                ValueError,
                "Forecast response for toronto is missing daily data",
            ):
                fetch_forecast(city)

    def test_fetch_forecast_normalizes_numpy_like_values_to_plain_python_numbers(self) -> None:
        class FakeNumpyArray:
            def __init__(self, values):
                self._values = values

            def tolist(self):
                return list(self._values)

        class FakeVariable:
            def __init__(self, values):
                self._values = values

            def ValuesAsNumpy(self):
                return FakeNumpyArray(self._values)

        class FakeDaily:
            def __init__(self):
                self._variables = [
                    FakeVariable([7.25, 8.5]),
                    FakeVariable([14.75, 15.0]),
                    FakeVariable([0.2, 0.4]),
                    FakeVariable([12.0, 18.0]),
                    FakeVariable([1, 3]),
                ]

            def Time(self):
                return 1775606400

            def TimeEnd(self):
                return 1775779200

            def Interval(self):
                return 86400

            def Variables(self, index):
                return self._variables[index]

        class FakeResponse:
            def Daily(self):
                return FakeDaily()

        fake_client = MagicMock(name="openmeteo_client")
        fake_client.weather_api.return_value = [FakeResponse()]
        city = {
            "id": "toronto",
            "latitude": 43.6532,
            "longitude": -79.3832,
            "timezone": "America/Toronto",
        }

        with patch(
            "weather_etl.forecast_client.build_openmeteo_client",
            return_value=fake_client,
        ):
            from weather_etl.forecast_client import fetch_forecast

            forecast = fetch_forecast(city)

        self.assertEqual(forecast["daily"]["temperature_2m_min"], [7.25, 8.5])
        self.assertTrue(
            all(isinstance(value, float) for value in forecast["daily"]["temperature_2m_min"])
        )
        self.assertEqual(forecast["daily"]["weather_code"], [1, 3])
        self.assertTrue(
            all(isinstance(value, int) for value in forecast["daily"]["weather_code"])
        )


if __name__ == "__main__":
    unittest.main()
