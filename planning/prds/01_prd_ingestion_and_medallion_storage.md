# PRD 01 - Ingestion and Medallion Storage

Suggested GitHub issue title: `PRD 01: Ingestion and Medallion Storage`

## Problem Statement

The project needs a repeatable way to fetch weather forecast data for the five supported cities and store that data in a way that clearly demonstrates the end-to-end workflow required by the assignment. Right now there is no ingestion pipeline, no medallion-style storage structure, and no automated path for moving forecast data into the bucket the app will later depend on.

## Solution

Build a Python ETL pipeline that fetches forecast data from the Open-Meteo Seasonal Forecast API for the fixed city list, writes that data into Bronze and Silver artifacts, produces Gold-ready inputs for later curation, and stores the medallion outputs both locally and in a single GCP bucket. The pipeline should be runnable locally for development and demo purposes and also through GitHub Actions on a daily schedule with manual triggering support.

## User Stories

1. As a project maintainer, I want the ETL to fetch data only for the five approved cities, so that the project stays narrow and deterministic.
2. As a project maintainer, I want city metadata such as name, latitude, longitude, and timezone to be centrally defined, so that ingestion runs are consistent across environments.
3. As a project maintainer, I want the raw API response stored without manual editing, so that Bronze clearly represents the original source data.
4. As a project maintainer, I want cleaned daily forecast records extracted from the raw response, so that downstream transformation does not need to repeatedly parse unstable raw payloads.
5. As a project maintainer, I want a consistent medallion object naming convention, so that the storage structure is easy to explain to the professor.
6. As a project maintainer, I want one ETL command to run the full pipeline for all supported cities, so that local execution is simple.
7. As a project maintainer, I want the ETL to support running for a single city when needed, so that debugging is faster.
8. As a project maintainer, I want local medallion outputs available in the repo-friendly development flow, so that local app work and testing do not depend on cloud access.
9. As a project maintainer, I want the same ETL logic to support bucket uploads in automated runs, so that local and scheduled behavior stay aligned.
10. As a project maintainer, I want scheduled GitHub Actions execution with manual triggering support, so that automation is visible in the assignment workflow.
11. As a project maintainer, I want failed ingestion runs to report useful errors instead of silently producing partial data, so that the workflow is easier to debug.
12. As a project maintainer, I want the medallion outputs to include enough metadata to trace the run date and city, so that the workflow is auditable during demos.

## Implementation Decisions

- Build a city catalog module that owns the fixed supported-city list and the forecast API coordinates required for each city.
- Build a forecast client module that encapsulates Open-Meteo request construction, response retrieval, and basic response validation.
- Build a Bronze writer module that stores the raw source payload with deterministic object naming based on city and request date.
- Build a Silver transformer module that converts raw payloads into normalized daily forecast records with stable field names and types.
- Build a storage adapter module that hides whether artifacts are being written to the local development filesystem or the production GCP bucket.
- Build an ETL orchestrator module that executes the pipeline in a clear order and supports both all-city and single-city runs.
- Keep Bronze as the raw API response, not a lightly transformed copy.
- Keep Silver as the cleaned detailed daily forecast layer that still includes weather details needed for later scoring work.
- Use JSON artifacts for all three medallion layers so the project stays easy to inspect and explain.
- Use one bucket with tiered object prefixes rather than introducing a database or secondary storage system.
- Configure GitHub Actions to support both daily scheduled execution and manual execution.
- Keep local development mode and production upload mode behind the same ETL interfaces so business logic does not branch throughout the code.

## Testing Decisions

- Good tests should validate observable pipeline behavior such as fetched-city coverage, transformed output shape, deterministic object naming, and storage results rather than internal helper implementation details.
- Test the city catalog module to verify the supported-city configuration is complete and stable.
- Test the forecast client with mocked API responses so the ETL behavior is deterministic.
- Test the Silver transformer against representative raw responses to ensure normalized output fields are correct and resilient.
- Test the storage adapter with local test directories and mocked bucket interactions to verify tier writes and naming behavior.
- Add an integration-style ETL test that runs a small mocked pipeline for one city and verifies Bronze and Silver artifacts are produced end-to-end.
- There is currently no prior art for tests in this repo, so this PRD establishes the initial Python testing style and behavior-driven fixtures.

## Out of Scope

- Gold outing-score logic
- Weather-condition mapping for user-facing explanations
- Express app rendering
- Question-answer generation
- OpenAI formatting
- Playwright browser testing

## Further Notes

- This PRD should create the plumbing the other three PRDs depend on.
- The output of this PRD should make it easy to inspect Bronze and Silver artifacts locally before cloud automation is introduced.
- The storage contract should be stable enough that Gold generation and app reading can build on it without revisiting the ingestion shape.
