# PRD 02 - Curated Gold Output and Outing Scoring

Suggested GitHub issue title: `PRD 02: Curated Gold Output and Outing Scoring`

## Problem Statement

The raw and cleaned forecast layers are not enough for the app to answer user questions in a deterministic and user-friendly way. The project needs a small, app-facing Gold layer that precomputes the exact weather summary fields and outing-quality decisions the dashboard depends on. Without that curated layer, the app would need to duplicate transformation logic and would be harder to test and explain.

## Solution

Build a deterministic Gold-generation step on top of Silver that computes average temperature, maps weather codes to human-readable conditions, assigns outing scores and labels, and produces short outing reasons suitable for direct app consumption. Gold should remain intentionally minimal so that the medallion model stays meaningful: Bronze is raw, Silver is cleaned detail, and Gold is the curated source of truth the app reads.

## User Stories

1. As a user, I want the app to show simple weather conditions instead of raw weather codes, so that the table is understandable.
2. As a user, I want each day to have a clear outing label, so that I can quickly judge whether it looks like a good day to go out.
3. As a user, I want a short reason for each outing label, so that I understand why a day was marked good or bad.
4. As a project maintainer, I want Gold to contain only the fields the app actually needs, so that the medallion layers remain distinct.
5. As a project maintainer, I want average temperature to be calculated consistently to one decimal place, so that the 7-day average question stays deterministic.
6. As a project maintainer, I want outing thresholds to be numeric and explicit, so that labels are defensible and easy to test.
7. As a project maintainer, I want the scoring engine to prioritize precipitation, wind, and average temperature rather than vague interpretation of weather codes, so that the logic stays stable.
8. As a project maintainer, I want the weather-code mapping to influence display and explanation rather than the core outing thresholds, so that the labeling rules remain simple.
9. As a project maintainer, I want Gold generation to produce the same result every time for the same Silver input, so that tests and demos are reliable.
10. As a project maintainer, I want the Gold schema to stay small and stable, so that the app can depend on it without frequent redesign.
11. As a project maintainer, I want outing scores to provide a simple numeric ranking signal in addition to labels, so that the app can sort or summarize good days if needed.
12. As a project maintainer, I want the Gold layer to be generated for every supported city in the same format, so that the app can read any city through one interface.

## Implementation Decisions

- Build a weather-condition mapping module that converts forecast weather codes into a small set of human-readable condition strings suitable for display.
- Build an outing scoring module as a deep module that accepts one normalized daily record and returns `avg_temp`, `outing_score`, `outing_label`, and `outing_reason`.
- Build a Gold assembler module that takes Silver daily records and emits the final Gold artifact shape expected by the app.
- Gold daily records should include only `date`, `avg_temp`, `weather_condition`, `outing_score`, `outing_label`, and `outing_reason`.
- `avg_temp` should be computed as `(temp_min + temp_max) / 2` and rounded to one decimal place.
- The label thresholds are locked as follows:
- `Great Day` requires precipitation less than or equal to 1 mm, wind speed less than or equal to 20 km/h, and average temperature between 15 C and 25 C.
- `Okay Day` requires precipitation less than or equal to 5 mm, wind speed less than or equal to 35 km/h, and average temperature between 10 C and 30 C when the day is not already `Great Day`.
- `Not Good` is any day outside the `Okay Day` thresholds.
- Keep `outing_label` as the primary business classification and keep `outing_score` as supporting metadata that remains consistent with the label thresholds.
- `outing_reason` should summarize the strongest visible factors affecting the day, using weather condition, precipitation, wind, and temperature in short user-friendly language.
- Gold generation should be deterministic and should not depend on OpenAI or any application-layer formatting.
- The Gold contract should be stable enough that the Express app can treat it as its curated source of truth.

## Testing Decisions

- Good tests should validate the public behavior of the scoring and Gold-generation modules by supplying normalized Silver records and asserting on resulting Gold output.
- Test average-temperature calculation, including rounding behavior.
- Test the weather-condition mapping against representative weather codes used by the forecast source.
- Test each outing-label branch with boundary-value cases around precipitation, wind, and temperature thresholds.
- Test `outing_reason` generation to ensure the text stays grounded in the underlying weather factors and remains short and readable.
- Test Gold assembly to ensure record shape and field ordering remain stable for the app-facing contract.
- Add integration coverage that transforms representative Silver input into Gold output for one city and verifies the final curated artifact is consistent.
- There is currently no existing test prior art in the codebase, so this PRD should establish a pattern of behavior-first tests around deterministic transformation modules.

## Out of Scope

- Fetching raw data from the external API
- Bucket upload workflow beyond receiving Gold output from ETL
- Express route handling
- UI rendering
- Question-button interactions
- OpenAI integration
- Playwright e2e execution

## Further Notes

- This PRD is the bridge between the data pipeline and the app.
- The smaller Gold remains, the easier the architecture is to explain.
- If a future implementation detail needs richer forecast data, that data should stay in Silver unless the dashboard truly requires it in Gold.
