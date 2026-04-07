# AIDI2001 Assignment 5 Plan

## Part 1

### Project Title

Weather Dashboard for Outdoor Activity Days

### Project Intent

- This is a simple application meant to demonstrate workflow and development process to the professor.
- The project should stay focused and should not become overly complex.
- The codebase should include meaningful test files for both Python and JavaScript.
- Four PRDs will be used and are outlined later in this plan.
- The PRDs should use meaningful vertical slices and include Playwright-based UI testing in non-headless mode.
- Development will be done on the main branch using GitHub.
- Platform complexity should be avoided.
- The team should not build everything at once. It is better to prove one narrow flow end-to-end than to partially build several disconnected features.

### What the Project Does

- Users can select a city from a predefined drop-down list.
- Users can choose from three predefined questions related to the next 30 days of weather for that city.
- The app shows the next 30 days of weather for the selected city in a table.
- The app identifies which days are good for going out and which are not.
- The app also provides a short reason explaining why each day is labeled as good or bad.

### Supported User Questions

1. What does the weather in `[City]` look like for the next 30 days?
2. What is the average `[Temp]` in `[City]` for the next 7 days?
3. Which upcoming days in `[City]` are great for going out, and why?

### Out of Scope

- Turning the app into a trip planner, route planner, or travel suggestion tool
- Sending weather-day notifications to users
- Adding user login functionality
- Using the device's current location
- Building heavy user personalization features
- Creating a robust or professional chatbot for weather activity planning

### Proposed Solution Architecture

#### 1. Raw Data / Source Ingestion

- Source: Open-Meteo Seasonal Forecast API using the ECMWF EC46 Ensemble Mean
- API reference: https://open-meteo.com/en/docs/seasonal-forecast-api
- Data format: JSON
- Core fields: date, max temperature, min temperature, precipitation, wind speed, and weather code

#### 2. ETL / Transformation

- A GitHub Action runs one Python ETL script with helper functions.
- Data flows through `Bronze -> Silver -> Gold`.
- The Gold layer includes fields such as `Avg_Temp`, `Outting_Label`, `Outting_Score`, and `Outting_Reason`.
- Day labels are:
  - `Great Day`
  - `Okay Day`
  - `Not Good`
- The ETL should run on a schedule each day, while still allowing manual triggering.

#### 3. Storage

- Use a simple medallion-style folder structure inside one GCP bucket.
- Suggested object layout:
  - `Bronze/{city}_{request_date}.json`
  - `Silver/{city}_forecast.json`
  - `Gold/{city}_activity_forecast.json`
- The Gold layer is the curated source of truth that the app reads from.
- A SQL database is not needed.
- A vector store is not needed.
- The goal is to demonstrate workflow, not to build infrastructure for scale.

#### 4. LLM / Reasoning Layer

- Use the OpenAI Responses API.
- The reasoning layer should stay deterministic and grounded in Gold-layer data rather than freely generating unsupported answers.
- It should support the three predefined user questions described earlier.
- Tooling support will be needed.
- Responses should be short, grounded, and user-friendly.

#### 5. UI / User-Facing Application

- `A`: City drop-down menu
- `B`: Main table showing the next 30-day forecast for the selected city
- `C`: Question section containing three predefined question buttons
- Layout expectations:
  - `B` sits on the left side of the UI.
  - `A` and `C` sit on the right side.
  - `A` appears above `C`.
  - The questions in `C` are stacked vertically.

#### 6. Deployment

- The app code is stored in GitHub.
- The app should follow Node.js and Vercel project setup requirements.
- Vercel reads Gold files from the GCP bucket to render or re-render the dashboard.
- GitHub Actions updates the Gold files in GCP object storage.

## Part 2

### Required Workflow Skills

- `grill-me`
- `write-a-prd`
- `prd-to-issues`
- `tdd`
- `improve-codebase-architecture`

### Proposed 4-PRD Breakdown

1. Ingestion and Storage
2. Curated App-Ready Output
3. Frontend Dashboard
4. Reasoning Layer and Testing

## Project Requirements

### Assignment Expectations

- Build a small end-to-end AI-enabled application.
- Cover the full workflow from data ingestion to user interface.
- Treat this as a proof-of-concept assignment, not a production engineering system.
- Avoid scaling concerns because they are not the focus of the assignment.
- Keep the project narrow enough to remain reliable.
- Ensure the work cuts across these layers:
  - Raw data / source ingestion
  - ETL / transformation
  - Storage
  - LLM or reasoning layer
  - UI / user-facing application

### Codex Skills to Use

- `grill-me`: Challenge and sharpen the plan before building.
- `write-a-prd`: Define what is being built and produce multiple parent PRD GitHub issues.
- `prd-to-issues`: Break the PRDs into smaller GitHub issues.
- `tdd`: Implement meaningful behavior with tests.
  - Tests should be tied to real supported features or behaviors.
  - Tests should be understandable and relevant.
- `improve-codebase-architecture`: Review and improve the structure after the first version works.
  - Include a short before/after architecture note, or a linked architecture/refactor issue, plus evidence in commits or code structure that meaningful improvements were made.

### Testing Requirements

- Use Playwright for at least one meaningful UI or end-to-end scenario.
- Playwright should not be used for trivial page-load-only checks.
- Playwright should run in non-headless mode so there is evidence that the MCP workflow was used.

### Required Project Folders

- Node.js application folder
- Python ETL folder
- GitHub Actions workflow folder
- Planning folder
- Testing folder

### Required GitHub Repository Contents

- Project code
- A clear `README`
- GitHub issues created from the multi-PRD workflow
- Commit history that shows the development process
- Test files
- Evidence of architecture improvements
