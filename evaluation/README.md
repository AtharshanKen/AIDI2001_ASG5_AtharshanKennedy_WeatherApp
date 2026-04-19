#  Vercel Website
- https://aidi-2001-asg-5-atharshan-kennedy-w.vercel.app

# Evaluation Overview

This folder contains the Assignment 6 evaluation artifacts for the Weather Activity Dashboard.

## Goal

The goal of this evaluation is to show that the system design was not arbitrary. I evaluated:

- output quality
- one upstream pipeline component
- one lightweight baseline
- one evidence-based improvement

## Architecture Context

This app uses a hybrid architecture:

- retrieval-backed Gold weather data
- deterministic answer generation
- optional OpenAI formatting for readability

The deterministic answer engine remains the source of truth for answer facts. OpenAI is used only to improve wording.

## Evaluation Scope

### Output Quality

- factual correctness / groundedness
- readability

### End-to-End Task Success

- user selects a city
- user selects a supported question
- app renders an answer without crashing
- facts in the answer match the deterministic Gold-backed answer payload

### Upstream Component

- Silver -> Gold transformation accuracy on representative and threshold-edge cases

### Lightweight Baseline

- OpenAI disabled
- deterministic fallback only

## Stable Evaluation Setup

The scored representative cases use the local sample Gold repository in `dashboard_app/sample_gold_repository.js`. This keeps the evaluation stable across repeated runs.

The deployed Vercel app is used only for one smoke check:

- https://aidi-2001-asg-5-atharshan-kennedy-w.vercel.app

## Metrics

### Fact Preservation

Fact preservation checks whether the final displayed answer keeps the required facts from the deterministic answer payload.

### Readability

Readability is scored from 1 to 5 using a small rubric:

- 1 = hard to follow, awkward, or confusing
- 2 = understandable but stiff or robotic
- 3 = clear enough, but still somewhat unnatural
- 4 = clear and mostly natural
- 5 = very clear, natural, and concise

### Transformation Accuracy

Transformation accuracy measures whether Silver forecast inputs were correctly transformed into Gold outputs.

## Acceptable Consistency

For this app, acceptable consistency means:

- the same facts stay the same across repeated runs
- wording may change slightly when OpenAI formatting is enabled
- dates, temperatures, counts, city names, and grounded reasons must not change

## Improvement Evaluated

The improvement tested in Part 4 is:

- refining the OpenAI formatting prompt so answers sound more natural and less robotic
- keeping the answer grounded in the same deterministic facts
- falling back to the deterministic summary if formatting fails
