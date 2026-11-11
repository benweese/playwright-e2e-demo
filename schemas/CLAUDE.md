# schemas/

JSON schemas for API response bodies, one per endpoint: `schemas/<area>/<name>.schema.json`. A spec uses one with `validateJsonSchema("<area>/<name>", body)`.

- **Generate, don't hand-write.** Run the test once with `UPDATE_SCHEMAS=true npx playwright test --grep "<test id>"`. Commons writes a strict draft-07 schema from the real response: `additionalProperties: false` on every object, and fields that were null become `["null", "string"]`.
- **Review before committing.** One response can't show everything, so tighten the generated schema by hand: mark the `required` fields, add `enum` for fixed values and `format` for dates, emails and URLs, and fix any `["null", "string"]` whose real type you know.
- **Keep them strict.** `additionalProperties: false` stays, so a new or renamed field fails a test until someone updates the schema on purpose. Never loosen a schema to make a failing test pass; that is an API change to report.
- **Updating:** regenerate with `UPDATE_SCHEMAS=true` for the one test, compare the diff, and keep your hand edits.
- Never commit `{ update: true }` in a spec, or leave `UPDATE_SCHEMAS` on: every run would rewrite the schema from the response and hide real changes.
