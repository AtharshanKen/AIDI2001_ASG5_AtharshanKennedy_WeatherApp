# System Architecture

## High-Level Flow

```text
Open-Meteo Seasonal API
  -> Python ETL
  -> Bronze / Silver / Gold
  -> GCP Bucket
  -> Express Dashboard on Vercel
  -> User
```

## Main Components

- `Open-Meteo API`
  External weather source for seasonal forecast data.

- `Python ETL`
  Fetches forecast data, transforms it, and produces Bronze, Silver, and Gold outputs.

- `GCP Bucket`
  Stores medallion-layer artifacts used by the deployed dashboard.

- `GitHub Actions`
  Runs the ETL manually or on schedule and uploads artifacts to the bucket.

- `Express Dashboard`
  Reads Gold data, renders the 30-day forecast, and answers the fixed weather questions.

- `OpenAI Formatter`
  Optionally rewrites deterministic answer text for readability without changing facts.

## Simple Responsibility Split

- `ETL` owns data ingestion and transformation.
- `Gold` is the app-ready source of truth.
- `Dashboard` owns display and deterministic answer assembly.
- `OpenAI` is formatting only, not fact generation.
