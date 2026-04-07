import unittest
from pathlib import Path


class GitHubActionsWorkflowTests(unittest.TestCase):
    def test_weather_etl_workflow_supports_manual_and_scheduled_runs(self) -> None:
        workflow_path = Path(".github/workflows/weather-etl.yml")
        self.assertTrue(workflow_path.exists())

        workflow_text = workflow_path.read_text(encoding="utf-8")

        self.assertIn("workflow_dispatch:", workflow_text)
        self.assertIn("schedule:", workflow_text)
        self.assertIn("cron:", workflow_text)
        self.assertIn("actions/setup-python", workflow_text)
        self.assertIn("python-version: '3.12'", workflow_text)
        self.assertIn("pip install -r requirements.txt", workflow_text)
        self.assertIn("python -m weather_etl.cli run --all", workflow_text)
        self.assertIn("WEATHER_STORAGE_MODE", workflow_text)


if __name__ == "__main__":
    unittest.main()
