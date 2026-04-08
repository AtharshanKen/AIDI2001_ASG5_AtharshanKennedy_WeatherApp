from datetime import UTC, datetime

import openmeteo_requests
import requests_cache
from retry_requests import retry


SEASONAL_API_URL = "https://seasonal-api.open-meteo.com/v1/seasonal"
SEASONAL_MODEL = "ecmwf_ec46_ensemble_mean"
FORECAST_DAYS = 30
DAILY_FIELDS = [
    "temperature_2m_min",
    "temperature_2m_max",
    "precipitation_sum",
    "wind_speed_10m_max",
    "weather_code",
]


def build_openmeteo_client() -> openmeteo_requests.Client:
    cached_session = requests_cache.CachedSession(".cache/openmeteo", expire_after=3600)
    retrying_session = retry(cached_session, retries=5, backoff_factor=0.2)
    return openmeteo_requests.Client(session=retrying_session)


def fetch_forecast(city: dict) -> dict:
    client = build_openmeteo_client()
    params = {
        "latitude": city["latitude"],
        "longitude": city["longitude"],
        "timezone": city["timezone"],
        "forecast_days": FORECAST_DAYS,
        "models": SEASONAL_MODEL,
        "daily": DAILY_FIELDS,
    }
    responses = client.weather_api(SEASONAL_API_URL, params=params)
    if not responses:
        raise ValueError(f"Forecast response for {city['id']} is empty")

    return normalize_daily_response(responses[0], city["id"])


def normalize_daily_response(response, city_id: str) -> dict:
    daily = response.Daily()
    if daily is None:
        raise ValueError(f"Forecast response for {city_id} is missing daily data")

    return {
        "daily": {
            "time": build_daily_dates(daily.Time(), daily.TimeEnd(), daily.Interval()),
            "temperature_2m_min": to_python_list(daily.Variables(0).ValuesAsNumpy()),
            "temperature_2m_max": to_python_list(daily.Variables(1).ValuesAsNumpy()),
            "precipitation_sum": to_python_list(daily.Variables(2).ValuesAsNumpy()),
            "wind_speed_10m_max": to_python_list(daily.Variables(3).ValuesAsNumpy()),
            "weather_code": to_python_list(daily.Variables(4).ValuesAsNumpy()),
        }
    }


def build_daily_dates(start_timestamp: int, end_timestamp: int, interval_seconds: int) -> list[str]:
    return [
        datetime.fromtimestamp(timestamp, tz=UTC).date().isoformat()
        for timestamp in range(start_timestamp, end_timestamp, interval_seconds)
    ]


def to_python_list(values) -> list:
    if hasattr(values, "tolist"):
        return values.tolist()
    return list(values)
