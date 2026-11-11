# api/

One client class per API area, extending `ApiBase` from commons, exported as a single instance. Specs call client methods, never `request` directly.

## The site's API

- Endpoints are listed at https://automationexercise.com/api_list.
- **It always returns HTTP 200**, with a `text/html` content type, and puts the real status in the body: `{ "responseCode": 404, "message": "User not found!" }`. Specs check it with `expectResponseCode(response, code)` from `helpers/` (see `tests/api/CLAUDE.md`). Commons' `errorCheck(response, 404)` would always fail here.
- **Request bodies are form-encoded.** Every client passes `bodyType: "form"` to `ApiBase`.

## Writing a client

- **Type each response once, in the client method.** Add the body's shape to `types.ts` and name it: `this.get<ProductList>("productsList")`. Playwright types the response (`APIResponse<ProductList>`), so `expectResponseCode`, `getBody`, `pollUntil` and `response.json()` all return a `ProductList` without the spec naming it. Every body extends `ApiEnvelope` (`responseCode`, `message`).
- **JSDoc on every method** (lint enforces it): the HTTP method and path, the `responseCode` to expect, and a `@param` for each parameter.
- Extend an existing client for the same area instead of adding a second one.

Existing clients: `AccountsClient.ts` (`Accounts`), `ProductsClient.ts` (`Products`). For example, a client to add for brands:

```ts
// api/BrandsClient.ts
import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config";
import type { BrandList } from "./types";

/** Client for the brand endpoints. Use the exported {@link Brands} instance. */
class BrandsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	/** GET /brandsList. Expect `responseCode` 200 with every brand. */
	list() {
		return this.get<BrandList>("brandsList");
	}
}

/** The brand API client. */
export const Brands = new BrandsClient();
```

Request bodies are built in `payloads/` (typed, with faker data), e.g. `buildAccount()` for `Accounts.create`.
