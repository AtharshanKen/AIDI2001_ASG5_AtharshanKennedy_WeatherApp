# PRD Index

This folder contains the four issue-ready PRD drafts for the Weather Dashboard for Outdoor Activity Days project.

## Proposed Order

1. [PRD 01 - Ingestion and Medallion Storage](./01_prd_ingestion_and_medallion_storage.md)
2. [PRD 02 - Curated Gold Output and Outing Scoring](./02_prd_curated_gold_output_and_outing_scoring.md)
3. [PRD 03 - Express Dashboard and City Forecast View](./03_prd_express_dashboard_and_city_forecast_view.md)
4. [PRD 04 - Deterministic Question Answers, OpenAI Formatting, and Testing](./04_prd_deterministic_question_answers_openai_formatting_and_testing.md)

## Shared Assumptions

- The project remains a small proof-of-concept assignment rather than a production system.
- The supported cities are Toronto, Ottawa, Vancouver, Montreal, and Calgary.
- The app supports only three predefined user questions.
- The deployed app uses Express on Node.js and is hosted on Vercel.
- Production reads Gold data from GCP.
- Local development and browser testing use local sample Gold data through the same application interface.
- OpenAI is used only for formatting already-grounded deterministic answers.
- The main Playwright evidence flow is a headed local scenario that selects Toronto, renders the table, and verifies a great-days answer.

## Suggested Use

- Treat each file as a GitHub issue body draft.
- Create the PRDs in order so dependencies stay clear.
- Use `prd-to-issues` after these parent PRDs are approved.
