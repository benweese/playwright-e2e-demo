# Brands API — API test plan

**Source:** https://automationexercise.com/api_list, APIs 3 and 4 (wording below is the page's own)
**Spec file:** `tests/api/brands/brands.spec.ts` (create)
**Clients:** Brands (`api/BrandsClient.ts`, new)

## Acceptance criteria

1. **AC-1** (API 3) — GET /brandsList returns Response Code 200 with the JSON "All brands list".
2. **AC-2** (API 4) — PUT /brandsList returns Response Code 405 with the message "This request method is not supported."

## Clients to add

- `api/BrandsClient.ts` (new file, class `BrandsClient extends ApiBase`, `bodyType: "form"`, exported instance `Brands`, JSDoc on every method, pattern in `api/CLAUDE.md`):
    - `list()` → `GET /brandsList`, typed `BrandList`
    - `listWithPut()` → `PUT /brandsList` (no body), typed `ApiEnvelope`
- `api/types.ts` — add `Brand` (`id: number`, `brand: string`) and `BrandList extends ApiEnvelope { brands: Brand[] }`. The field names are not in the docs; confirm them when the schema is generated.

## Helpers

- Reuse: `expectResponseCode`, `validateJsonSchema`, `generateTestDescription`, `TAGS`
- Create: none
- Schemas to generate and review: `brands/brandsList`, `brands/apiMessage`

## Already covered

| id   | Description          | Skip / Extend |
| ---- | -------------------- | ------------- |
| none | no brand tests exist | n/a           |

## Scenarios

### Brands API (test.describe)

#### #0009 — GET /brandsList returns all brands

**Covers:** AC-1
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Brands.list()`
**Steps:**

1. Send GET /brandsList.
   **Expected:**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("brands/brandsList", body)`
- `body.brands` has at least one entry

#### #0010 — PUT /brandsList is not supported

**Covers:** AC-2
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Brands.listWithPut()`
**Steps:**

1. Send PUT /brandsList with no body.
   **Expected:**

- `expectResponseCode(response, 405)`
- `validateJsonSchema("brands/apiMessage", body)`
- `body.message` is "This request method is not supported."

## Open questions

- Brand field names in the list body are undocumented ("All brands list"); the schema is generated from the real response and reviewed by hand, which is the only use of the live API.
- Other verbs on /brandsList (POST, DELETE) are not documented; none planned.
