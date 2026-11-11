# CLAUDE.md

Playwright API and UI tests for https://automationexercise.com, a public practice shop, written in TypeScript.

This file holds what applies everywhere. Each folder with its own rules has a `CLAUDE.md` of its own. **Before working in one of these folders, read its `CLAUDE.md`:**

| Folder         | Read it for                                                                       |
| -------------- | --------------------------------------------------------------------------------- |
| `api/`         | API clients and response types; the API's quirks (always HTTP 200, form bodies)   |
| `tests/api/`   | Writing API specs: status checks, schemas, dates, polling, response times         |
| `schemas/`     | Generating, reviewing and updating JSON schemas                                   |
| `tests/ui/`    | Writing UI tests: locators → page objects → specs, locator rules, being logged in |
| `tests/setup/` | The account setup and teardown around the ui project                              |
| `plans/`       | The plan format: acceptance criteria, scenario ids, coverage                      |

The suite is built on two other repos:

- **[playwright-test-commons](https://github.com/benweese/playwright-test-commons)** (`@benweese/playwright-test-commons`): `ApiBase`, `getBody`, `validateJsonSchema`, the date helpers, `BasePage`, `generateTestDescription`, `TAGS`, with type definitions. Installed from a git tag (`github:benweese/playwright-test-commons#v0.5.1`). Change it in that repo, tag a new version and install that tag here; never patch `node_modules`.
- **[playwright-ai-qa-agents](https://github.com/benweese/playwright-ai-qa-agents)**: the `playwright-qa-agents` Claude Code plugin that plans, writes, runs and heals tests here.

## Layout

```
api/                 API clients and response types                  (see api/CLAUDE.md)
config/index.ts      `config`: site URLs, debug switch, auth file paths; the only place tests read settings from
fixtures/test.ts     `test` and `expect` for every spec, with ads blocked
helpers/             expectResponseCode, readTestUser (exported from helpers/index.ts)
payloads/            faker request builders, typed
schemas/             JSON schemas for API responses                  (see schemas/CLAUDE.md)
tests/smoke/         @smoke checks
tests/setup/         account setup and teardown                      (see tests/setup/CLAUDE.md)
tests/api/           API specs                                       (see tests/api/CLAUDE.md)
tests/ui/            locators, pages, specs, data                    (see tests/ui/CLAUDE.md)
plans/               test plans, local and git-ignored               (see plans/CLAUDE.md)
docs/pages/          page references written by the page-mapper agent
.playwright/         playwright-cli settings, used by the agents
```

## Commands

Run Playwright directly from the repo root, where `playwright.config.ts` lives:

```bash
npx playwright test                                         # every project
npx playwright test --project=smoke                         # quick "is it up" checks
npx playwright test --grep "#0002"                          # one test, by its id
npx playwright test tests/smoke/site-up.spec.ts --headed    # one file, in a visible browser
npx playwright test --project=api --reporter=line           # one project, compact output
npx playwright show-report                                  # open the last HTML report
npm run lint                                                # ESLint (incl. JSDoc) + type-check + test id check
npm run lint:fix
```

`npm test`, `npm run test:smoke`, `npm run test:api`, `npm run test:ui` and `npm run report` are shortcuts for the same commands.

## Rules for every test

- **Import `test` and `expect` from `fixtures/test`**, never from `@playwright/test`. The fixture blocks the site's ads and tracking scripts, which otherwise swallow clicks and stall page loads. Lint enforces this.
- **Title:** `generateTestDescription({ id, description, tags })`. The `id` is the scenario's number from the plan: `#0012` in the plan is `id: 12` in code, and the title shows `#0012`. One plan scenario = one test, same id.
- **Ids are unique numbers across the whole repo.** They say nothing about the area or kind of test. A new scenario takes the next number after the highest one in use (`npm run check:ids` prints it, and local plans may hold numbers not generated yet). `npm run lint` fails on a missing or duplicate id, and on a spec with no `@smoke`, `@api` or `@ui` tag.
- **Tags say what kind of test it is:** from `TAGS`. Every test needs at least one of `@smoke`, `@api`, `@ui`, or it runs in no project. Add `@regression`, `@a11y` or `@slow` where they apply. Select by kind with `--grep @smoke`, never by an id range.
- **No hardcoded URLs or data ids.** URLs come from `baseURL`/`config`; other shared values go in `config/index.ts`.
- **Assert what the plan says should happen, not what you observe.** If the site disagrees with the plan, the test fails and the mismatch is reported. Never change an assertion to match a bug.
- **Soft assertions** (`expect.soft`) for property checks, so one run reports every failure. Hard `expect` only when later steps depend on the value.
- **No fixed waits** (`waitForTimeout`) and no `networkidle`. Use web-first assertions, or `pollUntil` for eventually-consistent APIs.
- **Shared public data.** Other people use the site too. Never assert on data you didn't create (e.g. "the cart is empty") unless the test set it up.
- **Clean up what you create.** A test that creates data deletes it in a `finally` or `afterAll`.
- **Extend, don't duplicate.** If a spec for the area exists, add to it.

## TypeScript

- Everything is TypeScript with `strict` on. Playwright runs `.ts` directly; there is no build step. `npm run lint` runs `tsc` to type-check.
- Relative imports have no extension: `import { config } from "../../config"`.
- Use `import type` for type-only imports (lint enforces it). Avoid `any`; lint warns on it.

## Documentation

- **JSDoc on reusable code.** Every client method, page object method, locator factory, helper, payload builder and fixture gets a JSDoc: one-line summary, `@param` for each parameter, `@returns`, `@throws` if it can throw, and an `@example` where usage isn't obvious. Lint enforces it in `api/`, `config/`, `fixtures/`, `helpers/`, `payloads/` and `tests/ui/locators|pages|data/`.
- **Specs are documented by their titles and plans**, not by comments.
- **Comments explain why, never what.** Keep a comment only for something the code can't say, such as a site quirk or a non-obvious choice.
- **Folder `CLAUDE.md` files** hold the rules for their folder; this file holds what applies everywhere. Put a new rule in the most specific file it applies to.

## Dependencies

- Keep dependencies on their latest versions. Exceptions: **TypeScript is held at 6.x** until typescript-eslint supports 7, and **`playwright` is pinned to the same version as `@playwright/test`**. `@playwright/cli` (used by the agents' page-mapper) depends on a pre-release `playwright`; without the explicit `playwright` dev dependency, npm hoists that pre-release, `npx playwright test` runs it, and Playwright fails with "did not expect test() to be called here". When you upgrade `@playwright/test`, upgrade `playwright` to the same version.
- **`minimatch` is overridden to 11.x** in `package.json` to fix [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): ESLint and typescript-eslint still ask for 10.x, and every 10.x is affected. Remove the override once they require 11 themselves.
- Node `^22.22.2 || >=24.15.0` (`engines` in `package.json`), the range `eslint-plugin-jsdoc` supports.

## Claude Code plugin

`.claude/settings.json` enables `playwright-qa-agents` from the `benweese/playwright-ai-qa-agents` marketplace.

```
author-tests skill:  description → planner → YOU REVIEW → generator → run → (healer, UI only)
```

- `/playwright-qa-agents:author-tests <feature description, URL, or path to a requirements file>`
- `/playwright-qa-agents:run-spec <spec path | project | test id>`
- `/playwright-qa-agents:check [fix]` – lint
- `/playwright-qa-agents:bug-report <description>` – writes a bug report to `bugs/`
- `/playwright-qa-agents:update-docs [path]` – brings READMEs, `CLAUDE.md` files and JSDoc up to date

## Git

Branch off `main` as `feature/<short-description>`; open a PR. Don't commit generated reports, `.auth/` or `.env`.
