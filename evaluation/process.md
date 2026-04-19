1. Evaluation plan:
    - Use evaluation/cases.md, evaluation/README.md, and dashboard_app/sample_gold_repository.js
    - 5 representative cases & 2 failure cases, and baseline confrimation.

2. Upstream evaluation: 
    - Use tests/python/test_gold_generation.py and then record the result in evaluation/results.md.
    - Fill in the Silver -> Gold Transformation Accuracy Table in evaluation/results.md.
    - Commands:
        - python -m unittest discover -s tests/python -p "test_gold_generation.py" -v 
        - python -m unittest discover -s tests/python -p "test_*.py" -v

3. App Behavior and Fallback checks:
    - Use tests/javascript/answer_engine.test.js, tests/javascript/openai_formatter.test.js, tests/javascript/answer_route.test.js, and tests/javascript/dashboard.route.test.js. Then record the relevant result in evaluation/results.md.
    - Before running these tests in a shell that previously used OpenAI, clear the OpenAI environment variables so the tests use a clean environment.
    - Commands: 
        - Remove-Item Env:OPENAI_ENABLED -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue
        - node --test tests/javascript/answer_engine.test.js
        - node --test tests/javascript/openai_formatter.test.js
        - node --test tests/javascript/answer_route.test.js
        - node --test tests/javascript/dashboard.route.test.js

4. Run the lightweight baseline.
    - Use the same representative cases from evaluation/cases.md. The stable local data source is dashboard_app/sample_gold_repository.js. Fill the Baseline rows in evaluation/results.md.
    - The display text for baseline comes from dashboard_app/fallback_formatter.js.
    - Commands:
        - $env:OPENAI_ENABLED='false'
        - $env:DASHBOARD_GOLD_REPOSITORY_MODE='local'
        - npm start
        - http://127.0.0.1:3000/?city=toronto&questionId=q1_30_day_outlook
        - http://127.0.0.1:3000/?city=ottawa&questionId=q2_7_day_average_temp
        - http://127.0.0.1:3000/?city=montreal&questionId=q3_great_outdoor_days
        - http://127.0.0.1:3000/?city=calgary&questionId=q1_30_day_outlook
        - http://127.0.0.1:3000/?city=vancouver&questionId=q2_7_day_average_temp

5. Run the current OpenAI-formatted version before changing anything:
    - Use dashboard_app/openai_formatter.js and the same 5 cases from evaluation/cases.md. Fill the Before Improvement rows in evaluation/results.md.
    - Commands:
        - $env:OPENAI_ENABLED='true'
        - $env:OPENAI_API_KEY='your-api-key-here'
        - $env:OPENAI_MODEL='gpt-5.4-mini'
        - $env:DASHBOARD_GOLD_REPOSITORY_MODE='local'
        - npm start
        - http://127.0.0.1:3000/?city=toronto&questionId=q1_30_day_outlook
        - http://127.0.0.1:3000/?city=ottawa&questionId=q2_7_day_average_temp
        - http://127.0.0.1:3000/?city=montreal&questionId=q3_great_outdoor_days
        - http://127.0.0.1:3000/?city=calgary&questionId=q1_30_day_outlook
        - http://127.0.0.1:3000/?city=vancouver&questionId=q2_7_day_average_temp

6. Run failure case F1 for Before Improvement:
    - Use tests/javascript/openai_formatter.test.js, dashboard_app/answer_formatter.js, and evaluation/results.md.
    - Purpose:
        - capture the OpenAI failure behavior before the prompt change
        - fill the `F1 | Before Improvement` row in evaluation/results.md
    - Commands:
        - Remove-Item Env:OPENAI_ENABLED -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue
        - node --test tests/javascript/openai_formatter.test.js
        - npm test

7. Run failure case F2 for the Current App:
    - Use tests/javascript/answer_route.test.js, dashboard_app/app.js, and evaluation/results.md.
    - Purpose:
        - capture the missing or empty Gold behavior once
        - fill the `F2 | Current App` row in evaluation/results.md
    - Commands:
        - Remove-Item Env:OPENAI_ENABLED -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue
        - node --test tests/javascript/answer_route.test.js
        - npm test

8. Make the Part 4 improvement:
    - Edit dashboard_app/openai_formatter.js.
    - If needed, also use tests/javascript/openai_formatter.test.js and dashboard_app/answer_formatter.js.
    - Purpose:
        - refine the prompt so the answer sounds more natural while staying factual
    - Commands after editing:
        - $env:OPENAI_ENABLED='true'
        - $env:OPENAI_API_KEY='your-api-key-here'
        - $env:OPENAI_MODEL='gpt-5.4-mini'
        - $env:DASHBOARD_GOLD_REPOSITORY_MODE='local'
        - node --test tests/javascript/openai_formatter.test.js
        - npm test

9. Re-run the same 5 representative cases after the prompt change:
    - Use evaluation/cases.md again and fill the After Improvement rows in evaluation/results.md.
    - Commands:
        - $env:OPENAI_ENABLED='true'
        - $env:OPENAI_API_KEY='your-api-key-here'
        - $env:OPENAI_MODEL='gpt-5.4-mini'
        - $env:DASHBOARD_GOLD_REPOSITORY_MODE='local'
        - npm start
        - http://127.0.0.1:3000/?city=toronto&questionId=q1_30_day_outlook
        - http://127.0.0.1:3000/?city=ottawa&questionId=q2_7_day_average_temp
        - http://127.0.0.1:3000/?city=montreal&questionId=q3_great_outdoor_days
        - http://127.0.0.1:3000/?city=calgary&questionId=q1_30_day_outlook
        - http://127.0.0.1:3000/?city=vancouver&questionId=q2_7_day_average_temp

10. Run failure case F1 again for After Improvement:
    - Use tests/javascript/openai_formatter.test.js, dashboard_app/answer_formatter.js, and evaluation/results.md.
    - Purpose:
        - confirm the prompt change did not break fallback behavior
        - fill the `F1 | After Improvement` row in evaluation/results.md
    - Commands:
        - Remove-Item Env:OPENAI_ENABLED -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
        - Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue
        - node --test tests/javascript/openai_formatter.test.js
        - npm test

11. Do the deployed smoke check:
    - Use the live app URL already listed in evaluation/results.md and mark the result there.
    - Commands:
        - Start-Process "https://aidi-2001-asg-5-atharshan-kennedy-w.vercel.app"
