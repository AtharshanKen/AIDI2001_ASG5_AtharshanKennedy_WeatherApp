# Evaluation Results

## Representative Case Results

Scoring:

- Fact Preservation: `1.0` means all required facts were preserved
- Readability: 1 to 5

| Case ID | Version | Fact Preservation | Readability | Notes |
|---|---|---:|---:|---:|
| R1 | Baseline | 0.6 | 3.8 | Reports warmest day but there are miltiple best days |
| R1 | Before Improvement | 0.6 | 3.8 | Same as R1 Baseline |
| R1 | After Improvement | 0.8 | 4.5 | Sentence looks more natural while staying grounded |
| R2 | Baseline | 1.0 | 5.0 | Calculates the 7 day avg temp properly |
| R2 | Before Improvement | 1.0 | 5.0 | Sentence could be re-ordered better |
| R2 | After Improvement | 1.0 | 5.0 | Sentence did realy change much, prompt chnage didn't change it|
| R3 | Baseline | 0.6 | 2.8 | Too many dates can make readability worse, no temp's |
| R3 | Before Improvement | 0.8 | 1.8 | Answer looks a bit too dense, does have tmep's  |
| R3 | After Improvement | 1.0 | 2.2 | Slightly better but still too word heavy |
| R4 | Baseline | 0.6 | 3.8 | Same as R1 Baseline |
| R4 | Before Improvement | 0.6 | 3.8 | Same as R1 Before |
| R4 | After Improvement | 0.8 | 4.2 | Some what same as R1 After but sound s slightly worse |
| R5 | Baseline | 1.0 | 4.6 | Same as R2 Baseline |
| R5 | Before Improvement | 1.0 | 5.0 | Better structure then Baseline R5 |
| R5 | After Improvement | 1.0 | 5.0 | Output the similar structure as R5 Before but with less words and same information |

## Failure Case Results

Failure cases are only rerun where they are relevant to the changed system path.

| Failure ID | Version Tested | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| F1 | Baseline | N/A | N/A | N/A | OpenAI is disabled by design in the baseline, so this failure case does not apply |
| F1 | Before Improvement | Return and OpenAI error or a empty string  | All test pass, no errors, no empty string | Pass | Test pass because of OpenAI isn't creating different grounded formatted answers |
| F1 | After Improvement | Error with respect to new prompt breaking fall back bahviour with no open ai enabeled | All test pass, no errors, no fall back behviour issues | Pass | Re-test after the prompt change |
| F2 | Current App | Error based on incomplete or missing data from Gold | All test pass, no errors, Gold data is complete  | Pass | Missing or empty Gold data|

## Upstream Component Results
- python -m unittest discover -s tests/python -p "test_gold_generation.py" -v
    - test_generate_gold_payload_builds_grounded_not_good_reason_from_weather_factors (test_gold_generation.GoldGenerationTests.test_generate_gold_payload_builds_grounded_not_good_reason_from_weather_factors) ... ok
    - test_generate_gold_payload_maps_supported_seasonal_weather_codes (test_gold_generation.GoldGenerationTests.test_generate_gold_payload_maps_supported_seasonal_weather_codes) ... ok
    - test_generate_gold_payload_marks_exact_threshold_day_as_great_day (test_gold_generation.GoldGenerationTests.test_generate_gold_payload_marks_exact_threshold_day_as_great_day) ... ok
    - test_generate_gold_payload_marks_just_outside_great_day_as_okay_day (test_gold_generation.GoldGenerationTests.test_generate_gold_payload__gold_payload_marks_just_outside_great_day_as_okay_day) ... ok
    - test_generate_gold_payload_transforms_one_silver_record_into_app_ready_gold (test_gold_generation.GoldGenerationTests.test_generate_gold_payload_transforms_one_silver_record_into_app_ready_gold) ... ok
- python -m unittest discover -s tests/python -p "test_*.py" -v
    - Ok across all test/python/test_*.py tests
### Silver -> Gold Transformation Accuracy

These results should be supported by the Python tests in `tests/python/test_gold_generation.py`.

| Test Area | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|
| Great Day threshold case | exact threshold stays Great Day | `test_generate_gold_payload_marks_exact_threshold_day_as_great_day` passed | Pass | A Silver record at the exact threshold was correctly classified as `Great Day` |
| Just-outside threshold case | downgraded correctly | `test_generate_gold_payload_marks_just_outside_great_day_as_okay_day` passed | Pass | A Silver record just outside the Great Day threshold was correctly downgraded to `Okay Day` |
| Not Good weather case | grounded reason stays correct | `test_generate_gold_payload_builds_grounded_not_good_reason_from_weather_factors` passed | Pass | The Gold output kept a grounded reason using precipitation, wind, and average temperature values |
| Weather code mapping case | human-readable condition is correct | `test_generate_gold_payload_maps_supported_seasonal_weather_codes` passed | Pass | Seasonal weather codes were converted into the expected human-readable weather condition |
## Summary Metrics

| Metric | Baseline | Before Improvement | After Improvement |
|---|---:|---:|---:|
| Average Fact Preservation | 0.76 | 0.80 | 0.92 |
| Average Readability | 4.0 | 3.88 | 4.18 |

## Deployed Smoke Check

Deployed URL:

- https://aidi-2001-asg-5-atharshan-kennedy-w.vercel.app

Smoke check performed:

- dashboard loaded
- city selection worked
- supported question could be selected
- answer appeared without a crash

Result:

- `TBD`
