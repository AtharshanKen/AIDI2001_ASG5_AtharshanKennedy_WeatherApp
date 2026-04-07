# PRD 04 - Deterministic Question Answers, OpenAI Formatting, and Testing

Suggested GitHub issue title: `PRD 04: Deterministic Question Answers, OpenAI Formatting, and Testing`

## Problem Statement

The dashboard still needs to answer the three supported questions in a way that is grounded, deterministic, and visibly AI-enabled without turning the project into a chatbot. The project also needs credible testing evidence, including a meaningful headed Playwright scenario, so the professor can see that the application behavior was actually verified. Without this slice, the app would show data but would not complete the required reasoning and testing workflow.

## Solution

Build a deterministic answer engine in the Express application that supports exactly three predefined question IDs, computes answers from Gold data, and returns short grounded responses. After the deterministic answer payload is assembled, optionally pass the payload to OpenAI for user-friendly formatting. If OpenAI fails, return a plain template fallback. Pair this behavior with JavaScript tests for answer logic and route behavior plus a headed Playwright end-to-end scenario that proves a real user flow through the app.

## User Stories

1. As a user, I want to click a predefined question instead of typing free-form prompts, so that the app stays simple and focused.
2. As a user, I want the application to answer only the three supported questions, so that responses stay reliable and grounded.
3. As a user, I want the answer to reflect the currently selected city, so that the response matches the table I am viewing.
4. As a user, I want the weather-summary question to produce a concise grounded response, so that I can quickly understand the 30-day outlook.
5. As a user, I want the 7-day average question to compute from the next seven Gold records, so that the answer is numerically meaningful.
6. As a user, I want the great-days question to identify upcoming `Great Day` entries and explain why, so that I can quickly find favorable outdoor days.
7. As a user, I want answers to remain available even if the OpenAI call fails, so that the feature does not feel broken.
8. As a project maintainer, I want the answer logic to live in deterministic code rather than in the model, so that answers stay testable and defendable.
9. As a project maintainer, I want a stable question catalog with explicit question IDs, so that the UI and backend stay aligned.
10. As a project maintainer, I want the OpenAI layer to format but not invent facts, so that the AI-enabled aspect remains controlled.
11. As a project maintainer, I want template fallback behavior that produces readable answers, so that demos are resilient to API failures.
12. As a project maintainer, I want unit and integration tests for the answer engine, so that each supported question can be verified with deterministic fixtures.
13. As a project maintainer, I want a headed Playwright test that demonstrates a real user journey, so that the assignment contains visible evidence of browser-based testing.
14. As a project maintainer, I want the e2e scenario to run locally from one app entry point, so that setup remains simple during development and demonstration.

## Implementation Decisions

- Build a question catalog module that defines the three supported question IDs, display labels, and any question-specific metadata required by the UI and answer engine.
- Build an answer engine module as a deep module that accepts a city and that city's Gold records and returns a deterministic structured answer payload for the selected question.
- Keep the answer engine responsibilities split by question:
- `Q1` should summarize the next 30-day city outlook from Gold rather than inventing new weather facts.
- `Q2` should compute the next 7-day average from Gold `avg_temp` values.
- `Q3` should filter upcoming `Great Day` entries and summarize the reasons already present in Gold.
- Build an answer formatting adapter that takes the deterministic payload and requests a short user-friendly response from OpenAI.
- Build a template formatter that returns a readable fallback response when OpenAI is disabled, unavailable, or fails.
- Keep OpenAI prompts tightly scoped to formatting and grounded payload transformation rather than open-ended generation.
- Build an answer route or controller in the Express app that validates city and question ID, loads Gold data through the repository interface, calls the answer engine, and then calls the formatting layer.
- Return clear application-level errors for unsupported cities and unsupported question IDs.
- The main browser-test scenario should run locally in headed mode and prove the following flow: open the app, select Toronto, render the 30-day table, click the great-days question, and verify a grounded answer appears.
- Favor a stable answer-payload contract so the same deterministic output can be used whether or not OpenAI formatting is enabled.

## Testing Decisions

- Good tests should validate externally visible answer behavior, supported-question handling, fallback behavior, and browser interactions rather than model internals or template implementation details.
- Test the question catalog to confirm only the three approved question IDs are exposed.
- Test the answer engine independently for each supported question using deterministic Gold fixtures.
- Test the 7-day average calculation with exact expected numeric outcomes.
- Test the great-days answer behavior to ensure only `Great Day` rows are selected and grounded reasons are surfaced.
- Test the formatting adapter boundary by mocking OpenAI success and failure cases without depending on live model output.
- Test the fallback formatter to verify readable responses are produced when the model path is unavailable.
- Add integration tests around the Express answer endpoint or controller using sample Gold data and mocked formatter responses.
- Add at least one headed Playwright test that exercises the main supported user flow from city selection through answer display.
- There is no current browser-test prior art in the repo, so this PRD should establish the baseline for meaningful UI evidence and non-trivial e2e coverage.

## Out of Scope

- Free-text prompt entry
- Conversational chat memory
- Tool-calling beyond the three supported question flows
- Personalized activity suggestions
- Notifications, alerts, or recommendation engines
- Additional AI features beyond formatting deterministic answers

## Further Notes

- This PRD is the final slice that turns the dashboard from a data viewer into a small AI-enabled application.
- The deterministic answer engine should be the real source of truth for answer content.
- The OpenAI path should be easy to disable locally so testing can remain fast and reliable.
