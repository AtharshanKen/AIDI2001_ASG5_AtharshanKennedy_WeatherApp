# AIDI2001 Assignment 5 Plan

## Part 1

### Project Title

Weather Dashboard for Outdoor Activity Days

### Project Intent

- This is a small proof-of-concept application meant to demonstrate the full workflow to the professor.
- The project should stay focused and avoid unnecessary platform complexity.
- The codebase should include meaningful test files for both Python and JavaScript.
- Four PRDs will be used and are outlined later in this plan.
- The PRDs should use meaningful vertical slices and include Playwright-based UI testing in non-headless mode.
- Development will be done on the main branch using GitHub.
- The team should prove one narrow end-to-end flow instead of partially building many disconnected features.

### What the Project Does

- Users can select a city from a predefined drop-down list.
- Users can choose from three predefined weather questions for that city.
- The app shows the next 30 days of curated forecast data for the selected city in a table.
- The app identifies which days are good for going out and which are not.
- The app provides a short reason explaining why each day is labeled as good or bad.

### Supported User Questions

1. What does the weather in `[City]` look like for the next 30 days?
2. What is the average `[Temp]` in `[City]` for the next 7 days?
3. Which upcoming days in `[City]` are great for going out, and why?

### Supported Cities

- Toronto
- Ottawa
- Vancouver
- Montreal
- Calgary

### Out of Scope

- Turning the app into a trip planner, route planner, or travel suggestion tool
- Sending weather-day notifications to users
- Adding user login functionality
- Using the device's current location
- Building heavy user personalization features
- Creating a robust or professional chatbot for weather activity planning
- Allowing free-text prompts outside the three supported questions

### Proposed Solution Architecture

#### 1. Raw Data / Source Ingestion

- Source: Open-Meteo Seasonal Forecast API using the ECMWF EC46 Ensemble Mean
- API reference: https://open-meteo.com/en/docs/seasonal-forecast-api
- Data format: JSON
- Raw response data is stored in the Bronze layer
- Core raw fields include date, max temperature, min temperature, precipitation, wind speed, and weather code

#### 2. ETL / Transformation

- A GitHub Action runs one Python ETL script with helper functions.
- Data flows through `Bronze -> Silver -> Gold`.
- Bronze stores the raw API response for each city.
- Silver stores cleaned daily forecast records with fields such as:
  - `date`
  - `temp_min`
  - `temp_max`
  - `precipitation_sum`
  - `wind_speed_max`
  - `weather_code`
- Gold stores only the curated app-ready fields:
  - `date`
  - `avg_temp`
  - `weather_condition`
  - `outing_score`
  - `outing_label`
  - `outing_reason`
- `avg_temp` is calculated as `(temp_min + temp_max) / 2` and rounded to 1 decimal place.
- `weather_code` is mapped to a human-readable `weather_condition`.
- `outing_label`, `outing_score`, and `outing_reason` are assigned during ETL.
- The ETL should run on a daily schedule while still allowing manual triggering.

#### 3. Outing Logic

- The outing logic is deterministic and threshold-based.
- `Great Day` thresholds:
  - precipitation `<= 1 mm`
  - wind speed `<= 20 km/h`
  - average temperature between `15 C` and `25 C`
- `Okay Day` thresholds:
  - precipitation `<= 5 mm`
  - wind speed `<= 35 km/h`
  - average temperature between `10 C` and `30 C`
  - and not already classified as `Great Day`
- `Not Good` means the day falls outside the `Okay Day` thresholds.
- `weather_code` supports display and explanation, but it is not the primary scoring driver.
- `outing_reason` should reflect weather condition, precipitation, wind, and temperature in a short user-friendly explanation.

#### 4. Storage

- Use a simple medallion-style folder structure inside one GCP bucket.
- Suggested object layout:
  - `Bronze/{city}_{request_date}.json`
  - `Silver/{city}_forecast.json`
  - `Gold/{city}_activity_forecast.json`
- The Gold layer is the curated source of truth that the app reads from.
- A SQL database is not needed.
- A vector store is not needed.
- The goal is to demonstrate workflow, not to build infrastructure for scale.

#### 5. App and Deterministic Answering

- The application will be built as an Express app on Node.js and deployed on Vercel.
- The UI should remain simple and use server-rendered pages plus static assets.
- In production, the app reads Gold files from the GCP bucket.
- In local development and Playwright testing, the app reads local sample Gold files through the same app interface.
- The Express app assembles deterministic answers for the three supported questions:
  - `Q1` reads and displays the 30-day Gold forecast table
  - `Q2` calculates the next 7-day average from Gold `avg_temp`
  - `Q3` filters upcoming `Great Day` entries and explains why using Gold reasons

#### 6. LLM / Formatting Layer

- Use the OpenAI Responses API.
- OpenAI is used only as a formatting layer for short user-friendly answers.
- OpenAI does not decide facts or generate unsupported weather claims.
- The answer payload must already be deterministic and grounded in Gold data before it is sent for formatting.
- If the OpenAI call fails, the app falls back to a simple template response.

#### 7. UI / User-Facing Application

- `A`: City drop-down menu
- `B`: Main table showing the next 30-day forecast for the selected city
- `C`: Question section containing three predefined question buttons
- Layout expectations:
  - `B` sits on the left side of the UI
  - `A` and `C` sit on the right side
  - `A` appears above `C`
  - The questions in `C` are stacked vertically
- The city drop-down displays the fixed city names while the application can still use stable internal IDs behind the scenes.

#### 8. Deployment

- The app code is stored in GitHub.
- GitHub Actions updates Bronze, Silver, and Gold files in GCP object storage.
- Vercel hosts the Express app.
- Vercel reads Gold files from GCP in production to render the dashboard.

## Part 2

### Required Workflow Skills

- `grill-me`
- `write-a-prd`
- `prd-to-issues`
- `tdd`
- `improve-codebase-architecture`

### Proposed 4-PRD Breakdown

1. Ingestion and Medallion Storage
2. Curated Gold Output and Outing Scoring
3. Express Dashboard and City Forecast View
4. Deterministic Question Answers, OpenAI Formatting, and Testing

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
- The main headed Playwright scenario should:
  - open the app locally
  - select `Toronto`
  - verify the 30-day table renders
  - click the question about great outdoor days
  - verify that a grounded answer appears

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

### Final Scope Boundary

- One Express app deployed on Vercel
- One Python ETL pipeline
- One GCP bucket with `Bronze`, `Silver`, and `Gold`
- Five fixed supported cities
- Three fixed supported user questions
- One meaningful headed Playwright end-to-end test scenario
- OpenAI used only for formatting deterministic grounded answers
- Template fallback if OpenAI fails
- No authentication
- No geolocation
- No free-text weather question input
- No extra product features beyond the assignment workflow
