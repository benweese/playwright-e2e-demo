# plans/

One plan per feature, `plans/<feature>.md`: the written test cases. Planner agents write them, a human reviews them, and generators turn each scenario into one test. Plans are committed and kept in sync when tests change.

## Format

1. **Header:** the source (the description as given, or the requirements file path), the spec file to create or extend, and the clients or page objects it uses.
2. **Acceptance criteria:** numbered, testable statements of what should be true, `AC-1`, `AC-2`, ... in the requirement's own words where there is one.
3. **Scenarios**, grouped as they will be in `test.describe` blocks. Each has:
    - an id heading: `#### #0012 — <title>`
    - `**Covers:** AC-1, AC-3`
    - `**Tags:**` from `TAGS` (`TAGS.API` or `TAGS.UI`, plus `TAGS.SMOKE`, `TAGS.REGRESSION`, `TAGS.A11Y` or `TAGS.SLOW` where they apply)
    - steps a person could follow by hand: concrete inputs, one action per step
    - the expected result, observable and specific
4. **Already covered:** existing tests that cover a criterion, so nothing is duplicated.
5. **Open questions** and **site changes needed** (e.g. an element with no label or test id).

Every acceptance criterion is covered by at least one scenario, or the plan says why not.

## Ids

- Ids are numbers, unique across the whole repo: `#0012` in the plan is `id: 12` in the test. They say nothing about the area or kind of test; tags do that.
- A new scenario takes the next number after the highest id in use, counting both the specs and every plan (including scenarios not generated yet). `npm run check:ids` prints the highest id in the specs.
- Never reuse or renumber an id, even after a test is deleted.
