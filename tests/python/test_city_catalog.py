import unittest

from weather_etl.city_catalog import get_city


class CityCatalogTests(unittest.TestCase):
    def test_get_city_returns_stable_metadata_for_supported_city(self) -> None:
        self.assertEqual(
            get_city("Toronto"),
            {
                "id": "toronto",
                "name": "Toronto",
                "latitude": 43.6532,
                "longitude": -79.3832,
                "timezone": "America/Toronto",
            },
        )

    def test_get_city_raises_for_unsupported_city(self) -> None:
        with self.assertRaisesRegex(ValueError, "Unsupported city: edmonton"):
            get_city("edmonton")


if __name__ == "__main__":
    unittest.main()
