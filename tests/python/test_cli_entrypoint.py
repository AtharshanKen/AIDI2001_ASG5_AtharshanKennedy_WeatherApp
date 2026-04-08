import subprocess
import sys
import unittest
from pathlib import Path


class CliEntrypointTests(unittest.TestCase):
    def test_module_execution_returns_clean_error_for_unsupported_city(self) -> None:
        repo_root = Path(__file__).resolve().parents[2]
        result = subprocess.run(
            [
                sys.executable,
                "-m",
                "weather_etl.cli",
                "run",
                "--city",
                "not-supported",
                "--output-root",
                "data/local",
                "--run-date",
                "2026-04-07",
            ],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=False,
        )

        self.assertEqual(result.returncode, 1)
        self.assertIn("Unsupported city: not-supported", result.stderr)


if __name__ == "__main__":
    unittest.main()
