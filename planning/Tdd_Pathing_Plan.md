# TDD Pathing Plan

This document captures the recommended issue order for test-driven development work across the Weather App project.

## Issue Order List

1. Issue `#5` - PRD 01 Slice 1: Local one-city Bronze and Silver ETL
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/5>
2. Issue `#6` - PRD 01 Slice 2: Multi-city local orchestration for all supported cities
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/6>
3. Issue `#8` - PRD 02 Slice 1: Deterministic Gold scoring and all-city Gold generation
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/8>
4. Issue `#9` - PRD 03 Slice 1: Express dashboard shell with city selector, 30-day forecast table, and invalid-city handling
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/9>
5. Issue `#11` - PRD 03 Slice 3: Playwright frontend coverage for dashboard rendering and city selection
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/11>
6. Issue `#12` - PRD 04 Slice 1: Deterministic answer engine and question catalog for the three supported questions
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/12>
7. Issue `#13` - PRD 04 Slice 2: Answer route, fallback formatter, and OpenAI formatting adapter
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/13>
8. Issue `#14` - PRD 04 Slice 3: Headed Playwright end-to-end question-answer flow and final integration evidence
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/14>
9. Issue `#7` - PRD 01 Slice 3: GCP storage adapter and scheduled/manual GitHub Actions ETL
   GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/7>
10. Issue `#10` - PRD 03 Slice 2: Local/GCP Gold repository switching
    GitHub: <https://github.com/AtharshanKen/AIDI2001_ASG5_AtharshanKennedy_WeatherApp/issues/10>

## Development Sections

- Issues `#5 -> #6 -> #8` build the full local data pipeline first, which keeps the earliest TDD cycles fast, deterministic, and easy to debug.
- Issues `#9 -> #11` create a visible frontend early and validate real browser behavior with Playwright before question-answer logic is added.
- Issues `#12 -> #13 -> #14` introduce deterministic application logic first, then integration wiring, then the final end-to-end proof.
- Issues `#7 -> #10` are intentionally later because cloud storage, secrets, and GitHub Actions are less convenient for pure TDD than local-first behavior.

## First Tracer Bullet Per Issue

- Issue `#5`: One ETL command for one supported city writes local Bronze and Silver artifacts successfully.
- Issue `#6`: One all-city ETL run creates outputs for all five supported cities.
- Issue `#8`: One representative Silver record transforms into one correct Gold record with the expected average temperature and outing label.
- Issue `#9`: The main dashboard route renders a page with one selected city and a visible 30-day forecast table.
- Issue `#11`: A headed Playwright test opens the dashboard and confirms the forecast table is visible for a supported city.
- Issue `#12`: One supported question returns one deterministic structured answer payload from Gold data.
- Issue `#13`: The answer endpoint returns a readable fallback response when the formatter is disabled or unavailable.
- Issue `#14`: A headed Playwright test selects a city, clicks a supported question, and verifies that a grounded answer appears.
- Issue `#7`: The storage layer can switch from local writes to mocked GCP bucket writes through the same interface.
- Issue `#10`: The app can read Gold data through one repository interface in both local mode and GCP-backed mode.
