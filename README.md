# playwright-e2e-demo

[![Tests](https://github.com/benweese/playwright-e2e-demo/actions/workflows/tests.yml/badge.svg)](https://github.com/benweese/playwright-e2e-demo/actions/workflows/tests.yml)

A Playwright API and UI test suite for [automationexercise.com](https://automationexercise.com), a public practice shop. It shows how I structure a test repo: a shared framework installed as a versioned dependency, page objects and API clients, strict schema checks, self-cleaning test data, and AI agents that write tests from a human-reviewed plan.

## How the three repos fit together

```mermaid
flowchart LR
    commons["<b>playwright-test-commons</b><br/>ApiBase · getBody · validateJsonSchema<br/>date checks · BasePage"]
    agents["<b>playwright-ai-qa-agents</b><br/>Claude Code plugin:<br/>planner · generator · healer"]
    demo["<b>playwright-e2e-demo</b> (this repo)<br/>clients · page objects · specs · plans"]
    site[("automationexercise.com<br/>UI + REST API")]
    commons -- "npm, pinned git tag" --> demo
    agents -- "plugin marketplace" --> demo
    demo -- "tests" --> site
```

| Repo                                                                           | Role                                                            |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| [playwright-test-commons](https://github.com/benweese/playwright-test-commons) | Site-agnostic framework code, unit tested, released as git tags |
| [playwright-ai-qa-agents](https://github.com/benweese/playwright-ai-qa-agents) | Claude Code agents that plan, generate, run and heal tests      |
| **playwright-e2e-demo**                                                        | This suite: everything specific to automationexercise.com       |

## Run it

```bash
git clone https://github.com/benweese/playwright-e2e-demo.git
cd playwright-e2e-demo
npm ci
npx playwright install chromium
npx playwright test                    # all projects
npx playwright test --project=smoke    # is the site up
npx playwright show-report             # open the HTML report
```

You don't need accounts or credentials. The setup project creates a throwaway account through the API and deletes it at the end of the run.

## What's worth a look

|                                      |                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Self-cleaning auth**               | [`tests/setup/auth.setup.js`](tests/setup/auth.setup.js) creates an account via `POST /api/createAccount` with faker data, signs in through the UI and saves the session, so every `@ui` test starts logged in. [`auth.teardown.js`](tests/setup/auth.teardown.js) deletes the account and checks it's gone. The shared site is left as it was found. |
| **An API that always says 200**      | The site's API answers HTTP 200 with a `text/html` content type, even for errors, and puts the real status in the body. [`helpers/apiResponse.js`](helpers/apiResponse.js) asserts on `responseCode` instead, so error cases are real tests rather than false passes.                                                                                 |
| **Ads blocked at the network layer** | Full-page ad vignettes swallow clicks and make UI tests flaky. [`fixtures/test.js`](fixtures/test.js) aborts ad and tracking requests in every browser context, and lint makes sure no spec bypasses it.                                                                                                                                              |
| **Layered UI tests**                 | Locators → page object → spec ([`tests/ui/`](tests/ui/)). Specs contain no selectors. Locators are `getBy*` only, with no XPath and no `.nth()`, and lint enforces it.                                                                                                                                                                                |
| **Strict schemas**                   | Response schemas are generated from real responses, reviewed, and set to `additionalProperties: false`, so an unannounced API change fails a test. Date fields are checked on every validation.                                                                                                                                                       |
| **Plans as test cases**              | Each feature has a written plan in [`plans/`](plans/). Every scenario id (`PROD-003`) appears in its test title, so a failing test leads straight to its steps and expected result.                                                                                                                                                                   |
| **CI**                               | Lint, format check and the full suite on every push, PR and a daily schedule, with the HTML report uploaded as an artifact.                                                                                                                                                                                                                           |

## Layout

```
api/            API clients (one per area, extending ApiBase)
config/         environments + the resolved config
fixtures/       test/expect with ad blocking
helpers/        site-specific helpers
payloads/       faker request builders
schemas/        JSON schemas for responses
tests/smoke/    @smoke
tests/setup/    account create / delete
tests/api/      @api specs
tests/ui/       locators, pages, specs, data
plans/          written test plans
docs/pages/     page references used by the agents
```

[`CLAUDE.md`](CLAUDE.md) is the full guide to the repo's rules, which the AI agents also follow.

## Writing tests with the agents

With [Claude Code](https://claude.com/claude-code) open in this repo, the plugin is enabled automatically through `.claude/settings.json`:

```
/playwright-qa-agents:author-tests the product search page and POST /api/searchProduct
```

The agent maps the page and drafts a plan in `plans/`: acceptance criteria first, then the scenarios that cover them. Then it **stops for review**. Once the plan is approved, it generates the spec, runs it, and repairs UI locators with a three-attempt budget. If the site disagrees with the plan, the test stays failing and the agent offers a bug report. It doesn't rewrite the assertion to match.

## License

MIT
