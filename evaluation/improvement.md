# Improvement Based on Evidence

## Weakness Found

The system was already strong in factual correctness because the deterministic answer engine generated grounded facts from Gold data. However, the OpenAI-formatted answers could still sound stiff or overly structured.

## Evidence

- fact preservation was already strong before the improvement
- completeness was already strong before the improvement
- readability scores were lower than desired for some representative cases
- the wording sometimes sounded closer to a system summary than a natural user-facing answer

## Changes Made

- sound more natural and concise
- answer the question more directly
- stay grounded in the provided deterministic facts
- avoid changing dates, temperatures, counts, city names, or grounded reasons

## Kept the same:

- Gold data
- deterministic answer engine
- question set
- evaluation cases
- evaluation metrics

Allowed for fair comparison because the main changed variable was the formatting prompt.

## What Improved

- readability scores slightly improved
- the answer tone became more natural and slightly easier to read
- fact preservation stayed unchanged
- completeness stayed unchanged

## What Still Remains Weak

- OpenAI formatting may vary slightly across runs
- Dates being placed in the text can some what cause readability to worsen

## Conclusion

This was a some what meaningful improvement because it was based on evidence from evaluation rather than guesswork. The prompt refinement some what improved the user-facing answer quality while keeping the facts grounded in the same deterministic output.
