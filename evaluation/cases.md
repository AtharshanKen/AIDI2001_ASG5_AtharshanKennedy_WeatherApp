# Evaluation Cases

## Representative Cases

These 5 representative cases should be evaluated across:

- baseline: OpenAI disabled
- before improvement: current OpenAI formatting prompt
- after improvement: revised OpenAI formatting prompt

| Case ID | Route | Why This Case Matters | Required Facts For Scoring |
|---|---|---|---|
| R1 | `/?city=toronto&questionId=q1_30_day_outlook` | Default city and full 30-day summary | `totalDays = 30`, `greatDayCount = 20`, `warmestDay.date = 2026-04-11`, `warmestDay.avgTempC = 21.0` |
| R2 | `/?city=ottawa&questionId=q2_7_day_average_temp` | 7-day averaging and date range logic | `daysConsidered = 7`, `averageTempC = 14.2`, `startDate = 2026-04-10`, `endDate = 2026-04-16` |
| R3 | `/?city=montreal&questionId=q3_great_outdoor_days` | Most complex answer type: count + dates + reasons | `totalGreatDays = 10`, answer includes Great Day dates from `2026-04-16` through `2026-05-13`, reasons stay grounded |
| R4 | `/?city=calgary&questionId=q1_30_day_outlook` | Second 30-day outlook with a different weather profile | `totalDays = 30`, `greatDayCount = 10`, `warmestDay.date = 2026-04-19`, `warmestDay.avgTempC = 19.5` |
| R5 | `/?city=vancouver&questionId=q2_7_day_average_temp` | Second average-temperature case in another city | `daysConsidered = 7`, `averageTempC = 15.3`, `startDate = 2026-04-12`, `endDate = 2026-04-18` |

## Completeness Rules

### q1_30_day_outlook

A complete answer should include:

- total number of days
- number of Great Day forecasts
- warmest day date
- warmest day temperature

### q2_7_day_average_temp

A complete answer should include:

- city
- average temperature
- start date
- end date

### q3_great_outdoor_days

A complete answer should include:

- total Great Day count
- Great Day dates
- grounded reasons based on the Gold data

## Failure Cases

These failure cases are only rerun where they are relevant to the changed system path.

| Failure ID | Case | When To Test | Expected Behavior |
|---|---|---|---|
| F1 | OpenAI unavailable or returns empty output | Before Improvement and After Improvement | App still returns a deterministic fallback answer without crashing |
| F2 | Gold payload is missing or has no daily forecast rows | Current App once | App shows a controlled failure state instead of silently returning wrong output |

## Lightweight Baseline

The lightweight baseline is:

- OpenAI disabled
- deterministic fallback only
- same Gold data
- same deterministic answer engine
- no prompt-based rewriting layer

This baseline is used to test whether the OpenAI formatting layer improves readability without changing the facts.

Because the baseline disables OpenAI by design, failure case `F1` does not apply to the baseline version.
