# AIDI2001 ASG5 Weather Activity Dashboard

This project builds a weather ETL pipeline and dashboard for five supported Canadian cities:

- Toronto
- Ottawa
- Vancouver
- Montreal
- Calgary

The system fetches seasonal forecast data from Open-Meteo, transforms it into Bronze, Silver, and Gold datasets, uploads ETL artifacts to Google Cloud Storage through GitHub Actions, and serves a dashboard from Express/Vercel that can read the latest Gold data from the bucket.

## Project Flow

```text
Open-Meteo Seasonal API
  -> Bronze raw response
  -> Silver normalized daily forecast
  -> Gold app-ready outing forecast
  -> GitHub Actions ETL workflow
  -> GCP bucket
  -> Express dashboard on Vercel
  -> Optional OpenAI answer formatting
```

## Repository Structure

- [`weather_etl/`](./weather_etl) Python ETL package
- [`dashboard_app/`](./dashboard_app) Express dashboard application
- [`tests/python/`](./tests/python) Python ETL and workflow tests
- [`tests/javascript/`](./tests/javascript) Node/Express behavior tests
- [`tests/playwright/`](./tests/playwright) headed browser and end-to-end evidence tests
- [`data/`](./data) checked-in sample Bronze, Silver, and Gold artifacts
- [`.github/workflows/weather-etl.yml`](./.github/workflows/weather-etl.yml) manual and scheduled ETL workflow

## ETL Layers

### Bronze

Stores the raw Open-Meteo response plus ETL metadata.

Example:
- [`data/bronze/toronto_2026-04-07.json`](./data/bronze/toronto_2026-04-07.json)

### Silver

Stores normalized daily forecast records with stable field names.

Example:
- [`data/silver/toronto_forecast_2026-04-07.json`](./data/silver/toronto_forecast_2026-04-07.json)

### Gold

Stores app-ready forecast rows with:
- `avg_temp`
- `weather_condition`
- `outing_score`
- `outing_label`
- `outing_reason`

Example:
- [`data/gold/toronto_activity_forecast_2026-04-07.json`](./data/gold/toronto_activity_forecast_2026-04-07.json)

## GitHub Actions ETL

The ETL workflow supports:

- manual runs with `workflow_dispatch`
- daily scheduled runs with cron

Workflow file:
- [`.github/workflows/weather-etl.yml`](./.github/workflows/weather-etl.yml)

In `gcp` mode the workflow:

1. runs the ETL locally on the GitHub runner into `data/local`
2. uploads Bronze, Silver, and Gold artifacts to Cloud Storage
3. verifies that uploaded objects exist for the run date

## Dashboard Bucket-Backed Mode

The dashboard supports two repository modes:

- `local`
- `gcp`

When `DASHBOARD_GOLD_REPOSITORY_MODE=gcp`, the dashboard reads Gold artifacts from Google Cloud Storage.

The dashboard can automatically discover the latest dated Gold object for each city, so `DASHBOARD_GOLD_RUN_DATE` is not required anymore.

## OpenAI Integration

The answer engine is deterministic first. OpenAI is used only as an optional formatter on top of grounded answer data.

If OpenAI is unavailable or disabled, the dashboard falls back to deterministic plain-text answers.

## Testing

### JavaScript / Express tests

```powershell
npm test
```

### Python tests

```powershell
python -m unittest discover -s tests/python -p "test_*.py" -v
```

### Playwright tests

Automated Playwright run:

```powershell
npm run test:playwright
```

Headed evidence mode that stays open until you close the browser:

```powershell
npm run test:playwright:evidence -- tests/playwright/dashboard.spec.js
```

Bucket-backed Playwright smoke test:

```powershell
npm run test:playwright:evidence -- tests/playwright/dashboard.bucket.spec.js
```

Question-answer end-to-end flow:

```powershell
npm run test:playwright:evidence -- tests/playwright/question-answer.spec.js
```

### Playwright evidence files

Playwright test files are in:

- [`tests/playwright/dashboard.spec.js`](./tests/playwright/dashboard.spec.js)
- [`tests/playwright/dashboard.bucket.spec.js`](./tests/playwright/dashboard.bucket.spec.js)
- [`tests/playwright/question-answer.spec.js`](./tests/playwright/question-answer.spec.js)

## Architecture Note

### Before

ETL orchestration behavior was spread across separate one-city, multi-city, and storage-path seams, which made the Python test suite more repetitive and made the run flow harder to follow.

### After

The ETL now uses a deeper runner boundary in [`weather_etl/pipeline.py`](./weather_etl/pipeline.py) through `WeatherEtlRunner`, so one-city runs, all-city runs, and artifact writing are coordinated behind a smaller public interface. The Python tests are more centered on behavior at that boundary instead of repeating the same ETL story across multiple shallow files.

## Deployment Notes

- The repo root includes [`app.js`](./app.js) so Vercel can detect the Express entrypoint.
- The dashboard can run from local sample Gold data or live GCP bucket-backed Gold data.
- The GitHub Actions ETL pipeline and the deployed dashboard were verified end to end with real bucket uploads and reads.
