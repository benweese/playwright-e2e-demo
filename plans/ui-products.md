# Products (list, search, product detail) — UI test plan

**Source:** https://automationexercise.com/test_cases, Test Cases 8 and 9 (wording below is the page's own)
**Page reference:** `docs/pages/products.md`, `docs/pages/product-details.md`, `docs/pages/home.md`
**Spec file:** `tests/ui/specs/products.spec.ts` (create; `tests/ui/specs/` is empty)
**Files:** create `locators/productsLocators.ts` + `pages/ProductsPage.ts`, `locators/productDetailsLocators.ts` + `pages/ProductDetailsPage.ts`; reuse `Products.list()` / `Products.search()` from `api/ProductsClient.ts` for expected values. No product ids or names are hardcoded: each test picks its product from `Products.list()` at run time.

Session rule: nothing here touches the cart, so these run in the shared logged-in session. Do not click "Add to cart" in this spec; cart scenarios are in `ui-cart.md`.

## Acceptance criteria

1. **AC-1** (TC8) — "Click on 'Products' button. Verify user is navigated to ALL PRODUCTS page successfully. The products list is visible."
2. **AC-2** (TC8) — "Click on 'View Product' of first product. User is landed to product detail page."
3. **AC-3** (TC8) — "Verify that detail is visible: product name, category, price, availability, condition, brand." (Values must match the product's data in the products API.)
4. **AC-4** (TC9) — "Enter product name in search input and click search button. Verify 'SEARCHED PRODUCTS' is visible."
5. **AC-5** (TC9) — "Verify all the products related to search are visible." (Read as: a shown product is "related" to the term if its name, category or brand contains the term, ignoring case. Expected category and brand come from `Products.list()`, matched by product name.)
6. **AC-6** (derived; Approved by repo owner) — A search term that matches nothing shows "Searched Products" and no products.

## Already covered

| id    | Description                                          | Skip / Extend         |
| ----- | ---------------------------------------------------- | --------------------- |
| #0002 | `tests/smoke/site-up.spec.ts`: products API responds | Different layer; skip |

## Scenarios

### All products (test.describe)

#### #0026 — The Products link opens the All Products page with a product list

**Covers:** AC-1
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Steps:**

1. Open `/`
2. Click "Products" in the header
   **Expected:**

- URL is `/products`
- Heading "All Products" is visible
- At least one product card is visible, and every card has a "View Product" link (count of cards equals count of "View Product" links)

### Product detail (test.describe)

#### #0027 — View Product on the first product opens its detail page with every detail

**Covers:** AC-2, AC-3
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** `Products.list()`; take the first product (expect the list non-empty with a hard `expect`). It gives `id`, `name`, `category`, `price`, `brand`.
**Steps:**

1. Open `/products`
2. In the first product card, click "View Product"
   **Expected:**

- URL is `/product_details/<id of the card clicked>` and the id matches the API's first product (the card order on the page is the API order; if it ever differs, that is a finding)
- Heading level 2 inside the product information shows the API `name`
- Category text shows the API category in the form "Category: Women > Tops"
- Price shows the API `price` ("Rs. N")
- "Availability:" is present and has a value; "Condition:" is present and has a value
- Brand text shows "Brand: <API brand>"
- Quantity input shows 1; "Add to cart" button is visible (do not click)
  Use `expect.soft` for the property checks.

#### #0028 — Product detail page opened by URL shows the same details

**Covers:** AC-3
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** `Products.list()`; pick the last product (a different one from #0027).
**Steps:**

1. Open `/product_details/<id>` using the product's API id
   **Expected:**

- Title is "Automation Exercise - Product Details"
- Name, category, price, brand match the API values (soft assertions)
- "Availability:" and "Condition:" have values

### Search (test.describe)

#### #0029 — Searching by a product name word shows Searched Products with only related products

**Covers:** AC-4, AC-5
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Setup:** `Products.list()`; take the first word of the first product's name as the term (e.g. the word "Blue" from "Blue Top"), so that at least that product must match. Do not hardcode it. Keep the list to look up each shown product's category and brand by name.
**Steps:**

1. Open `/products`
2. Enter the term in the search box
3. Click the search button
   **Expected:**

- URL contains `search=<term>`
- Heading "Searched Products" is visible
- At least one product card is shown, including the product the term came from
- For every card shown, the product (matched by name in `Products.list()`) is related: its name, category or brand contains the term, ignoring case (soft assertion per card)
- No count is asserted (the site's data is shared and can change)

#### #0030 — Search ignores letter case

**Approved by repo owner** (derived scenario).
**Covers:** AC-5
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** the same term as #0029, derived the same way.
**Steps:**

1. Open `/products`
2. Search the term in UPPER CASE
   **Expected:**

- "Searched Products" is visible
- For every card shown, the product (matched by name in `Products.list()`) is related: its name, category or brand contains the term, ignoring case; the product the term came from is shown

#### #0031 — Searching for text that matches no product shows no products

**Approved by repo owner** (derived scenario).
**Covers:** AC-6
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/products`
2. Search for a unique nonsense term built from a faker string (letters only, e.g. 20 random lowercase letters)
   **Expected:**

- Heading "Searched Products" is visible
- No product card is shown (zero "View Product" links)
- The search box still holds the typed term

## Site changes needed

- **Search button**: icon only, no accessible name or `data-*` attribute. The repo allows exactly this id: locate it with `#submit_search`. No `// Fixme:` needed. An `aria-label="Search"` would still be better.
- **Product cards** (`.product-image-wrapper`): no role, name or test id, and each name, price and "Add to cart" appears twice (visible block plus hover overlay). Needs `role="listitem"` (inside a `list`) or `<article>` with an accessible name, or a `data-qa="product-<id>"`. The plan locates the card through its "View Product" link (one per card) and reads the name from the card; where that is impossible the generator writes the best allowed locator with a `// Fixme:`. `data-product-id` appears on the "Add to cart" link inside each card and can anchor a card container (`filter({ has: page.locator('[data-product-id="<id>"]') })`), but it is on both the visible link and its overlay copy, so the container must still be made unique without `.first()`/`.nth()`.
- **Product name text on a card and its price:** plain `p` / `h2`, no test id. Same remedy as cards.
- **Product detail fields** (price span, Category, Availability, Condition, Brand `p` elements): no test ids. Needs `data-qa` on each, or a definition list.
- **Quantity input**: its `Quantity:` label is not associated with it; it has role `spinbutton` and is findable by role, but a `for` attribute would give it a name.
- **Slider and carousel arrows** have no names (relevant to the a11y plan).

## Open questions

- **Unknown product id.** `/product_details/9999` and `/product_details/0` return HTTP 200 with a blank page (empty name, "Brand: ", "Availability: In Stock", "Condition: New"). Probably wrong: expected a not-found page. No scenario is planned. Confirm the intended behaviour, then add one.
- **Non-numeric id** (`/product_details/abc`) shows a Django debug 404 page (leaks URL patterns). No scenario planned; should be reported as a bug.
- **No results message.** Search with no matches shows no text at all (just the heading). Is a "no products found" message expected? #0031 asserts only what the test case allows (heading, zero cards).
- **Empty search.** An empty or whitespace search shows the full list under "All Products" and `search=` in the URL. Not planned; confirm expected.
- **Review (TC21)** and **category / brand pages (TC18, TC19)** are in the site's test cases but were not requested. Not planned.
- **Card order vs API order** in #0027 is assumed equal.
