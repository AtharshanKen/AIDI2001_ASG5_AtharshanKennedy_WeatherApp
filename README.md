# AIDI2001 ASG5 Weather Activity Dashboard\

## Vercel URL:
https://aidi-2001-asg-5-atharshan-kennedy-w.vercel.app

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

Workflow file:
- [`.github/workflows/weather-etl.yml`](./.github/workflows/weather-etl.yml)

## OpenAI Integration

The answer engine is deterministic first. OpenAI is used only as an optional formatter on top of grounded answer data.

If OpenAI is unavailable or disabled, the dashboard falls back to deterministic plain-text answers.

### Playwright evidence files

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

## Evaluation for Assignment 6

- Added an [`evaluation`](./evaluation) folder with the evaluation overview, cases, results, process, and improvement notes.
- Added an [`evaluation_process_pics`](./evaluation_process_pics) folder with screenshots from the testing and evaluation workflow.
- Evaluated the app with 5 representative cases, 2 failure cases, and a lightweight baseline.
- Compared baseline, before-improvement, and after-improvement results for the prompt-formatting path.
