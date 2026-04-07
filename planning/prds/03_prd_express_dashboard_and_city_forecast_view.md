# PRD 03 - Express Dashboard and City Forecast View

Suggested GitHub issue title: `PRD 03: Express Dashboard and City Forecast View`

## Problem Statement

The project needs a user-facing application that can present the curated weather data in a simple, professor-friendly way. At the moment there is no web application, no city-selection flow, no forecast table, and no dashboard layout that shows how the data pipeline connects to a usable interface. Without this slice, the project cannot demonstrate the UI layer of the required end-to-end workflow.

## Solution

Build a small Express application on Node.js with a server-rendered dashboard page and static assets. The dashboard should let users select one of the five supported cities, load that city's Gold data through a repository interface, and render the next 30 days of curated forecast rows in a table. The page should also include the final layout structure for the question section so the full app shape is visible even before the question-answer behavior is wired.

## User Stories

1. As a user, I want to open one dashboard page, so that the application feels simple and focused.
2. As a user, I want to select from the five predefined cities in a dropdown, so that I do not have to type city names manually.
3. As a user, I want the selected city to control which forecast table I see, so that the dashboard feels interactive.
4. As a user, I want to see 30 days of forecast rows in a readable table, so that I can scan the city outlook quickly.
5. As a user, I want each row to show the curated Gold fields rather than raw forecast codes, so that the dashboard is easy to understand.
6. As a user, I want the page layout to clearly separate city selection, the forecast table, and the question area, so that the dashboard matches the project plan.
7. As a user, I want the page to handle missing or invalid city choices gracefully, so that the dashboard does not fail confusingly.
8. As a project maintainer, I want the app to read Gold through one repository interface, so that local and production data sources can be swapped without rewriting routes.
9. As a project maintainer, I want local development mode to work from sample Gold files, so that browser testing and demos are reliable.
10. As a project maintainer, I want production mode to read Gold from GCP, so that the deployed app reflects the ETL output.
11. As a project maintainer, I want the dashboard rendering logic separated from raw route handlers, so that the UI behavior stays testable.
12. As a project maintainer, I want the question panel UI shell visible even before the final answer logic is wired, so that the page layout is complete early.
13. As a project maintainer, I want the city list shown to users in friendly names while preserving stable internal identifiers, so that app behavior stays deterministic.

## Implementation Decisions

- Build a city catalog module in the Node application that mirrors the fixed supported-city set and their display names.
- Build a Gold repository module as a deep module that exposes a simple read interface while hiding whether the source is local sample files or the GCP bucket.
- Build a forecast view-model module that converts Gold records into the exact presentation structure the dashboard needs.
- Build Express route handlers that validate the selected city, call the Gold repository, and render the dashboard response.
- Build a server-rendered dashboard template that places the forecast table on the left and the city selector above the question area on the right.
- Keep the city dropdown limited to the fixed supported list and reject unsupported city identifiers.
- Keep the table data grounded only in Gold records rather than reintroducing Silver or Bronze fields into the view layer.
- Include the question area layout and the three predefined question labels in the page shell, but keep the actual answer-generation behavior owned by the next PRD.
- Use the same application flow in local and production modes so the only difference is the underlying Gold data source.
- Keep frontend assets simple and assignment-appropriate rather than building a rich SPA or introducing unnecessary framework complexity.
- Favor route and view-model separation so the rendering behavior can be tested without coupling tests to template internals.

## Testing Decisions

- Good tests should validate visible dashboard behavior such as city selection, table rendering, invalid-city handling, and data-source switching rather than internal templating details.
- Test the Gold repository module with both local-source and mocked production-source behavior.
- Test the forecast view-model module to verify it maps Gold records into consistent display rows.
- Test the route behavior for default city selection, explicit city selection, and unsupported city input.
- Test that the rendered page includes the city selector, question panel shell, and forecast table for a valid city.
- Add integration tests around the Express app using sample Gold data to confirm end-to-end server-rendered page behavior.
- There is no current JavaScript testing prior art in the repo, so this PRD should establish the baseline Node-side testing pattern for route and view-model behavior.

## Out of Scope

- The logic that answers the three supported questions
- OpenAI integration
- Template fallback behavior for failed OpenAI calls
- Headed Playwright e2e proof
- Additional dashboard filters, sorting controls, or personalization
- Client-side framework migration

## Further Notes

- This PRD should make the project visibly usable even before the question answers are interactive.
- The application structure should stay intentionally small and framework-light.
- The route and repository seams created here should make PRD 04 easier to implement and easier to test.
