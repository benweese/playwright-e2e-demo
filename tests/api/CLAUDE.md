# tests/api/

API specs, one folder per area: `tests/api/<area>/<name>.spec.ts`. Clients and response types are in `api/` (see `api/CLAUDE.md`).

## Writing a spec

- Tag every test `TAGS.API`. Call client methods; never use `request` directly.
- **Check every response with `expectResponseCode(response, code)`** from `helpers/`, for success and error cases alike. The site's API always answers HTTP 200 and puts the real status in `responseCode`. `expectResponseCode` asserts HTTP 2xx, parses the JSON, soft-asserts `responseCode`, and returns the body typed by the client.
- Then validate the body's shape with `validateJsonSchema` (see below), then assert only the values this test is about.
- A test that creates data (an account, say) deletes it in a `finally` or `afterAll`.

For example, a products spec:

```ts
// tests/api/products/products.spec.ts
import { generateTestDescription, TAGS, validateJsonSchema } from "@benweese/playwright-test-commons";
import { test, expect } from "../../../fixtures/test";
import { Products } from "../../../api/ProductsClient";
import { expectResponseCode } from "../../../helpers";

test.describe("Products API", () => {
	test(
		generateTestDescription({ id: 12, description: "lists all products", tags: [TAGS.API, TAGS.REGRESSION] }),
		async () => {
			const body = await expectResponseCode(await Products.list(), 200); // a ProductList
			await validateJsonSchema("products/productsList", body);
		}
	);

	test(
		generateTestDescription({ id: 13, description: "search finds matching products", tags: [TAGS.API] }),
		async () => {
			const body = await expectResponseCode(await Products.search("top"), 200);
			for (const product of body.products) {
				expect.soft(product.name.toLowerCase()).toContain("top");
			}
		}
	);

	test(
		generateTestDescription({ id: 14, description: "POST to productsList is not supported", tags: [TAGS.API] }),
		async () => {
			await expectResponseCode(await Products.post("productsList"), 405);
		}
	);
});
```

## Schemas

- `validateJsonSchema("products/productsList", body)` validates against `schemas/products/productsList.schema.json`, and also checks every date-like field.
- **New endpoint:** run the test once with `UPDATE_SCHEMAS=true npx playwright test --grep "<test id>"` (or `{ update: true }` in the call) to generate the schema from the real response, then follow `schemas/CLAUDE.md`. Never commit `update: true`.

## Dates

- Automatic: every `validateJsonSchema` call checks that fields whose key ends in `At`/`Date`/`_at`/`_date` (or is `date`, `timestamp`) are valid ISO 8601 dates, rejecting impossible dates like `2026-02-30`.
- Direct: `isIsoDate(value)`, `expectValidDate(value, { format })`, `expectDateBetween(value, from, to)`, `expectSortedByDate(items, key, "desc" | "asc")`.

## Waiting and timing

- `pollUntil(() => Client.call(), (body) => condition)` for anything that settles over time; `body` has the client's type. Never a fixed wait.
- `timingCheck(() => Client.call(), maxAverageMs, { runs, warmup })` for response-time checks. It uses Playwright's `response.timing()`: each call is timed from request sent to last byte, so connection setup doesn't count, and one warm-up call is skipped by default. It returns `{ averageMs, durations, timeToFirstByte }`. The live site is shared and slow at times, so keep limits generous and tag timing tests `@slow`.
