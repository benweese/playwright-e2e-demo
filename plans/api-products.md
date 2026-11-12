# Products API — API test plan

**Source:** https://automationexercise.com/api_list, APIs 1, 2, 5, 6 (wording below is the page's own)
**Spec file:** `tests/api/products/products.spec.ts` (create; `tests/api/` has no specs yet)
**Clients:** Products (`api/ProductsClient.ts`)

## Acceptance criteria

1. **AC-1** (API 1) — GET /productsList returns Response Code 200 with the JSON "All products list".
2. **AC-2** (API 2) — POST /productsList returns Response Code 405 with the message "This request method is not supported."
3. **AC-3** (API 5) — POST /searchProduct with parameter `search_product` (for example: top, tshirt, jean) returns Response Code 200 with the JSON "Searched products list".
4. **AC-4** (API 6) — POST /searchProduct without the `search_product` parameter returns Response Code 400 with the message "Bad request, search_product parameter is missing in POST request."

## Clients to add

- `api/ProductsClient.ts` — `listWithPost()` → `POST /productsList` (no body), typed `ApiEnvelope`
- `api/ProductsClient.ts` — `searchWithoutTerm()` → `POST /searchProduct` (no body, no `search_product`), typed `ApiEnvelope`

## Helpers

- Reuse: `expectResponseCode` (every scenario), `validateJsonSchema`, `generateTestDescription`, `TAGS`
- Create: none
- Schemas to generate (per `schemas/CLAUDE.md`, generate with `UPDATE_SCHEMAS=true`, then review by hand): `products/productsList`, `products/searchProduct`, `products/apiMessage` (the `{responseCode, message}` body, shared by #0006 and #0008)

## Already covered

| id    | Description                                                                      | Skip / Extend                                                                      |
| ----- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| #0002 | `tests/smoke/site-up.spec.ts`: products API responds (200, at least one product) | Extend: it checks neither schema nor the documented body, so #0005 is still needed |

## Scenarios

### Products API (test.describe)

#### #0005 — GET /productsList returns all products

**Covers:** AC-1
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Products.list()`
**Steps:**

1. Send GET /productsList.
   **Expected:**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("products/productsList", body)`
- `body.products` has at least one entry

#### #0006 — POST /productsList is not supported

**Covers:** AC-2
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Products.listWithPost()`
**Steps:**

1. Send POST /productsList with no body.
   **Expected:**

- `expectResponseCode(response, 405)`
- `validateJsonSchema("products/apiMessage", body)`
- `body.message` is "This request method is not supported."

#### #0007 — POST /searchProduct returns the searched products list

**Covers:** AC-3
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Products.search(term)` for `term` in `top`, `tshirt`, `jean`
**Steps:**

1. For each of the three example terms, send POST /searchProduct with `search_product` set to the term.
   **Expected (for each term):**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("products/searchProduct", body)`
- `body.products` has at least one entry
- Not asserted: that results match the term (match semantics are undocumented; see Open questions)

#### #0008 — POST /searchProduct without search_product is a bad request

**Covers:** AC-4
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Products.searchWithoutTerm()`
**Steps:**

1. Send POST /searchProduct with no `search_product` parameter.
   **Expected:**

- `expectResponseCode(response, 400)`
- `validateJsonSchema("products/apiMessage", body)`
- `body.message` is "Bad request, search_product parameter is missing in POST request."

## Open questions

- The docs do not say how search matches (name only? category? brand? case-insensitive?) or what an unmatched term returns, so #0007 asserts no match semantics (only that each example term returns at least one product, per owner decision). The existing `Products.search` JSDoc says "product names"; confirm before adding a name-contains assertion.
- Out of scope (owner decision): empty `search_product` value, GET /searchProduct and other verbs on these paths are not documented; no scenarios planned.
- Does the 405/400 body carry the same `message` text on every call, and is `responseCode` the only other field? Needed to fix the `products/apiMessage` schema.
