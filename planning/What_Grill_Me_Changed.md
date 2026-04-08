# What Grill Me Changed

## Purpose

This document summarizes how the original plan was sharpened during the `grill-me` session and what decisions were locked before implementation.

## High-Level Shift

The original plan already had the right end-to-end workflow, but several important implementation choices were still vague. The revised plan makes the project smaller, more deterministic, and easier to test and defend.

## Main Changes

### 1. Platform Choice Was Narrowed

- The old plan said the app should follow `Node.js` and `Vercel` requirements.
- The revised plan explicitly chooses an `Express` app on `Node.js`, deployed on `Vercel`.
- This was chosen because it keeps the app simple, recognizable, and easier to test locally with Playwright.

### 2. Gold Tier Was Made Smaller

- The old plan treated Gold as a general curated output but did not clearly define how small or app-ready it should be.
- The revised plan makes Gold minimal and app-facing.
- Gold now contains only:
  - `date`
  - `avg_temp`
  - `weather_condition`
  - `outing_score`
  - `outing_label`
  - `outing_reason`
- This makes the medallion model more meaningful:
  - Bronze = raw API response
  - Silver = cleaned detailed forecast data
  - Gold = app-ready summary data

### 3. Deterministic Logic Was Clarified

- The old plan said the app would stay deterministic but did not define exact thresholds.
- The revised plan locks in concrete outing thresholds for `Great Day`, `Okay Day`, and `Not Good`.
- The revised plan also makes it clear that `weather_code` supports display and explanation, but does not drive the main outing score.

### 4. Responsibility Split Was Cleaned Up

- The old plan implied Gold would support the app, but it was unclear which layer computed which answers.
- The revised plan now separates responsibilities clearly:
  - ETL computes daily curated facts
  - Express app assembles the three supported question answers from Gold
  - OpenAI only formats deterministic answer payloads

### 5. OpenAI Scope Was Reduced

- The old plan used the OpenAI Responses API for the reasoning layer.
- The revised plan narrows that role to formatting only.
- OpenAI does not decide facts.
- If OpenAI fails, the app returns a plain template fallback.
- This makes the project more reliable and easier to test.

### 6. Local Testing Was Made Easier

- The old plan focused on GCP Gold files being read by the deployed app.
- The revised plan adds local sample Gold files for development and Playwright testing.
- This means:
  - production uses GCP Gold
  - local development uses local Gold through the same app path
- This reduces friction for local demos and headed Playwright evidence.

### 7. Supported Cities Were Locked

- The old plan mentioned a predefined city list but did not specify it.
- The revised plan locks the list to:
  - Toronto
  - Ottawa
  - Vancouver
  - Montreal
  - Calgary

### 8. Playwright Evidence Was Made Concrete

- The old plan required meaningful Playwright usage but did not define the actual scenario.
- The revised plan locks a main headed Playwright flow:
  - open the app locally
  - select Toronto
  - verify the 30-day table renders
  - click the great-days question
  - verify that a grounded answer appears

### 9. Final Scope Boundary Was Locked

- The old plan had good intent around avoiding overbuilding, but the final boundary was still soft.
- The revised plan explicitly limits the project to:
  - one Express app on Vercel
  - one Python ETL pipeline
  - one GCP bucket
  - five fixed cities
  - three fixed questions
  - one meaningful headed Playwright e2e scenario
  - no authentication
  - no geolocation
  - no free-text question input
  - no extra product features beyond the assignment workflow

## Practical Result

The revised plan is:

- simpler to implement
- more deterministic
- easier to test locally
- more clearly split across Bronze, Silver, and Gold
- less likely to expand into unnecessary product scope
