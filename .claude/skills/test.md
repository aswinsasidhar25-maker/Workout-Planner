---
name: test
description: Run all tests after code modifications. Sanity-checks existing features and rigorously tests new features.
user_invocable: true
---

# /test — Post-Modification Test Skill

Run the full test suite to verify that existing features still work (sanity) and new/changed features are bug-free (rigorous).

## Steps

1. **Run the full test suite:**
   ```bash
   cd /home/user/Workout-Planner && npx vitest run 2>&1
   ```

2. **Analyze the results:**
   - If ALL tests pass → report success with a summary of test counts
   - If ANY test fails → read the failing test file and the source file it tests, diagnose the root cause, fix the code (not the test, unless the test expectation is wrong), and re-run

3. **Re-run after fixes:**
   ```bash
   cd /home/user/Workout-Planner && npx vitest run 2>&1
   ```
   Repeat until all tests pass.

4. **Report:**
   - Total test count and pass/fail breakdown
   - Summary of any fixes made
   - Any warnings or suggestions for additional test coverage

## Test Categories

| File | Category | Purpose |
|------|----------|---------|
| `src/utils/calories.test.js` | Sanity | Unit conversions, MET calorie formula |
| `src/context/AppContext.test.js` | Sanity + Rigorous | All reducer actions, bidirectional weight sync |
| `src/test/bmi.test.js` | Rigorous | BMI formula, category boundaries, scale bar positioning |
| `src/test/planGeneration.test.js` | Sanity | Plan structure, exercise filtering, split templates |

## When to Use

Run `/test` after ANY code modification to catch regressions before they reach production.
