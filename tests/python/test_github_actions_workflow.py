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
        self.assertIn("environment: AIDI2001_Asg5_Env", workflow_text)
        self.assertIn("permissions:", workflow_text)
        self.assertIn("id-token: write", workflow_text)
        self.assertIn("google-github-actions/auth@v3", workflow_text)
        self.assertIn("google-github-actions/setup-gcloud@v3", workflow_text)
        self.assertIn("workload_identity_provider", workflow_text)
        self.assertIn("service_account", workflow_text)
        self.assertIn("credentials_json", workflow_text)
        self.assertIn("gcloud storage ls", workflow_text)


if __name__ == "__main__":
    unittest.main()
